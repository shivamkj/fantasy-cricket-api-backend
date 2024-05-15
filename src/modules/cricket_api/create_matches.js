import fetch from 'node-fetch'
import { projectKey, baseUrl, getAuthToken, authHeader } from './utils.js'
import { pool } from '../../utils/postgres.js'

export async function createMatches() {
  const response = await fetch(`${baseUrl}/v5/cricket/${projectKey}/featured-matches-2/`, {
    headers: { [authHeader]: await getAuthToken() },
  })
  const body = await response.json()
  if (response.status != 200) throw new Error(`invalid response, status:${response.status}, response: ${body}`)

  const allMatches = []
  for (const match of body.data.matches) {
    if (match.status == 'completed') continue

    const startTime = new Date(0)
    startTime.setUTCSeconds(match.start_at)
    allMatches.push({
      key: match.key,
      team1_id: await createTeam(match.teams.a),
      team2_id: await createTeam(match.teams.b),
      start_time: startTime,
      league: match.tournament.name,
      last_slot: getLastSlot(match.format),
    })
  }

  await pool.insertMany(allMatches, 'match', 'ON CONFLICT (key) DO NOTHING')
}

// returns teamId for the given team, also creates team if it not exists in the database
async function createTeam(team) {
  const teamData = await pool.queryOne('SELECT id FROM team WHERE key = $1', [team.key])
  if (teamData) return teamData.id

  const insertQuery = `INSERT INTO team (key, team_name, code, logo) VALUES ($1, $2, $3, $4) RETURNING id`
  const { id } = await pool.queryOne(insertQuery, [team.key, team.name, team.code, null])
  return id
}

function getLastSlot(format) {
  if (format === 't20') return 20
  else if (format === 'oneday') return 50
  else if (format === 'test') return 90
  throw new Error('unknown match format')
}

export async function subscribeToMatch(matchKey, protocol) {
  const response = await fetch(`${baseUrl}/v5/cricket/${projectKey}/match/${matchKey}/subscribe/`, {
    method: 'POST',
    headers: { [authHeader]: await getAuthToken(), 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ method: protocol }),
  })
  if (response.status == 202) return true
  else throw Error('request failed')
}
