import { Cache } from '../../utils/helper.js'
import { pool } from '../../utils/postgres.js'

export const baseUrl = 'https://api.sports.roanuz.com'
export const projectKey = process.env.CRICKET_PROJECT_KEY
export const authHeader = 'rs-token'

const authTokenKey = 'cric-auth-token'
const authTokenExp = 60 * 60 * 4 // 4 hours

export const getAuthToken = async (forceRefresh = false) => {
  let token = Cache.get(authTokenKey)
  if (token && !forceRefresh) return token

  const response = await fetch(baseUrl + `/v5/core/${projectKey}/auth/`, {
    method: 'post',
    body: JSON.stringify({
      api_key: process.env.CRICKET_API_KEY,
    }),
    headers: { 'Content-Type': 'application/json' },
  })
  const body = await response.json()

  token = body.data?.token
  Cache.set(authTokenKey, token, authTokenExp)
  if (token == null) {
    console.error(body);
    throw Error(`could not get auth token from cricket API ${body}`,)
  }
  return token
}

export async function matchIdToKey(matchId, client) {
  const { key } = await (client ?? pool).queryOne('SELECT key FROM match WHERE id = $1;', [matchId])
  return key
}
