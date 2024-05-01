import 'dotenv/config'
import { pool } from '../../utils/postgres.js'
import { authHeader, baseUrl, getAuthToken, projectKey } from './utils.js'
import { getTeamsId } from '../score_card.js'

export const fetchPlayers = async (matchKey) => {
  if (!matchKey) return null
  const response = await fetch(baseUrl + `/v5/cricket/${projectKey}/match/${matchKey}/`, {
    headers: { [authHeader]: await getAuthToken() },
  })
  const body = await response.json()

  // insert all players
  const playersData = body.data.players
  const allPlayers = []
  const allPlayerKeys = []
  for (const key in playersData) {
    const { player } = playersData[key]
    allPlayerKeys.push(player.key)
    allPlayers.push({
      key: player.key,
      name: player.name,
      jersey_name: player.jersey_name,
    })
  }
  await pool.insertMany(allPlayers, 'player', 'ON CONFLICT (key) DO NOTHING')

  // get matchId and teamId
  const { id: matchId } = await pool.queryOne('SELECT id FROM match WHERE key = $1', [matchKey])
  const { team1Id, team2Id } = await getTeamsId(matchId)

  const playerIdKeyMap = await playersKeyToId(allPlayerKeys)
  const playerSquad = []

  const team1Players = body.data.squad.a.player_keys
  for (const playerKey of team1Players) {
    playerSquad.push({
      matchId: matchId,
      team_id: team1Id,
      player_id: playerIdKeyMap[playerKey],
    })
  }

  const team2Players = body.data.squad.b.player_keys
  for (const playerKey of team2Players) {
    playerSquad.push({
      matchId: matchId,
      team_id: team2Id,
      player_id: playerIdKeyMap[playerKey],
    })
  }

  await pool.insertMany(playerSquad, 'squad')
}

export const playersKeyToId = async (allPlayerKeys) => {
  // get playerId from player key for all the players
  const playerIdQry = `
WITH temp (k) AS (
  VALUES  ${allPlayerKeys.map((player) => `('${player}')`).join(', ')}
)
SELECT p.id, p.key
FROM player p
JOIN temp ON p.key = temp.k;  
`
  const { rows: playerIds } = await pool.query(playerIdQry)
  const playerIdKeyMap = {}
  for (const player of playerIds) {
    playerIdKeyMap[player.key] = player.id
  }
  return playerIdKeyMap
}

// await fetchPlayers('a-rz--cricket--4I1772569443466117161')
