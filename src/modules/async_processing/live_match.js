import { Cache, tll } from '../../utils/helper.js'
import { pool } from '../../utils/postgres.js'
import { supabaseRealtime } from '../../utils/supabase.js'
import { slotRange } from '../cricket_api/process_update.js'
import { matchSocket } from '../cricket_api/realtime.js'
import { matchIdToKey } from '../cricket_api/utils.js'
import { fetchLiveMatchScoreV1, fetchScoreCardV1 } from '../score_card.js'
import { liveRepeatCheck } from './cron.js'
import { asyncQueue, tasks } from './index.js'
import { processTickets } from './tickets.js'

export async function processLiveMatch(matchId) {
  const matchKey = await matchIdToKey(matchId)
  await matchSocket.listen(matchKey)

  await processTickets()
}

export async function startMatch({ matchId, toss }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { team1_id, team2_id, live } = await client.queryOne(
      'SELECT team1_id, team2_id, live FROM match WHERE id = $1',
      [matchId]
    )
    if (live == true) return

    // calulate batting & bowling team id from toss data
    let battingTeam
    if (toss.elected == 'bat') {
      battingTeam = toss.winner == 'a' ? team1_id : team2_id
    } else if (toss.elected == 'bowl') {
      battingTeam = toss.winner == 'a' ? team2_id : team1_id
    }
    const bowlingTeam = battingTeam == team1_id ? team2_id : team1_id

    const updateMatchQry = `UPDATE match SET team1_id = $1, team2_id = $2, live = TRUE WHERE id = $3;`
    await client.query(updateMatchQry, [battingTeam, bowlingTeam, matchId])

    const initialSlotQry = `
INSERT INTO bet_slot (match_id, batting_team, bowling_team, slot_range, innings)
VALUES ($1, $2, $3, 5, 0) ON CONFLICT (match_id) DO NOTHING;
`
    await client.query(initialSlotQry, [matchId, battingTeam, bowlingTeam])
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function endMatch({ matchId }) {
  await pool.query(`UPDATE match SET live = FALSE, ended = TRUE WHERE id = $1;`, [matchId])
  const isRemoved = await asyncQueue.removeRepeatableByKey(
    `${tasks.processLiveMatch}:${tasks.processLiveMatch}-${matchId}:::${liveRepeatCheck}`
  )
  console.log('removed processLiveMatch repeatble job', isRemoved)
}

export async function processBallUpdate(data) {
  // Added queue for processing tickets for current slot
  const currentSlot = data.rangeId
  if (!Cache.get(`ticket-${currentSlot}`)) {
    const ticketProcessQry = `
INSERT INTO ticket_processed (match_id, ball_range_id, team_id)
VALUES ($1, $2, $3) ON CONFLICT (match_id, ball_range_id, team_id) DO NOTHING;
`
    await pool.query(ticketProcessQry, [data.matchId, currentSlot, data.teamId])
    Cache.set(`ticket-${currentSlot}`, true, tll['5min'])
  }

  // update bet_slot
  if (!Cache.get(`bet_slot-${currentSlot}`)) {
    const nextSlot = currentSlot + slotRange
    const { last_slot } = await pool.queryOne('SELECT last_slot FROM match WHERE id = $1', [data.matchId])
    if (nextSlot > last_slot) {
      const query1 = 'SELECT innings, slot_range FROM bet_slot WHERE match_id = $1'
      const currentSlot = await pool.queryOne(query1, [data.matchId])

      if (currentSlot?.innings == 0) {
        await pool.query(
          'UPDATE bet_slot SET slot_range = 5, innings = 1, batting_team = bowling_team, bowling_team = batting_team WHERE match_id = $1;',
          [data.matchId]
        )
        await supabaseRealtime.send(`betSlot-${data.matchId}`, 'betSlot', { currentSlot: 5, lastSlot: last_slot })
      }

      if (currentSlot?.innings == 1 && currentSlot?.slot_range != 5) {
        await pool.query('DELETE FROM bet_slot WHERE match_id = $1;', [data.matchId])
      }
    } else {
      await pool.query('UPDATE bet_slot SET slot_range = $1 WHERE match_id = $2;', [nextSlot, data.matchId])
      await supabaseRealtime.send(`betSlot-${data.matchId}`, 'betSlot', { currentSlot: nextSlot, lastSlot: last_slot })
    }
    Cache.set(`bet_slot-${currentSlot}`, true, tll['5min'])
  }

  // Send Match Score Update
  const matchScore = await fetchLiveMatchScoreV1(data.matchId)
  await supabaseRealtime.send(`matchScore-${data.matchId}`, 'matchScore', matchScore)

  // Send Scorecard Update
  const scoreCard = await fetchScoreCardV1(data.matchId)
  await supabaseRealtime.send(`scoreCard-${data.matchId}`, 'scoreCard', { scoreCard })
}
