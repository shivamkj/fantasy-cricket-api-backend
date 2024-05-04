import { ClientErr } from '../../utils/fastify.js'
import { pool } from '../../utils/postgres.js'
import { betType as allBetType } from '../constants.js'

export async function getPlayersV1(request, reply) {
  const matchId = request.params.matchId
  if (!matchId) throw new ClientErr('matchId not passed')
  const betType = request.params.betType

  let team
  switch (betType) {
    case allBetType.batterRun:
    case allBetType.batterWicket:
      team = await pool.queryOne('SELECT batting_team as id from bet_slot WHERE match_id = $1', [matchId])
      break
    case allBetType.bowlerRun:
      team = await pool.queryOne('SELECT bowling_team as id from bet_slot WHERE match_id = $1', [matchId])
      break
    default:
      throw new ClientErr('invalid betType')
  }

  if (!team) throw new ClientErr('betting not allowed')

  const playerListQry = `
SELECT p.id, p.name
FROM squad s
LEFT JOIN player p ON s.player_id = p.id
WHERE match_id = $1 AND team_id = $2;
`
  const { rows: players } = await pool.query(playerListQry, [matchId, team.id])
  reply.send(players)
}
