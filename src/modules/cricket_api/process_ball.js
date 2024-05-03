import { pool } from '../../utils/postgres.js'
import { asyncQueue, tasks } from '../async_processing/index.js'
import { playersKeyToId } from './player.js'

const ballToProcess = 6

const upsertStatement = `
ON CONFLICT (id)
DO UPDATE SET
  runs_off_bat = excluded.runs_off_bat,
  extra = excluded.extra,
  wide = excluded.wide,
  noball = excluded.noball,
  bye = excluded.bye,
  legbye = excluded.legbye,
  penalty = excluded.penalty,
  wicket = excluded.wicket,
  six = excluded.six,
  four = excluded.four,
  commentary = excluded.commentary;
`

export const processMatchUpdate = async (res) => {
  try {
    const recentOvers = res.data.play?.live?.recent_overs
    if (!recentOvers || recentOvers?.length === 0) return

    // Grab id of recent balls
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
        wicket: ball.bowler.is_wicket ? true : null,
        four: ball.batsman.is_four ? true : null,
        six: ball.batsman.is_six ? true : null,
        commentary: ball.comment,
      })
    }

    await pool.insertMany(ballsToProcess, 'ball_by_ball_score', upsertStatement)

    const lastBall = ballData[recentBalls[0]]
    await asyncQueue.add(tasks.processBallUpdate, {
      matchId,
      ball: parseFloat(`${lastBall.overs[0]}.${lastBall.overs[1]}`),
    })
  } catch (err) {
    console.error(err)
    console.error(JSON.stringify(res))
  }
}
