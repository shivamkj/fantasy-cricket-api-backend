import { pool } from '../../utils/postgres.js'
import { playersKeyToId } from './player.js'

const ballToProcess = 6

export const processMatchUpdate = async (res) => {
  const recentOvers = res.data.play.live.recent_overs

  // Grab id of x (ballToProcess) recent balls
  const recentBalls = []
  for (var i = recentOvers.length; i--; ) {
    const ballsKeys = recentOvers[i].ball_keys.reverse()
    recentBalls.push(...ballsKeys)
    if (recentBalls.length > ballToProcess) break
  }
  recentBalls.splice(ballToProcess)

  const ballData = res.data.play.related_balls
  const { id: matchId } = await pool.queryOne('SELECT id FROM match WHERE key = $1', [res.data.key])

  // get player id from player keys
  const allPlayerKeys = new Set()
  for (const ballId of recentBalls) {
    const ball = ballData[ballId]
    allPlayerKeys.add(ball.batsman.player_key)
    allPlayerKeys.add(ball.bowler.player_key)
  }
  const playerIdKeyMap = await playersKeyToId(Array.from(allPlayerKeys))

  // get team id from team keys
  const teamKeys = [res.data.teams.a.key, res.data.teams.b.key]
  const { rows: teamsId } = await pool.query('SELECT id FROM team WHERE key IN ($1, $2);', teamKeys)

  // Get balls data from the ids extracted above
  const ballsToProcess = []
  for (const ballId of recentBalls) {
    const ball = ballData[ballId]

    ballsToProcess.push({
      id: parseInt(ball.key),
      match_id: matchId,
      batter: playerIdKeyMap[ball.batsman.player_key],
      bowler: playerIdKeyMap[ball.bowler.player_key],
      ball: parseFloat(`${ball.overs[0]}.${ball.overs[1]}`),
      team_id: ball.batting_team == 'a' ? teamsId[0].id : teamsId[1].id,
      runs_off_bat: ball.batsman.runs,
      extra: ball.team_score.extras,
      wide: ball.ball_type == 'wide' ? ball.team_score.extras : null,
      noball: ball.ball_type == 'no_ball' ? ball.team_score.extras : null,
      bye: ball.ball_type == 'bye' ? ball.team_score.extras : null,
      legbye: ball.ball_type == 'leg_bye' ? ball.team_score.extras : null,
      penalty: ball.ball_type == 'penalty' ? ball.team_score.extras : null,
      wicket: ball.bowler.is_wicket,
      six: ball.batsman.is_six,
      four: ball.batsman.is_four,
      commentary: ball.comment,
    })
  }

  await pool.insertMany(ballsToProcess, 'ball_by_ball_score', 'ON CONFLICT (id) DO NOTHING')
}
