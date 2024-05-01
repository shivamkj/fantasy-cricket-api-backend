import fetch from 'node-fetch'
import { projectKey, baseUrl, getAuthToken, authHeader } from './utils.js'
import { pool } from '../../utils/postgres.js'

export const fetchMatches = async () => {
  const response = await fetch(baseUrl + `/v5/cricket/${projectKey}/featured-matches-2/`, {
    headers: { [authHeader]: await getAuthToken() },
  })
  const body = await response.json()

  const allMatches = []

  for (const match of body.data.matches) {
    if (match.status == 'completed') continue

    const startTime = new Date(0)
    startTime.setUTCSeconds(match.start_at)
    allMatches.push({
      key: match.key,
      team1_id: await handleTeam(match.teams.a),
      team2_id: await handleTeam(match.teams.b),
      start_time: startTime,
      league: match.tournament.name,
    })
  }

  await pool.insertMany(allMatches, 'match', 'ON CONFLICT (key) DO NOTHING')
}

// returns teamId for the given team, also creates team if it not exists in the database
const handleTeam = async (team) => {
  const teamData = await pool.queryOne('SELECT id FROM team WHERE key = $1', [team.key])
  if (teamData) return teamData.id

  const insertQuery = `INSERT INTO team (key, team_name, code, logo) VALUES ($1, $2, $3, $4) RETURNING id`
  const { id } = await pool.queryOne(insertQuery, [team.key, team.name, team.code, null])
  return id
}
