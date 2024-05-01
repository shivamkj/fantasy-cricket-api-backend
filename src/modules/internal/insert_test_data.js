import { match1Innings1, match1Innings2 } from '../../../test_data/ball_by_ball_data/match1.js'
import { match2Innings1, match2Innings2 } from '../../../test_data/ball_by_ball_data/match2.js'
import { match3Innings1, match3Innings2 } from '../../../test_data/ball_by_ball_data/match3.js'
import { match4Innings1, match4Innings2 } from '../../../test_data/ball_by_ball_data/match4.js'
import { match5Innings1, match5Innings2 } from '../../../test_data/ball_by_ball_data/match5.js'
import { matchStartId } from '../../../test_data/matches.js'
import { ClientErr } from '../../utils/fastify.js'
import { pool } from '../../utils/postgres.js'
import { getBallRange } from '../constants.js'
import { getTeamsId } from '../score_card.js'

export async function insertTestBalldata(request, reply) {
  const { innings, rangeId, matchId } = request.params
  if (!matchId) throw new ClientErr('matchId not passed')
  if (innings != 0 && innings != 1) throw new ClientErr('invalid innings')
  if (!rangeId) throw new ClientErr('rangeId not passed')

  const inningsData = findCorrectInnings(matchId, innings)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { team1Id, team2Id } = await getTeamsId(matchId, client)
    const teamId = innings == 0 ? team1Id : team2Id
    const [overStart, overEnd] = getBallRange(rangeId)

    if (rangeId == 5 && innings == 0) {
      const query = 'UPDATE match SET live = TRUE WHERE id = $1;'
      await client.query(query, [matchId])
    }

    const ticketProcessQry = 'INSERT INTO ticket_processed(match_id, ball_range_id, team_id) VALUES ($1, $2, $3)'
    await client.query(ticketProcessQry, [matchId, rangeId, teamId])

    const balls = []
    for (const { ball: ballNum, ...ball } of inningsData) {
      if (!(ballNum >= overStart && ballNum <= overEnd)) continue
      balls.push({
        match_id: matchId,
        batter: ball.batter,
        bowler: ball.bowler,
        ball: ballNum,
        team_id: teamId,
        runs_off_bat: ball.runs_off_bat,
        extra: ball.extras,
        wide: ball.wides,
        noball: ball.noballs,
        bye: ball.byes,
        legbye: ball.legbyes,
        penalty: null,
        wicket: Boolean(ball.wicket_type) ? true : null,
        six: ball.runs_off_bat == 6 ? true : null,
        four: ball.runs_off_bat == 4 ? true : null,
        commentary: ball.wicket_type,
      })
    }

    await client.insertMany(balls, 'ball_by_ball_score')
    await client.query('COMMIT')

    reply.send({ matchId, overStart, overEnd })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

const findCorrectInnings = (matchId, innings) => {
  if (matchId == matchStartId && innings == 0) return match1Innings1
  if (matchId == matchStartId && innings == 1) return match1Innings2

  if (matchId == matchStartId + 1 && innings == 0) return match2Innings1
  if (matchId == matchStartId + 1 && innings == 1) return match2Innings2

  if (matchId == matchStartId + 2 && innings == 0) return match3Innings1
  if (matchId == matchStartId + 2 && innings == 1) return match3Innings2

  if (matchId == matchStartId + 3 && innings == 0) return match4Innings1
  if (matchId == matchStartId + 3 && innings == 1) return match4Innings2

  if (matchId == matchStartId + 4 && innings == 0) return match5Innings1
  if (matchId == matchStartId + 4 && innings == 1) return match5Innings2
}
