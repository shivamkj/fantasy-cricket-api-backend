import { Cache, supabase, tll } from '../../utils/helper.js'
import { pool } from '../../utils/postgres.js'
import { slotRange } from '../cricket_api/process_update.js'
import { matchSocket } from '../cricket_api/realtime.js'
import { matchIdToKey } from '../cricket_api/utils.js'
import { fetchLiveMatchScoreV1, fetchScoreCardV1, getTeamsId } from '../score_card.js'
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
    const { team1Id, team2Id } = await getTeamsId(matchId, client)

    // calulate batting & bowling team id from toss data
    let battingTeam
    if (toss.elected == 'bat') {
      battingTeam = toss.winner == 'a' ? team1Id : team2Id
    } else if (toss.elected == 'bowl') {
      battingTeam = toss.winner == 'a' ? team2Id : team1Id
    }
    const bowlingTeam = battingTeam == team1Id ? team2Id : team1Id

    const updateMatchQry = `UPDATE match SET team1_id = $1, team2_id = $2, live = TRUE WHERE id = $3;`
    await client.query(updateMatchQry, [battingTeam, bowlingTeam, matchId])

    const initialSlotQry = `
INSERT INTO bet_slot (match_id, batting_team, bowling_team, slot_range)
VALUES ($1, $2, $3, 5) ON CONFLICT (match_id) DO NOTHING;
`
    await client.query(initialSlotQry, [matchId, battingTeam, bowlingTeam])
  } catch (err) {
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
      // TODO: stop team swap several times
      await pool.query('UPDATE bet_slot SET slot_range = 5, batting_team = bowling_team, bowling_team = batting_team;')
    } else {
      await pool.query('UPDATE bet_slot SET slot_range = $1;', [nextSlot])
    }
    Cache.set(`bet_slot-${currentSlot}`, true, tll['5min'])
  }
  // Send Match Score Update
  const matchScore = await fetchLiveMatchScoreV1(data.matchId)
  const matchScoreChannel = supabase.channel(`matchScore-${data.matchId}`)
  await matchScoreChannel.send({ type: 'broadcast', event: 'matchScore', payload: matchScore })
  supabase.removeChannel(matchScoreChannel) // clean up the channel

  // Send Scorecard Update
  const scoreCard = await fetchScoreCardV1(data.matchId)
  const scoreCardChannel = supabase.channel(`scoreCard-${data.matchId}`)
  await scoreCardChannel.send({ type: 'broadcast', event: 'scoreCard', payload: { scoreCard } })
  supabase.removeChannel(scoreCardChannel) // clean up the channel
}
