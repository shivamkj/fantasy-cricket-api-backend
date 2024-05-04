import { round } from '../../utils/helper.js'
import { pool } from '../../utils/postgres.js'

export const calculateAllPayouts = async (data) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const lobbiesQry = `
SELECT DISTINCT lobby_id
FROM ticket
WHERE match_id = $1
    AND ball_range_id = $2
    AND team_id = $3;
`
    const { rows: allLobbies } = await client.query(lobbiesQry, [data.matchId, data.ballRangeId, data.teamId])

    for (const { lobby_id } of allLobbies) {
      const { commission } = await pool.queryOne(`SELECT commission FROM lobby WHERE id = $1;`, [lobby_id])

      const totalBetQry = `
SELECT SUM(bet_price) as total
FROM ticket
WHERE
  match_id = $1
  AND ball_range_id = $2
  AND team_id = $3
  AND lobby_id = $4;      
`
      const { total } = await client.queryOne(totalBetQry, [data.matchId, data.ballRangeId, data.teamId, lobby_id])

      const finalTotal = round(total - (total / 100) * commission)

      const updatePayQry = `
UPDATE ticket
SET payout = bets_won * ${finalTotal}
WHERE
  match_id = $1
  AND ball_range_id = $2
  AND team_id = $3
  AND lobby_id = $4;
`
      await client.query(updatePayQry, [data.matchId, data.ballRangeId, data.teamId, lobby_id])
    }

    const markCompletedQry = `
UPDATE ticket_processed
SET
  payout_calculated = TRUE,
  payout_processed = FALSE
WHERE match_id = $1
    AND ball_range_id = $2
    AND team_id = $3;    
`
    await client.query(markCompletedQry, [data.matchId, data.ballRangeId, data.teamId])

    await client.query('COMMIT')
    return false
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
