import { pool } from '../../utils/postgres.js'

export const processAllPayout = async (data) => {
  const more = await processPayout(data)
  if (more) {
    return await processAllPayout(data)
  } else {
    const query = `
UPDATE ticket_processed
SET payout_processed = TRUE
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

const processPayout = async (data) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const selectQuery = `
SELECT * FROM ticket
WHERE
  match_id = $1
  AND ball_range_id = $2
  AND team_id = $3
  AND transaction_id IS NULL
LIMIT ${ticketLimit};
`
    const { rows: allTickets } = await client.query(selectQuery, [data.matchId, data.ballRangeId, data.teamId])
    for (const ticket of allTickets) {
      // TODO: send money to wallet
      // TODO: send winning notification
      // TODO: send update to feed
      await client.query('UPDATE ticket SET transaction_id = $1 WHERE id = $2;', ['TR1948498496211', ticket.id])
    }

    await client.query('COMMIT')
    return allTickets.length > 0
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
