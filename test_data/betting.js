import { liveMatches, matchStartId, totalMatches } from './matches.js'
import { v4 as uuidv4 } from 'uuid'
import { knex, randomBool } from './utils.js'
import { ticketTypeArr, currencyTypeArr } from '../src/modules/constants.js'
import { randomInt } from './utils.js'

const lobbies = [
  { title: 'Star 50', price: 50, currency_type: currencyTypeArr[0] },
  { title: 'Legend 100', price: 100, currency_type: currencyTypeArr[1] },
  { title: 'High Stakes', price: 200, currency_type: currencyTypeArr[0] },
  { title: 'Social Lobby', price: 150, currency_type: currencyTypeArr[2] },
  { title: 'Social Lobby', price: 250, currency_type: currencyTypeArr[2] },
  { title: 'Private Lobby', price: 50, currency_type: currencyTypeArr[2] },
]

export async function createLobby() {
  for (let index = 0; index < totalMatches; index++) {
    const matchLobbies = Object.assign([], lobbies)
    for (const lobby of matchLobbies) {
      lobby['match_id'] = matchStartId + index
      if (index < liveMatches) lobby['playing_count'] = randomInt(2000, 10000)
    }
    await knex('lobby').insert(matchLobbies)
  }
}

const userId = 102275
const users = [
  { id: userId, user_id: uuidv4(), kyc_done: true },
  { id: userId + 1, user_id: uuidv4(), kyc_done: false },
]

export async function createUsers() {
  await knex('_user').insert(users)
}

export async function createTicket() {
  const tickets = []
  for (let index = 0; index < liveMatches; index++) {
    const ticketCount = randomInt(2, 8)
    const matchId = matchStartId + index
    const [team] = await knex('match').select('team1_id', 'team2_id').where('match.id', matchId)
    for (let index = 0; index < ticketCount; index++) {
      tickets.push({
        match_id: matchId,
        user_id: users[randomBool() ? 0 : 1].id,
        ticket_type: ticketTypeArr[randomInt(0, 2)],
        team_id: randomBool() ? team.team1_id : team.team2_id,
        ball_range_id: randomBool() ? 5 : 10,
        ticket_price: randomInt(200, 999),
        total_bet: randomInt(200, 999),
        transaction_id: uuidv4(),
        pay_confirmed: randomBool(),
      })
    }
  }
  await knex('ticket').insert(tickets)
}

export async function createBetPrice() {
  const betPrices = []
  const prices = [50, 80, 100, 150]
  const commissions = [0, 10, 20]
  for (let index = 0; index < liveMatches; index++) {
    const ticketCount = randomInt(2, 8)
    const matchId = betPrices.push({
      match_id: matchStartId + index,
      price: prices[randomInt(0, 3)],
      commission: commissions[randomInt(0, 2)],
    })
  }
  await knex('bet_price').insert(betPrices)
}
