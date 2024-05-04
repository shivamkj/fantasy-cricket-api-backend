import { pool } from '../../utils/postgres.js'
import { asyncQueue, tasks } from './index.js'

export async function processTickets() {
  const { rows: allRows } = await pool.query('SELECT * FROM ticket_processed;')
  for (const row of allRows) {
    if (row.wins_calculated === false) {
      asyncQueue.add(
        tasks.calculateWins,
        { matchId: row.match_id, ballRangeId: row.ball_range_id, teamId: row.team_id },
        {
          jobId: `${row.match_id},${row.ball_range_id},${row.team_id},${tasks.calculateWins}`,
        }
      )
    }

    if (row.payout_calculated === false) {
      asyncQueue.add(
        tasks.calculatePayout,
        { matchId: row.match_id, ballRangeId: row.ball_range_id, teamId: row.team_id },
        {
          jobId: `${row.match_id},${row.ball_range_id},${row.team_id},${tasks.calculatePayout}`,
        }
      )
    }

    if (row.payout_processed === false) {
      asyncQueue.add(
        tasks.processPayout,
        { matchId: row.match_id, ballRangeId: row.ball_range_id, teamId: row.team_id },
        {
          jobId: `${row.match_id},${row.ball_range_id},${row.team_id},${tasks.processPayout}`,
        }
      )
    }
  }
}
