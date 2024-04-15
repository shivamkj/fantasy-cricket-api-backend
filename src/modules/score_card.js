import { NotFound, ClientErr } from '../fastify.js'
import { pool } from '../postgres.js'

export async function getLast6BallsV1(request, reply) {
  const matchId = request.params.matchId
  if (!matchId) throw new ClientErr('matchId not passed')

  const last6BallsQuery = `
SELECT
  (COALESCE(runs_off_bat, 0) + COALESCE(extra, 0)) AS run, wicket
FROM ball_by_ball_score
WHERE match_id = $1
ORDER BY ball DESC LIMIT 6;
`

  const { rows: balls } = await pool.query(last6BallsQuery, [matchId])
  reply.send(balls)
}

export async function getScoreCardV1(request, reply) {
  const matchId = request.params.matchId
  if (!matchId) throw new ClientErr('matchId not passed')

  // Get IDs of teams
  const { rows: teams } = await pool.query('SELECT team1_id, team2_id FROM match WHERE id = $1', [matchId])
  if (teams.length == 0) throw new NotFound('match')
  const { team1_id: team1Id, team2_id: team2Id } = teams[0]

  const battersQuery = `
SELECT
  p.first_name AS first_name,
  p.last_name AS last_name,
  SUM(bbs.runs_off_bat) AS runs,
  COUNT(DISTINCT bbs.ball) AS balls,
  COUNT(bbs.four) AS fours,
  COUNT(bbs.six) AS sixes,
  ROUND(SUM(bbs.runs_off_bat) * 100.0 / COUNT(*), 2) AS strike_rate
FROM
  ball_by_ball_score bbs
JOIN
  player p ON bbs.batter = p.id
WHERE bbs.match_id = $1 AND bbs.teamid = $2
GROUP BY p.id;
`
  const { rows: team1Batters } = await pool.query(battersQuery, [matchId, team1Id])
  const { rows: team2Batters } = await pool.query(battersQuery, [matchId, team2Id])

  const extrasQuery = `
SELECT
  COUNT(bye) AS bye,
  COUNT(legbye) AS legbye,
  COUNT(wide) AS wide,
  COUNT(noball) AS noball
FROM ball_by_ball_score
WHERE match_id = $1 AND teamid = $2;
`
  const { rows: team1Extras } = await pool.query(extrasQuery, [matchId, team1Id])
  const { rows: team2Extras } = await pool.query(extrasQuery, [matchId, team2Id])

  const totalQuery = `
SELECT
  SUM(runs_off_bat) AS run,
  COUNT(wicket) AS wicket,
  MAX(ball) AS over
FROM ball_by_ball_score
WHERE match_id = $1 AND teamid = $2;
`
  const { rows: team1Total } = await pool.query(totalQuery, [matchId, team1Id])
  const { rows: team2Total } = await pool.query(totalQuery, [matchId, team2Id])

  reply.send([
    {
      batters: team1Batters,
      extras: team1Extras[0],
      total: team1Total[0],
    },
    {
      batters: team2Batters,
      extras: team2Extras[0],
      total: team2Total[0],
    },
  ])
}
