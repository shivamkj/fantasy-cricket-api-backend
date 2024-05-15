import { ClientErr } from '../utils/fastify.js'
import { VIRTUAL, round } from '../utils/helper.js'
import { pool } from '../utils/postgres.js'

const INITIAL_BALANCE = 10000

export async function completeKyc(request, reply) {
  if (VIRTUAL) {
    // Check if KYC is already marked completed
    const query1 = `SELECT kyc_done FROM user_data WHERE id = $1`
    const details = await pool.queryOne(query1, [request.userId])
    if (details?.kyc_done == true) return reply.send({ status: 'OK' })

    // Else mark KYC as completed and add initial balance
    const query2 = 'INSERT INTO user_data (id, balance, kyc_done) VALUES ($1, $2, TRUE)'
    await pool.query(query2, [request.userId, INITIAL_BALANCE])
    reply.send({ status: 'OK' })
  }

  throw ClientErr('unsupported')
}

export async function userDetails(request, reply) {
  const client = await pool.connect()
  try {
    const query = `
SELECT
  COUNT(*) AS tickets,
  COUNT(DISTINCT match_id) AS matches,
  COALESCE(SUM(bet_price + ticket_price), 0) AS spent,
  COALESCE(SUM(payout), 0) AS won
FROM ticket
WHERE user_id = $1
`
    const aggregate = await client.queryOne(query, [request.userId])

    const details = await client.queryOne('SELECT balance FROM user_data WHERE id = $1', [request.userId])
    aggregate.balance = details.balance ?? 0

    reply.send(aggregate)
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
}
