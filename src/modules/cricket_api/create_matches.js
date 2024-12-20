import fetch from 'node-fetch'
import { projectKey, baseUrl, getAuthToken, authHeader } from './utils.js'
import { pool } from '../../utils/postgres.js'

const upsertStatement = `
ON CONFLICT (key)
DO UPDATE SET
  team1_id = excluded.team1_id,
  team2_id = excluded.team2_id
WHERE match.setup_done = false;
`

export async function createMatches(forceRefresh = false) {
  const response = await fetch(`${baseUrl}/v5/cricket/${projectKey}/featured-matches-2/`, {
    headers: { [authHeader]: await getAuthToken(forceRefresh) },
  })

  // retry once with force refreshing token if response is not successful
  if (response.status != 200 && forceRefresh) {
    throw new Error(`invalid response, status:${response.status}, response: ${response.body}`)
  } else if (response.status != 200) {
    return createMatches(true)
  }

  const body = await response.json()
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

  await pool.insertMany(allMatches, 'match', upsertStatement)
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
