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
      const { commission } = await client.queryOne(`SELECT commission FROM lobby WHERE id = $1;`, [lobby_id])

      const totalBetQry = `
SELECT SUM(bet_price) as total, SUM(bets_won) as won
FROM ticket
WHERE
  match_id = $1
  AND ball_range_id = $2
  AND team_id = $3
  AND lobby_id = $4;      
`
      const { total, won } = await client.queryOne(totalBetQry, [data.matchId, data.ballRangeId, data.teamId, lobby_id])

      const deducted = round(total - (total / 100) * commission) // deduct comission
      // won is taken as 1 for 0 & null case, to avoid divide by zero error and division by 1 also gives same value
      const finalTotal = deducted / (won || 1) // divide equally among wons in a lobby

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
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
