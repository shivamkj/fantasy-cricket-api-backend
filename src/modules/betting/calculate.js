import { pool } from '../../utils/postgres.js'
import { betType } from '../constants.js'
import { allResults } from './result.js'

export const ticketResult = async (ticket) => {
  const { rows: allBets } = await pool.query('SELECT * FROM bet WHERE ticket_id = $1;', [ticket.id])
  const result = await allResults(ticket.match_id, ticket.ball_range_id, ticket.team_id)
  let wins = 0
  for (const bet of allBets) {
    const won = betResult(bet, result)
    if (won) wins++
    console.log(won, bet)
  }
  return { winPercent: wins / allBets.length, result }
}

const betResult = (betData, result) => {
  switch (betData.bet_type) {
    case betType.batterRun:
      if (betData.bet == result[betType.batterRun][betData.player_id]?.id) return true
      break
    case betType.bowlerRun:
      if (betData.bet == result[betType.bowlerRun][betData.player_id]?.id) return true
      break
    case betType.batterWicket:
      return false
      break
    case betType.wicket:
      if (betData.bet == result[betType.wicket].id) return true
      break
    case betType.teamRun:
      if (betData.bet == result[betType.teamRun].id) return true
      break
    case betType.economy:
      if (betData.bet == result[betType.economy].id) return true
      break
    case betType.runRate:
      if (betData.bet == result[betType.runRate].id) return true
      break
    case betType.boundaries:
      if (betData.bet == result[betType.boundaries].id) return true
      break
    default:
      return false
  }
}
