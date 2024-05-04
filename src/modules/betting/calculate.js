import { pool } from '../../utils/postgres.js'
import { betType } from '../constants.js'
import { allResults } from './result.js'

export const ticketResult = async (ticket) => {
  const { rows: allBets } = await pool.query('SELECT * FROM bet WHERE ticket_id = $1;', [ticket.id])
  const result = await allResults(ticket.match_id, ticket.ball_range_id, ticket.team_id)
  let wins = 0
  for (const bet of allBets) {
    const won = checkBetResult(bet, result)
    if (won) wins++
  }
  return wins
}

const checkBetResult = (bet, result) => {
  switch (bet.bet_type) {
    case betType.batterRun:
      if (bet.range_id == result[betType.batterRun][bet.player_id]?.id) return true
      break
    case betType.bowlerRun:
      if (bet.range_id == result[betType.bowlerRun][bet.player_id]?.id) return true
      break
    case betType.batterWicket:
      if (bet.range_id == result[betType.batterWicket][bet.player_id]?.id) return true
      break
    case betType.wicket:
      if (bet.range_id == result[betType.wicket].id) return true
      break
    case betType.teamRun:
      if (bet.range_id == result[betType.teamRun].id) return true
      break
    case betType.economy:
      if (bet.range_id == result[betType.economy].id) return true
      break
    case betType.runRate:
      if (bet.range_id == result[betType.runRate].id) return true
      break
    case betType.boundaries:
      if (bet.range_id == result[betType.boundaries].id) return true
      break
    default:
      return false
  }
}
