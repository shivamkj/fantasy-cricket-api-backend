import { NotFound, ClientErr } from '../utils/fastify.js'
import { pool } from '../utils/postgres.js'
import { getMatchScore } from './match.js'

export async function getLiveMatchScoreV1(request, reply) {
  const matchId = request.params.matchId
  if (!matchId) throw new ClientErr('matchId not passed')

  reply.send(await fetchLiveMatchScoreV1(matchId))
}

export async function fetchLiveMatchScoreV1(matchId) {
  const client = await pool.connect()
  try {
    const last6BallsQuery = `
SELECT
  ball, (COALESCE(runs_off_bat, 0) + COALESCE(extra, 0)) AS run, COALESCE(wicket, FALSE) AS wicket
FROM ball_by_ball_score
WHERE match_id = $1
ORDER BY ball DESC LIMIT 6;
`
    // Process to filter current over balls only
    const { rows: balls } = await client.query(last6BallsQuery, [matchId])
    if (balls.length == 0) throw new NotFound('match not started or invalid match id')
    const currentOver = Math.trunc(balls[0].ball)
    var ballCount = balls.length
    while (ballCount--) {
      if (Math.trunc(balls[ballCount].ball) != currentOver) balls.splice(ballCount, 1)
    }
    balls.reverse()

    // get live match score
    const { team1Id, team2Id } = await getTeamsId(matchId, client)

    const t1Score = await getMatchScore(matchId, team1Id, client)
    const t2Score = await getMatchScore(matchId, team2Id, client)

    return { t1Score, t2Score, overBalls: balls }
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
}

export async function getScoreCardV1(request, reply) {
  const matchId = request.params.matchId
  if (!matchId) throw new ClientErr('matchId not passed')

  reply.send(await fetchScoreCardV1(matchId))
}

export async function fetchScoreCardV1(matchId) {
  const client = await pool.connect()
  try {
    // Get IDs of teams
    const { team1Id, team2Id } = await getTeamsId(matchId, client)

    const battersQuery = `
SELECT
  p.jersey_name AS name,
  SUM(bbs.runs_off_bat) AS runs,
  COUNT(DISTINCT bbs.ball) AS balls,
  COUNT(bbs.four) AS fours,
  COUNT(bbs.six) AS sixes,
  ROUND(SUM(bbs.runs_off_bat) * 100.0 / COUNT(*), 2) AS strike_rate
FROM
  ball_by_ball_score bbs
JOIN
  player p ON bbs.batter = p.id
WHERE bbs.match_id = $1 AND bbs.team_id = $2
GROUP BY p.id;
`
    const { rows: team1Batters } = await client.query(battersQuery, [matchId, team1Id])
    const { rows: team2Batters } = await client.query(battersQuery, [matchId, team2Id])

    const bowlersQuery = `
SELECT
  p.jersey_name AS name,
  ROUND(COUNT(bbs.ball) / 6.0, 1) AS overs,
  SUM(CASE WHEN runs_off_bat = 0 AND wide = 0 AND noball = 0 THEN 1 ELSE 0 END) AS maiden,
  SUM(bbs.runs_off_bat + COALESCE(bbs.extra, 0)) AS run,
  COUNT(bbs.wicket) AS wicket,
  ROUND(SUM(bbs.runs_off_bat + COALESCE(bbs.extra, 0)) / (COUNT(bbs.ball) / 6.0), 2) AS economy
FROM ball_by_ball_score bbs
JOIN player p ON bbs.bowler = p.id
WHERE match_id = $1 AND team_id = $2
GROUP BY p.id;
`

    const { rows: team1Bowlers } = await client.query(bowlersQuery, [matchId, team1Id])
    const { rows: team2Bowlers } = await client.query(bowlersQuery, [matchId, team2Id])

    const extrasQuery = `
SELECT
  COUNT(bye) AS bye,
  COUNT(legbye) AS legbye,
  COUNT(wide) AS wide,
  COUNT(noball) AS noball
FROM ball_by_ball_score
WHERE match_id = $1 AND team_id = $2;
`
    const { rows: team1Extras } = await client.query(extrasQuery, [matchId, team1Id])
    const { rows: team2Extras } = await client.query(extrasQuery, [matchId, team2Id])

    const totalQuery = `
SELECT
  SUM(COALESCE(runs_off_bat, 0) + COALESCE(extra, 0)) AS run,
  COUNT(wicket) AS wicket,
  COALESCE(MAX(ball), 0) AS over
FROM ball_by_ball_score
WHERE match_id = $1 AND team_id = $2;
`
    const { rows: team1Total } = await client.query(totalQuery, [matchId, team1Id])
    const { rows: team2Total } = await client.query(totalQuery, [matchId, team2Id])

    const teamQuery = 'SELECT code FROM team WHERE id = $1;'
    const { rows: team1Details } = await client.query(teamQuery, [team1Id])
    const { rows: team2Details } = await client.query(teamQuery, [team2Id])

    return [
      {
        ...team1Details[0],
        batters: team1Batters,
        bowlers: team1Bowlers,
        extras: team1Extras[0],
        total: team1Total[0],
      },
      {
        ...team2Details[0],
        batters: team2Batters,
        bowlers: team2Bowlers,
        extras: team2Extras[0],
        total: team2Total[0],
      },
    ]
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
}

export async function getTeamsId(matchId, client) {
  const { rows: teams } = await (client ?? pool).query('SELECT team1_id, team2_id FROM match WHERE id = $1', [matchId])
  if (teams.length == 0) throw new NotFound('match')
  return { team1Id: teams[0].team1_id, team2Id: teams[0].team2_id }
}
