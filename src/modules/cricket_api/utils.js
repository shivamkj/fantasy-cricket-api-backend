import { Cache } from '../../utils/helper.js'

export const baseUrl = 'https://api.sports.roanuz.com'
export const projectKey = process.env.CRICKET_PROJECT_KEY
export const authHeader = 'rs-token'

const authTokenKey = 'cric-auth-token'
const authTokenExp = 60 * 60 * 12 // 12 hours

export const getAuthToken = async () => {
  let token = Cache.get(authTokenKey)
  if (token) return token

  const response = await fetch(baseUrl + `/v5/core/${projectKey}/auth/`, {
    method: 'post',
    body: JSON.stringify({
      api_key: process.env.CRICKET_API_KEY,
    }),
    headers: { 'Content-Type': 'application/json' },
  })
  const body = await response.json()

  token = body.data.token
  Cache.set(authTokenKey, token, authTokenExp)
  return token
}

export const matchKeyToId = () => {}
