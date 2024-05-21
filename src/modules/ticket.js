import { ClientErr } from '../utils/fastify.js'
import { round } from '../utils/helper.js'
import { pool } from '../utils/postgres.js'

export async function listUserTicketV1(request, reply) {
  const matchId = request.params.matchId
  if (!matchId) throw new ClientErr('matchId not passed')

  const sqlQuery = `
SELECT
  t.id,
  t.ticket_type,
  t.bet_price AS price,
  t1.team_name AS t1name,
  t1.logo AS t1logo,
  t2.team_name AS t2name,
  t2.logo AS t2logo,
  t.ball_range_id,
  t.payout
FROM ticket t
JOIN match m ON m.id = t.match_id
JOIN team t1 ON m.team1_id = t1.id
JOIN team t2 ON m.team2_id = t2.id
WHERE user_id = $1 AND match_id = $2
`
  const { rows: allTickets } = await pool.query(sqlQuery, [request.userId, matchId])

  let moneyWon = 0
  let winningTicket = 0
  for (const ticket of allTickets) {
    if (ticket.payout != null && ticket.payout > 0) {
      moneyWon += ticket.payout
      winningTicket++
      ticket.won = 1
    } else if (ticket.payout === 0) {
      ticket.won = -1
    } else {
      ticket.won = 0
      ticket.payout = 0
    }
  }

  reply.send({ moneyWon, winRate: round((winningTicket / allTickets.length) * 100), tickets: allTickets })
}

export async function aggregateUserTicketV1(request, reply) {
  const sqlQuery = `
SELECT
  t.match_id,
  COUNT(t.*) AS count,
  t1.team_name AS t1name,
  t1.logo AS t1logo,
  t2.team_name AS t2name,
  t2.logo AS t2logo,
  m.league AS league,
  m.start_time AS date,
  m.live
FROM ticket t
JOIN match m ON m.id = t.match_id
JOIN team t1 ON m.team1_id = t1.id
JOIN team t2 ON m.team2_id = t2.id
WHERE user_id = $1
GROUP BY t.match_id, m.id, t1.id, t2.id;
`
  const { rows: matchTicket } = await pool.query(sqlQuery, [request.userId])
  reply.send(matchTicket)
}
