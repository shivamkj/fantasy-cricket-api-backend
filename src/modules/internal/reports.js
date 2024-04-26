import { ClientErr, NotFound } from '../../utils/fastify.js'
import { pool } from '../../utils/postgres.js'
import { ticketResult } from '../betting/calculate.js'
import { allResults } from '../betting/result.js'
import { getTeamsId } from '../score_card.js'

export async function getResult(request, reply) {
  const { innings, rangeId, matchId } = request.params
  if (!matchId) throw new ClientErr('matchId not passed')
  if (innings != 0 && innings != 1) throw new ClientErr('invalid innings')
  if (!rangeId) throw new ClientErr('rangeId not passed')

  const { team1Id, team2Id } = await getTeamsId(matchId)
  const teamId = innings == 0 ? team1Id : team2Id

  const result = await allResults(matchId, rangeId, teamId)
  reply.send(result)
}

export async function ticketResultRoute(request, reply) {
  const ticketId = request.params.ticketId
  if (!ticketId) throw new ClientErr('matchId not passed')

  const sqlQuery = `SELECT * FROM ticket WHERE id = $1;`
  const { rows } = await pool.query(sqlQuery, [ticketId])
  if (rows.length == 0) throw new NotFound('ticket')
  const ticket = rows[0]
  reply.send(await ticketResult(ticket))
}
