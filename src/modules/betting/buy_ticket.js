import { ClientErr, NotFound } from '../../utils/fastify.js'
import { VIRTUAL } from '../../utils/helper.js'
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

    const query1 = 'SELECT batting_team, slot_range from bet_slot WHERE match_id = $1'
    const betSlot = await client.queryOne(query1, [matchId])
    if (!betSlot) throw new ClientErr('betting not allowed')

    const query2 = 'SELECT id, entry_price, bet_price, match_id FROM lobby WHERE id = $1;'
    const lobby = await client.queryOne(query2, [request.body.lobbyId])
    if (!lobby) throw new NotFound('match')
    if (lobby.match_id != matchId) throw new ClientErr('invalid lobby')

    const betPrice = lobby.bet_price * bets.length
    const total = betPrice + lobby.entry_price

    // check and deduct balance
    const query3 = 'UPDATE user_data SET balance = balance - $1 WHERE id = $2 RETURNING balance;'
    const { balance } = await client.queryOne(query3, [total, request.userId])
    console.log(balance)
    if (balance < 0) throw new ClientErr('insufficient balance')

    const query4 = `
INSERT INTO 
ticket(id, match_id, team_id, lobby_id, user_id, ticket_type, ball_range_id, ticket_price, bet_price, total_bet)
VALUES(gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id;
`
    const { id: ticketId } = await client.queryOne(query4, [
      matchId,
      betSlot.batting_team,
      lobby.id,
      request.userId,
      ticketType,
      betSlot.slot_range,
      lobby.entry_price,
      betPrice,
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

export async function getBetSlot(request, reply) {
  const matchId = request.params.matchId
  if (!matchId) throw new ClientErr('match id not passed')

  const sqlQuery = `SELECT last_slot AS "lastSlot", live FROM match WHERE id = $1;`
  const matchDetails = await pool.queryOne(sqlQuery, [matchId])
  if (matchDetails == null) throw new NotFound('match')

  const sqlQuery2 = `
SELECT
  slot_range AS "slotRange",
  t1.team_name AS "battingTeam",
  t2.team_name AS "bowlingTeam"
FROM bet_slot
JOIN team t1 ON batting_team = t1.id
JOIN team t2 ON bowling_team = t2.id
WHERE match_id = $1
`
  const slotDetails = await pool.queryOne(sqlQuery2, [matchId])

  reply.send({ ...slotDetails, ...matchDetails })
}
