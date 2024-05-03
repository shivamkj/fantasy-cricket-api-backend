import { supabase } from '../../utils/helper.js'
import { pool } from '../../utils/postgres.js'
import { currencyTypeArr } from '../constants.js'
import { addPlayers } from '../cricket_api/player.js'
import { matchSocket } from '../cricket_api/realtime.js'
import { matchIdToKey } from '../cricket_api/utils.js'
import { fetchLiveMatchScoreV1, fetchScoreCardV1 } from '../score_card.js'
import { asyncQueue } from './index.js'

export async function listenMatchUpdate(matchId) {
  const matchKey = await matchIdToKey(matchId)
  await matchSocket.listen(matchKey)
}

const defaultLobbies = [
  { title: 'Star 50', entry_price: 50, currency_type: currencyTypeArr[0], bet_price: 20, commission: 5 },
  { title: 'Legend 100', entry_price: 100, currency_type: currencyTypeArr[1], bet_price: 30, commission: 5 },
  { title: 'High Stakes', entry_price: 200, currency_type: currencyTypeArr[0], bet_price: 40, commission: 0 },
  { title: 'Social Lobby', entry_price: 150, currency_type: currencyTypeArr[2], bet_price: 30, commission: 5 },
  { title: 'Social Lobby', entry_price: 250, currency_type: currencyTypeArr[2], bet_price: 50, commission: 0 },
  { title: 'Private Lobby', entry_price: 50, currency_type: currencyTypeArr[2], bet_price: 20, commission: 5 },
]

export async function setupLiveMatch(matchId) {
  const { setup_done } = await pool.queryOne('SELECT setup_done FROM match WHERE id = $1', [matchId])
  if (setup_done) return

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await addPlayers(matchId, client)

    const lobbies = Object.assign([], defaultLobbies)
    for (const lobby of lobbies) {
      lobby['match_id'] = matchId
    }
    await client.insertMany(lobbies, 'lobby')

    await client.query('UPDATE match SET setup_done = TRUE WHERE id = $1', [matchId])

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

export async function processBallUpdate(matchId) {
  // Send Match Score Update
  const matchScore = await fetchLiveMatchScoreV1(matchId)
  const matchScoreChannel = supabase.channel(`matchScore-${matchId}`)
  await matchScoreChannel.send({ type: 'broadcast', event: 'matchScore', payload: matchScore })
  supabase.removeChannel(matchScoreChannel) // clean up the channel

  // Send Scorecard Update
  const scoreCard = await fetchScoreCardV1(matchId)
  const scoreCardChannel = supabase.channel(`scoreCard-${matchId}`)
  await scoreCardChannel.send({ type: 'broadcast', event: 'scoreCard', payload: { scoreCard } })
  supabase.removeChannel(scoreCardChannel) // clean up the channel
}

export async function processTickets() {
  const { rows: allRows } = await pool.query('SELECT * FROM ticket_processed;')

  for (const row of allRows) {
    if (row.wins_processed === false) {
      asyncQueue.add(
        taskType.calculateWins,
        {
          matchId: row.match_id,
          ballRangeId: row.ball_range_id,
          teamId: row.team_id,
        },
        {
          jobId: `${row.match_id},${row.ball_range_id},${row.team_id},${taskType.calculateWins}`,
        }
      )
    }

    if (row.payout_processed === false) {
      asyncQueue.add(
        taskType.calculatePayout,
        {
          matchId: row.match_id,
          ballRangeId: row.ball_range_id,
          teamId: row.team_id,
        },
        {
          jobId: `${row.match_id},${row.ball_range_id},${row.team_id},${taskType.calculatePayout}`,
        }
      )
    }
  }
}
