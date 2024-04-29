import { betType, ticketTypes } from '../../src/modules/constants.js'
import { users } from '../misc.js'

export const ticketsM1I0 = [
  // For over 1-5 (1st Innings)
  {
    ball_range_id: 5,
    user_id: users[0].id,
    ticket_type: ticketTypes.batting,
    bet_price: 40,
    bets: [
      { range_id: 15, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 20, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 7, bet_type: betType.runRate },
      { range_id: 8, bet_type: betType.runRate },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 5,
    ticket_type: ticketTypes.bowling,
    bet_price: 40,
    bets: [
      { range_id: 10, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 30, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 1, bet_type: betType.wicket },
      { range_id: 3, bet_type: betType.wicket },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 5,
    ticket_type: ticketTypes.bowling,
    bet_price: 60,
    bets: [
      { range_id: 1, bet_type: betType.economy },
      { range_id: 3, bet_type: betType.economy },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 5,
    ticket_type: ticketTypes.overall,
    bet_price: 120,
    bets: [
      { range_id: 30, bet_type: betType.teamRun },
      { range_id: 45, bet_type: betType.teamRun },
      { range_id: 3, bet_type: betType.boundaries },
      { range_id: 1, bet_type: betType.boundaries },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 5,
    ticket_type: ticketTypes.batting,
    bet_price: 60,
    bets: [
      { range_id: 10, bet_type: betType.batterWicket, player_id: 12136 },
      { range_id: 30, bet_type: betType.batterWicket, player_id: 12136 },
    ],
  },
  // For over 6-10 (1st Innings)
  {
    ball_range_id: 10,
    user_id: users[0].id,
    ticket_type: ticketTypes.batting,
    bet_price: 40,
    bets: [
      { range_id: 15, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 20, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 7, bet_type: betType.runRate },
      { range_id: 8, bet_type: betType.runRate },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 10,
    ticket_type: ticketTypes.bowling,
    bet_price: 40,
    bets: [
      { range_id: 10, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 30, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 1, bet_type: betType.wicket },
      { range_id: 3, bet_type: betType.wicket },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 10,
    ticket_type: ticketTypes.bowling,
    bet_price: 60,
    bets: [
      { range_id: 1, bet_type: betType.economy },
      { range_id: 3, bet_type: betType.economy },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 10,
    ticket_type: ticketTypes.overall,
    bet_price: 120,
    bets: [
      { range_id: 30, bet_type: betType.teamRun },
      { range_id: 45, bet_type: betType.teamRun },
      { range_id: 3, bet_type: betType.boundaries },
      { range_id: 1, bet_type: betType.boundaries },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 10,
    ticket_type: ticketTypes.batting,
    bet_price: 60,
    bets: [
      { range_id: 10, bet_type: betType.batterWicket, player_id: 12136 },
      { range_id: 30, bet_type: betType.batterWicket, player_id: 12136 },
    ],
  },
  // For over 11-15 (1st Innings)
  {
    ball_range_id: 15,
    user_id: users[0].id,
    ticket_type: ticketTypes.batting,
    bet_price: 40,
    bets: [
      { range_id: 15, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 20, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 7, bet_type: betType.runRate },
      { range_id: 8, bet_type: betType.runRate },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 15,
    ticket_type: ticketTypes.bowling,
    bet_price: 40,
    bets: [
      { range_id: 10, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 30, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 1, bet_type: betType.wicket },
      { range_id: 3, bet_type: betType.wicket },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 15,
    ticket_type: ticketTypes.bowling,
    bet_price: 60,
    bets: [
      { range_id: 1, bet_type: betType.economy },
      { range_id: 3, bet_type: betType.economy },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 15,
    ticket_type: ticketTypes.overall,
    bet_price: 120,
    bets: [
      { range_id: 30, bet_type: betType.teamRun },
      { range_id: 45, bet_type: betType.teamRun },
      { range_id: 3, bet_type: betType.boundaries },
      { range_id: 1, bet_type: betType.boundaries },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 15,
    ticket_type: ticketTypes.batting,
    bet_price: 60,
    bets: [
      { range_id: 10, bet_type: betType.batterWicket, player_id: 12136 },
      { range_id: 30, bet_type: betType.batterWicket, player_id: 12136 },
    ],
  },
  // For over 15-20 (1st Innings)
  {
    ball_range_id: 20,
    user_id: users[0].id,
    ticket_type: ticketTypes.batting,
    bet_price: 40,
    bets: [
      { range_id: 15, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 20, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 7, bet_type: betType.runRate },
      { range_id: 8, bet_type: betType.runRate },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 20,
    ticket_type: ticketTypes.bowling,
    bet_price: 40,
    bets: [
      { range_id: 10, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 30, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 1, bet_type: betType.wicket },
      { range_id: 3, bet_type: betType.wicket },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 20,
    ticket_type: ticketTypes.bowling,
    bet_price: 60,
    bets: [
      { range_id: 1, bet_type: betType.economy },
      { range_id: 3, bet_type: betType.economy },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 20,
    ticket_type: ticketTypes.overall,
    bet_price: 120,
    bets: [
      { range_id: 30, bet_type: betType.teamRun },
      { range_id: 45, bet_type: betType.teamRun },
      { range_id: 3, bet_type: betType.boundaries },
      { range_id: 1, bet_type: betType.boundaries },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 20,
    ticket_type: ticketTypes.batting,
    bet_price: 60,
    bets: [
      { range_id: 10, bet_type: betType.batterWicket, player_id: 12136 },
      { range_id: 30, bet_type: betType.batterWicket, player_id: 12136 },
    ],
  },
]

export const ticketsM1I1 = [
  // For over 1-5 (2nd Innings)
  {
    ball_range_id: 5,
    user_id: users[0].id,
    ticket_type: ticketTypes.batting,
    bet_price: 40,
    bets: [
      { range_id: 15, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 20, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 7, bet_type: betType.runRate },
      { range_id: 8, bet_type: betType.runRate },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 5,
    ticket_type: ticketTypes.bowling,
    bet_price: 40,
    bets: [
      { range_id: 10, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 30, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 1, bet_type: betType.wicket },
      { range_id: 3, bet_type: betType.wicket },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 5,
    ticket_type: ticketTypes.bowling,
    bet_price: 60,
    bets: [
      { range_id: 1, bet_type: betType.economy },
      { range_id: 3, bet_type: betType.economy },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 5,
    ticket_type: ticketTypes.overall,
    bet_price: 120,
    bets: [
      { range_id: 30, bet_type: betType.teamRun },
      { range_id: 45, bet_type: betType.teamRun },
      { range_id: 3, bet_type: betType.boundaries },
      { range_id: 1, bet_type: betType.boundaries },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 5,
    ticket_type: ticketTypes.batting,
    bet_price: 60,
    bets: [
      { range_id: 10, bet_type: betType.batterWicket, player_id: 12136 },
      { range_id: 30, bet_type: betType.batterWicket, player_id: 12136 },
    ],
  },
  // For over 6-10 (2nd Innings)
  {
    ball_range_id: 10,
    user_id: users[0].id,
    ticket_type: ticketTypes.batting,
    bet_price: 40,
    bets: [
      { range_id: 15, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 20, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 7, bet_type: betType.runRate },
      { range_id: 8, bet_type: betType.runRate },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 10,
    ticket_type: ticketTypes.bowling,
    bet_price: 40,
    bets: [
      { range_id: 10, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 30, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 1, bet_type: betType.wicket },
      { range_id: 3, bet_type: betType.wicket },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 10,
    ticket_type: ticketTypes.bowling,
    bet_price: 60,
    bets: [
      { range_id: 1, bet_type: betType.economy },
      { range_id: 3, bet_type: betType.economy },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 10,
    ticket_type: ticketTypes.overall,
    bet_price: 120,
    bets: [
      { range_id: 30, bet_type: betType.teamRun },
      { range_id: 45, bet_type: betType.teamRun },
      { range_id: 3, bet_type: betType.boundaries },
      { range_id: 1, bet_type: betType.boundaries },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 10,
    ticket_type: ticketTypes.batting,
    bet_price: 60,
    bets: [
      { range_id: 10, bet_type: betType.batterWicket, player_id: 12136 },
      { range_id: 30, bet_type: betType.batterWicket, player_id: 12136 },
    ],
  },
  // For over 11-15 (2nd Innings)
  {
    ball_range_id: 15,
    user_id: users[0].id,
    ticket_type: ticketTypes.batting,
    bet_price: 40,
    bets: [
      { range_id: 15, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 20, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 7, bet_type: betType.runRate },
      { range_id: 8, bet_type: betType.runRate },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 15,
    ticket_type: ticketTypes.bowling,
    bet_price: 40,
    bets: [
      { range_id: 10, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 30, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 1, bet_type: betType.wicket },
      { range_id: 3, bet_type: betType.wicket },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 15,
    ticket_type: ticketTypes.bowling,
    bet_price: 60,
    bets: [
      { range_id: 1, bet_type: betType.economy },
      { range_id: 3, bet_type: betType.economy },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 15,
    ticket_type: ticketTypes.overall,
    bet_price: 120,
    bets: [
      { range_id: 30, bet_type: betType.teamRun },
      { range_id: 45, bet_type: betType.teamRun },
      { range_id: 3, bet_type: betType.boundaries },
      { range_id: 1, bet_type: betType.boundaries },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 15,
    ticket_type: ticketTypes.batting,
    bet_price: 60,
    bets: [
      { range_id: 10, bet_type: betType.batterWicket, player_id: 12136 },
      { range_id: 30, bet_type: betType.batterWicket, player_id: 12136 },
    ],
  },
  // For over 15-20 (2nd Innings)
  {
    ball_range_id: 20,
    user_id: users[0].id,
    ticket_type: ticketTypes.batting,
    bet_price: 40,
    bets: [
      { range_id: 15, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 20, bet_type: betType.batterRun, player_id: 10105 },
      { range_id: 7, bet_type: betType.runRate },
      { range_id: 8, bet_type: betType.runRate },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 20,
    ticket_type: ticketTypes.bowling,
    bet_price: 40,
    bets: [
      { range_id: 10, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 30, bet_type: betType.bowlerRun, player_id: 12136 },
      { range_id: 1, bet_type: betType.wicket },
      { range_id: 3, bet_type: betType.wicket },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 20,
    ticket_type: ticketTypes.bowling,
    bet_price: 60,
    bets: [
      { range_id: 1, bet_type: betType.economy },
      { range_id: 3, bet_type: betType.economy },
    ],
  },
  {
    user_id: users[1].id,
    ball_range_id: 20,
    ticket_type: ticketTypes.overall,
    bet_price: 120,
    bets: [
      { range_id: 30, bet_type: betType.teamRun },
      { range_id: 45, bet_type: betType.teamRun },
      { range_id: 3, bet_type: betType.boundaries },
      { range_id: 1, bet_type: betType.boundaries },
    ],
  },
  {
    user_id: users[0].id,
    ball_range_id: 20,
    ticket_type: ticketTypes.batting,
    bet_price: 60,
    bets: [
      { range_id: 10, bet_type: betType.batterWicket, player_id: 12136 },
      { range_id: 30, bet_type: betType.batterWicket, player_id: 12136 },
    ],
  },
]
