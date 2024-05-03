import { liveMatches, matchStartId, totalMatches } from './matches.js'
import { v4 as uuidv4 } from 'uuid'
import { knex } from './utils.js'
import { currencyTypeArr } from '../src/modules/constants.js'
import { randomInt } from './utils.js'
import { ticketsM1I0, ticketsM1I1 } from './tickets/match1.js'

const lobbies = [
  { title: 'Star 50', entry_price: 50, currency_type: currencyTypeArr[0], bet_price: 20, commission: 5 },
  { title: 'Legend 100', entry_price: 100, currency_type: currencyTypeArr[1], bet_price: 30, commission: 5 },
  { title: 'High Stakes', entry_price: 200, currency_type: currencyTypeArr[0], bet_price: 40, commission: 0 },
  { title: 'Social Lobby', entry_price: 150, currency_type: currencyTypeArr[2], bet_price: 30, commission: 5 },
  { title: 'Social Lobby', entry_price: 250, currency_type: currencyTypeArr[2], bet_price: 50, commission: 0 },
  { title: 'Private Lobby', entry_price: 50, currency_type: currencyTypeArr[2], bet_price: 20, commission: 5 },
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

const matchTickets = [
  { id: matchStartId, innings: 0, allTickets: ticketsM1I0 },
  { id: matchStartId, innings: 1, allTickets: ticketsM1I1 },
  { id: matchStartId + 1, innings: 0, allTickets: ticketsM1I0 },
  { id: matchStartId + 1, innings: 1, allTickets: ticketsM1I1 },
]

export async function createTicket() {
  for (const match of matchTickets) {
    const [team] = await knex('match').select('team1_id', 'team2_id').where('match.id', match.id)
    const lobbies = await knex('lobby').select('*').where('match_id', match.id)
    for (const ticket of match.allTickets) {
      const lobby = lobbies[randomInt(0, lobbies.length - 1)]
      const finalTkt = {
        id: uuidv4(),
        match_id: match.id,
        lobby_id: lobby.id,
        ticket_price: lobby.entry_price,
        team_id: match.innings == 0 ? team.team1_id : team.team2_id,
        total_bet: ticket.bets.length,
        ball_range_id: ticket.ball_range_id,
        user_id: ticket.user_id,
        ticket_type: ticket.ticket_type,
        bet_price: ticket.bet_price,
      }
      const [{ id }] = await knex('ticket').insert(finalTkt).returning('id')
      for (const bet of ticket.bets) {
        bet['ticket_id'] = id
      }
      await knex('bet').insert(ticket.bets)
    }
  }
}
