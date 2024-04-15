import { pool } from '../postgres.js'
import { ClientErr } from '../fastify.js'

export async function listMatchesV1(request, reply) {
  const start = request.query.start ?? 0
  const limit = request.query.limit ?? 10

  const sqlQuery = `
SELECT
  m.id,
  m.team1_id AS t1Id,
  t1.team_name AS t1Name,
  t1.logo AS t1Logo,
  m.team2_id AS t2Id,
  t2.team_name AS t2Name,
  t2.logo AS t2Logo,
  m.live,
  m.start_time,
  m.league
FROM "match" m
  JOIN team t1 ON m.team1_id = t1.id
  JOIN team t2 ON m.team2_id = t2.id
WHERE m.id > $1 LIMIT $2;
`
  const { rows: allMatch } = await pool.query(sqlQuery, [start, limit])

  for (const match of allMatch) {
    if (match.live) {
      match['t1Score'] = await getMatchScore(match.id, match.t1id)
      match['t2Score'] = await getMatchScore(match.id, match.t2id)
    }
    delete match.t1id
    delete match.t2id
  }

  reply.send(allMatch)
}

async function getMatchScore(matchId, teamId) {
  const scoreQuery = `
SELECT
  SUM(runs_off_bat) AS run,
  COUNT(wicket) AS wicket,
  MAX(ball) AS over
FROM ball_by_ball_score
WHERE match_id = $1 AND teamid = $2;
`
  const { rows: score } = await pool.query(scoreQuery, [matchId, teamId])
  return score[0]
}

export async function getLobbyV1(request, reply) {
  const matchId = request.params.matchId
  if (!matchId) throw new ClientErr('matchId not passed')

  const sqlQuery = `
SELECT
  title, price, playing_count
FROM lobby
WHERE match_id = $1
ORDER BY price;
`
  const { rows: lobbies } = await pool.query(sqlQuery, [matchId])
  reply.send(lobbies)
}
