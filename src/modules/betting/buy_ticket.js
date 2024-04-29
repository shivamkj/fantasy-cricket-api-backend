import { ClientErr, NotFound } from '../../utils/fastify.js'
import { pool } from '../../utils/postgres.js'
import { ajv } from '../../utils/validator.js'
import { getTeamsId } from '../score_card.js'
import { betTypeArr, ticketTypeArr } from '../constants.js'

const betReqBody = {
  type: 'object',
  properties: {
    ticketType: { type: 'integer' },
    lobbyId: { type: 'integer' },
    bets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          range_id: { type: 'integer' },
          betType: { type: 'integer' },
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
  if (!(ticketType >= 0 && ticketType < ticketTypeArr.length)) throw new ClientErr('invalid ticket type')

  for (const bet of bets) {
    const betType = bet.betType
    if (!(betType >= 0 && betType < betTypeArr.length)) throw new ClientErr('invalid bet type')
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { team1Id } = await getTeamsId(matchId, client)

    const { rows: prices } = await client.query('SELECT price FROM bet_price WHERE match_id = $1;', [matchId])
    if (prices.length == 0) throw new NotFound('match')
    const betPrice = prices[0].price * bets.length

    const { rows: lobby } = await client.query('SELECT id, price FROM lobby WHERE match_id = $1;', [matchId])
    if (lobby.length == 0) throw new NotFound('match')

    const insertTktQry = `
INSERT INTO 
ticket(id, match_id, team_id, lobby_id, user_id, ticket_type, ball_range_id, ticket_price, bet_price, total_bet)
VALUES(gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id;
`

    // TODO: dynamic ball range and dynamic teamId

    const { rows } = await client.query(insertTktQry, [
      matchId,
      team1Id,
      lobby[0].id,
      request.userId,
      ticketTypeArr[ticketType],
      5,
      lobby[0].price,
      betPrice,
      bets.length,
    ])
    const ticketId = rows[0].id

    // insert bets taken for this ticket
    const betValues = []
    const query = []
    let paramsCount = 0
    for (const bet of bets) {
      betValues.push(ticketId, bet.range_id, betTypeArr[bet.betType], bet.playerId)
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
  const matchId = request.params.matchId
  if (!matchId) throw new ClientErr('matchId not passed')

  const sqlQuery = `SELECT price, commission FROM bet_price WHERE match_id = $1;`
  const { rows: price } = await pool.query(sqlQuery, [matchId])
  if (price.length == 0) throw new NotFound('match')
  reply.send(price[0])
}
