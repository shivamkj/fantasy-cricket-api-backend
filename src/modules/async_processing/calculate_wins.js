import { pool } from '../../utils/postgres.js'
import { ticketResult } from '../betting/calculate.js'

export const calculateAllWins = async (data) => {
  const more = await calculateWins(data)
  if (more) {
    return await calculateAllWins(data)
  } else {
    const query = `
UPDATE ticket_processed
SET
  wins_calculated = TRUE,
  payout_calculated = FALSE
WHERE
  match_id = $1
  AND ball_range_id = $2
  AND team_id = $3;
`
    pool.query(query, [data.matchId, data.ballRangeId, data.teamId])
    return true
  }
}

const ticketLimit = 6

const calculateWins = async (data) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const selectQuery = `
SELECT * FROM ticket
WHERE
  match_id = $1
  AND ball_range_id = $2
  AND team_id = $3
  AND bets_won IS NULL
LIMIT ${ticketLimit};
`
    const { rows: allRows } = await client.query(selectQuery, [data.matchId, data.ballRangeId, data.teamId])
    for (const ticket of allRows) {
      const wins = await ticketResult(ticket)
      await client.query('UPDATE ticket SET bets_won = $1 WHERE id = $2;', [wins, ticket.id])
    }

    await client.query('COMMIT')
    return allRows.length > 0
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
