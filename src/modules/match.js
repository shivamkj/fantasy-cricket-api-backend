import { ClientErr } from '../utils/fastify.js'
import { pool } from '../utils/postgres.js'

export async function listMatchesV1(request, reply) {
  const start = request.query.start ?? 0
  const limit = request.query.limit ?? 10

  const sqlQuery = `
SELECT
  m.id,
  m.team1_id AS t1id,
  t1.team_name AS t1name,
  t1.code AS t1code,
  t1.logo AS t1logo,
  m.team2_id AS t2id,
  t2.team_name AS t2name,
  t2.code AS t2code,
  t2.logo AS t2logo,
  m.live,
  m.start_time,
  m.league
FROM "match" m
JOIN team t1 ON m.team1_id = t1.id
JOIN team t2 ON m.team2_id = t2.id
WHERE m.id > $1
ORDER BY m.live DESC, m.start_time DESC
LIMIT $2;
`

  const client = await pool.connect()
  try {
    const { rows: allMatch } = await client.query(sqlQuery, [start, limit])

    for (const match of allMatch) {
      if (match.live) {
        match['t1Score'] = await getMatchScore(match.id, match.t1id, client)
        match['t2Score'] = await getMatchScore(match.id, match.t2id, client)
      }
      delete match.t1id
      delete match.t2id
    }

    reply.send(allMatch)
  } catch (e) {
    throw e
  } finally {
    client.release()
  }
}

export async function getMatchScore(matchId, teamId, client) {
  const scoreQuery = `
SELECT
  COALESCE(SUM(runs_off_bat), 0) AS run,
  COUNT(wicket) AS wicket,
  COALESCE(MAX(ball), 0) AS over
FROM ball_by_ball_score
WHERE match_id = $1 AND team_id = $2;
`
  const { rows: score } = await client.query(scoreQuery, [matchId, teamId])
  return score[0]
}

export async function getLobbyV1(request, reply) {
  const matchId = parseInt(request.params.matchId)
  if (!matchId) throw new ClientErr('matchId not passed')

  const sqlQuery = `
SELECT
  l.id,
  l.title,
  l.entry_price AS price,
  l.currency_type AS type,
  COUNT(t.*) AS playing_count
FROM lobby l
LEFT JOIN ticket t ON t.lobby_id = l.id
WHERE l.match_id = $1
GROUP BY l.id
ORDER BY entry_price;
`
  const { rows: lobbies } = await pool.query(sqlQuery, [matchId])
  reply.send(lobbies)
}
