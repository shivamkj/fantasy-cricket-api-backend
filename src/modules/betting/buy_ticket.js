import { ClientErr, NotFound } from '../../utils/fastify.js'
import { pool } from '../../utils/postgres.js'
import { ajv } from '../../utils/validator.js'
import { betValues, ticketValues } from '../constants.js'

const betReqBody = {
  type: 'object',
  properties: {
    ticketType: { type: 'string' },
    lobbyId: { type: 'integer' },
    bets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          range_id: { type: 'integer' },
          betType: { type: 'string' },
          playerId: { type: 'integer' },
        },
        required: ['range_id', 'betType'],
        additionalProperties: false,
      },
    },
  },
  required: ['ticketType', 'lobbyId', 'bets'],
  additionalProperties: false,
}
const validateBetReq = ajv.compile(betReqBody)

export async function buyTicketV1(request, reply) {
  const matchId = request.params.matchId
  if (!matchId) throw new ClientErr('matchId not passed')

  // TODO: Check balance and deduct balance

  // Validate request
  const validated = validateBetReq(request.body)
  if (!validated) throw new ClientErr('invalid request body')

  const { ticketType, bets } = request.body
  if (!ticketValues.includes(ticketType)) throw new ClientErr('invalid ticket type')

  for (const bet of bets) {
    if (!betValues.includes(bet.betType)) throw new ClientErr('invalid bet type')
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const betDetailQry = 'SELECT batting_team, slot_range from bet_slot WHERE match_id = $1'
    const betSlot = await client.queryOne(betDetailQry, [matchId])
    if (!betSlot) throw new ClientErr('betting not allowed')

    const lobbyDetailsQry = 'SELECT id, entry_price, bet_price FROM lobby WHERE id = $1;'
    const lobby = await client.queryOne(lobbyDetailsQry, [request.body.lobbyId])
    if (!lobby) throw new NotFound('match')

    const insertTktQry = `
INSERT INTO 
ticket(id, match_id, team_id, lobby_id, user_id, ticket_type, ball_range_id, ticket_price, bet_price, total_bet)
VALUES(gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id;
`
    const { id: ticketId } = await client.queryOne(insertTktQry, [
      matchId,
      betSlot.batting_team,
      lobby.id,
      request.userId,
      ticketType,
      betSlot.slot_range,
      lobby.entry_price,
      lobby.bet_price * bets.length,
      bets.length,
    ])

    // insert bets taken for this ticket
    const betValues = []
    const query = []
    let paramsCount = 0
    for (const bet of bets) {
      betValues.push(ticketId, bet.range_id, bet.betType, bet.playerId)
      query.push(`($${paramsCount + 1}, $${paramsCount + 2}, $${paramsCount + 3}, $${paramsCount + 4})`)
      paramsCount += 4
    }

    await client.query(
      `INSERT INTO bet(ticket_id, range_id, bet_type, player_id) VALUES ${query.join(', ')};`,
      betValues
    )

    await client.query('COMMIT')
    reply.send({ success: true, ticketId })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function getBetPriceV1(request, reply) {
  const lobbyId = request.params.lobbyId
  if (!lobbyId) throw new ClientErr('lobbyId not passed')

  const sqlQuery = `SELECT bet_price, commission FROM lobby WHERE id = $1;`
  const details = await pool.queryOne(sqlQuery, [lobbyId])
  if (!details) throw new NotFound('match')
  reply.send(details)
}
