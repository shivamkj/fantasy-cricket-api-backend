import { ClientErr } from '../fastify.js'
import { pool } from '../postgres.js'

export const ticketTypes = {
  batting: 'batting',
  bowling: 'bowling',
  overall: 'overall',
}

export async function buyTicketV1(request, reply) {
  const matchId = request.params.matchId
  if (!matchId) throw new ClientErr('matchId not passed')

  reply.send({ hello: 'world' })
}

export async function listUserTicketV1(request, reply) {
  const matchId = request.params.matchId
  if (!matchId) throw new ClientErr('matchId not passed')

  const userId = request.query.userId
  if (!userId) throw new ClientErr('userId not passed')

  const sqlQuery = `
SELECT
  t.match_id,
  t.ticket_type,
  t.price,
  CONCAT(t1.team_name, ' vs ', t2.team_name) AS title,
  65 AS payout,
  t1.logo AS t1logo,
  t2.logo AS t2logo
FROM ticket t
JOIN team t1 ON t.team1_id = t1.id
JOIN team t2 ON t.team2_id = t2.id
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
  CONCAT(t1.team_name, ' vs ', t2.team_name) AS title,
  t1.logo AS t1logo,
  t2.logo AS t2logo
FROM ticket t
JOIN team t1 ON t.team1_id = t1.id
JOIN team t2 ON t.team2_id = t2.id
WHERE user_id = $1
GROUP BY
  t.match_id,
  t1.id,
  t2.id;
`
  const { rows: matchTicket } = await pool.query(sqlQuery, [userId])
  reply.send(matchTicket)
}
