import { ClientErr } from '../utils/fastify.js'
import { pool } from '../utils/postgres.js'

export async function listUserTicketV1(request, reply) {
  const matchId = request.params.matchId
  if (!matchId) throw new ClientErr('matchId not passed')

  const userId = request.query.userId
  if (!userId) throw new ClientErr('userId not passed')

  const sqlQuery = `
SELECT
  t.id,
  t.match_id,
  t.ticket_type,
  t.total_bet AS price,
  t1.team_name AS t1name,
  t1.logo AS t1logo,
  t2.team_name AS t2name,
  t2.logo AS t2logo,
  65 AS payout,
  TRUE AS won
FROM ticket t
JOIN match m ON m.id = t.match_id
JOIN team t1 ON m.team2_id = t1.id
JOIN team t2 ON m.team2_id = t2.id
WHERE user_id = $1 AND match_id = $2
`
  const { rows: tickets } = await pool.query(sqlQuery, [userId, matchId])
  reply.send(tickets)
}

export async function aggregateUserTicketV1(request, reply) {
  const userId = request.params.userId
  if (!userId) throw new ClientErr('userId not passed')

  const sqlQuery = `
SELECT
  t.match_id,
  COUNT(t.*) AS count,
  t1.team_name AS t1name,
  t1.logo AS t1logo,
  t2.team_name AS t2name,
  t2.logo AS t2logo,
  m.start_time AS date
FROM ticket t
JOIN match m ON m.id = t.match_id
JOIN team t1 ON m.team2_id = t1.id
JOIN team t2 ON m.team2_id = t2.id
WHERE user_id = $1
GROUP BY t.match_id, m.id, t1.id, t2.id;
`
  const { rows: matchTicket } = await pool.query(sqlQuery, [userId])
  reply.send(matchTicket)
}
