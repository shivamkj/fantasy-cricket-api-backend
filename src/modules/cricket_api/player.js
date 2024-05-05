import { authHeader, baseUrl, getAuthToken, matchIdToKey, projectKey } from './utils.js'
import { getTeamsId } from '../score_card.js'
import { pool } from '../../utils/postgres.js'

export const addPlayers = async (matchId, client) => {
  if (!matchId) return null
  const matchKey = await matchIdToKey(matchId)

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
  await client.insertMany(allPlayers, 'player', 'ON CONFLICT (key) DO NOTHING')

  const { team1Id, team2Id } = await getTeamsId(matchId, client)

  const playerIdKeyMap = await playersKeyToId(allPlayerKeys, client)
  const playerSquad = []

  const team1Players = body.data.squad.a.player_keys
  for (const playerKey of team1Players) {
    playerSquad.push({
      match_id: matchId,
      team_id: team1Id,
      player_id: playerIdKeyMap[playerKey],
    })
  }

  const team2Players = body.data.squad.b.player_keys
  for (const playerKey of team2Players) {
    playerSquad.push({
      match_id: matchId,
      team_id: team2Id,
      player_id: playerIdKeyMap[playerKey],
    })
  }

  await client.insertMany(playerSquad, 'squad')
}

export const playersKeyToId = async (allPlayerKeys, client) => {
  // get playerId from player key for all the players
  const playerIdQry = `
WITH temp (k) AS (
  VALUES  ${allPlayerKeys.map((player) => `('${player}')`).join(', ')}
)
SELECT p.id, p.key
FROM player p
JOIN temp ON p.key = temp.k;
`
  const { rows: playerIds } = await (client ?? pool).query(playerIdQry)
  const playerIdKeyMap = {}
  for (const player of playerIds) {
    playerIdKeyMap[player.key] = player.id
  }
  return playerIdKeyMap
}
