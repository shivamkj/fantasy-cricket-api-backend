import { Cache, supabase, tll } from '../../utils/helper.js'
import { pool } from '../../utils/postgres.js'
import { overSlot } from '../cricket_api/process_ball.js'
import { matchSocket } from '../cricket_api/realtime.js'
import { matchIdToKey } from '../cricket_api/utils.js'
import { fetchLiveMatchScoreV1, fetchScoreCardV1 } from '../score_card.js'
import { processTickets } from './tickets.js'

export async function processLiveMatch(matchId) {
  await listenMatchUpdate(matchId)
  await processTickets()
}

export async function listenMatchUpdate(matchId) {
  const matchKey = await matchIdToKey(matchId)
  await matchSocket.listen(matchKey)
}

export async function processBallUpdate(data) {
  // Added queue for processing tickets for previous slot
  const previousSlot = data.rangeId - overSlot
  if (previousSlot != 0 && !Cache.get(`added-${previousSlot}`)) {
    const ticketProcessQry = `
INSERT INTO ticket_processed (match_id, ball_range_id, team_id)
VALUES ($1, $2, $3) ON CONFLICT (match_id, ball_range_id, team_id) DO NOTHING;
`
    await pool.query(ticketProcessQry, [data.matchId, data.rangeId, data.teamId])
    Cache.set(`added-${previousSlot}`, true, tll['30min'])
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
