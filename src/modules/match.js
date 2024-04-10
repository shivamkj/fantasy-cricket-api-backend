import { pool } from '../postgres.js'

export async function getMatchesV1(request, reply) {
  const start = request.query.start ?? 0
  const limit = request.query.limit ?? 10
  console.log(limit, start)
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
  const { rows } = await pool.query(sqlQuery, [start, limit])

  for (const match of rows) {
    if (match.live) {
      match['t1Score'] = await getMatchScore(match.id, match.t1Id)
      match['t2Score'] = await getMatchScore(match.id, match.t2Id)
    }
    delete match.t1id
    delete match.t2id
  }

  reply.send(rows)
}

async function getMatchScore(matchId, teamId) {
  return {
    run: 149,
    over: 20,
    wicket: 6,
  }
}

export async function getLobbyV1(request, reply) {
  const sqlQuery = `
SELECT
  title, price, playing_count
FROM lobby
WHERE match_id = 10000 
ORDER BY price;
`
  const { rows } = await pool.query(sqlQuery)

  reply.send(rows)
}

export async function getLast6BallsV1(request, reply) {
  const sqlQuery = `
SELECT
  title, price, playing_count
FROM lobby
WHERE match_id = 10000 
ORDER BY price;
`
  const { rows } = await pool.query(sqlQuery)

  reply.send(rows)
}
