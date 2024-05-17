import { ClientErr } from '../../utils/fastify.js'
import { Cache, round } from '../../utils/helper.js'
import { pool } from '../../utils/postgres.js'
import { betType, betValToRangeId, getBallRange } from '../constants.js'

export const allResults = async (matchId, ballRangeId, teamId) => {
  const cacheKey = `${matchId},${ballRangeId},${teamId}`
  const value = Cache.get(cacheKey)
  if (value) return value

  const batterListQuery = `
SELECT DISTINCT batter FROM ball_by_ball_score
WHERE match_id = $1 AND team_id = $2 AND ball >= $3 AND ball <= $4;
`
  const { rows: allBatters } = await pool.query(batterListQuery, [matchId, teamId, ...getBallRange(ballRangeId)])
  if (allBatters.length == 0) throw new ClientErr('result not available')

  const bowlerListQuery = `
SELECT DISTINCT bowler FROM ball_by_ball_score
WHERE match_id = $1 AND team_id = $2 AND ball >= $3 AND ball <= $4;
`
  const { rows: allBowlers } = await pool.query(bowlerListQuery, [matchId, teamId, ...getBallRange(ballRangeId)])

  const battersRun = {}
  for (const { batter } of allBatters) {
    const value = await getBatterRun(matchId, ballRangeId, batter)
    battersRun[batter] = { value, id: betValToRangeId(betType.batterRun, value) }
  }

  const bowlersRun = {}
  for (const { bowler } of allBowlers) {
    const value = await getBowlersRun(matchId, ballRangeId, bowler)
    bowlersRun[bowler] = { value, id: betValToRangeId(betType.bowlerRun, value) }
  }

  const batterWicket = {}
  for (const { batter } of allBatters) {
    const value = await getBatterWicket(matchId, ballRangeId, batter)
    batterWicket[batter] = { value, id: betValToRangeId(betType.batterWicket, value) }
  }

  const runRate = await getRunRate(matchId, ballRangeId, teamId)
  const wicket = await getWicket(matchId, ballRangeId, teamId)
  const economy = await getEconomy(matchId, ballRangeId, teamId)
  const teamRun = await getTeamRun(matchId, ballRangeId, teamId)
  const boundaries = await getBoundaries(matchId, ballRangeId, teamId)

  const result = {
    [betType.batterRun]: battersRun,
    [betType.bowlerRun]: bowlersRun,
    [betType.batterWicket]: batterWicket,
    [betType.runRate]: {
      value: round(runRate),
      id: betValToRangeId(betType.runRate, runRate),
    },
    [betType.wicket]: {
      value: wicket,
      id: betValToRangeId(betType.wicket, wicket),
    },
    [betType.economy]: {
      value: round(economy),
      id: betValToRangeId(betType.economy, economy),
    },
    [betType.teamRun]: {
      value: teamRun,
      id: betValToRangeId(betType.teamRun, teamRun),
    },
    [betType.boundaries]: {
      value: boundaries,
      id: betValToRangeId(betType.boundaries, boundaries),
    },
  }

  Cache.set(cacheKey, result)
  return result
}

export const getBatterRun = async (matchId, ballRangeId, batterId) => {
  const query = `
SELECT SUM(runs_off_bat) AS runs FROM ball_by_ball_score
WHERE match_id = $1 AND batter = $2 AND ball >= $3 AND ball <= $4
`
  const { runs } = await pool.queryOne(query, [matchId, batterId, ...getBallRange(ballRangeId)])
  return runs
}

export const getBowlersRun = async (matchId, ballRangeId, bowlerId) => {
  const query = `
SELECT SUM(runs_off_bat + COALESCE(wide, 0) + COALESCE(noball, 0)) AS runs FROM ball_by_ball_score
WHERE match_id = $1 AND bowler = $2 AND ball >= $3 AND ball <= $4
`
  const { runs } = await pool.queryOne(query, [matchId, bowlerId, ...getBallRange(ballRangeId)])
  return runs
}

// Run rate = runs scored / Overs bowled
export const getRunRate = async (matchId, ballRangeId, teamId) => {
  const query = `
SELECT SUM(COALESCE(runs_off_bat, 0) + COALESCE(extra, 0)) AS runs, MAX(ball) as balls
FROM ball_by_ball_score WHERE match_id = $1 AND team_id = $2 AND ball >= $3 AND ball <= $4
`
  const { rows } = await pool.query(query, [matchId, teamId, ...getBallRange(ballRangeId)])
  const completedOvers = Math.trunc(rows[0].balls)
  const runRate = rows[0].runs / (completedOvers + (rows[0].balls - completedOvers + 1) / 6)
  return runRate
}

export const getWicket = async (matchId, ballRangeId, teamId) => {
  const query = `
SELECT COUNT(wicket) AS wickets FROM ball_by_ball_score
WHERE match_id = $1 AND team_id = $2 AND ball >= $3 AND ball <= $4
`
  const { wickets } = await pool.queryOne(query, [matchId, teamId, ...getBallRange(ballRangeId)])
  return wickets
}

// Economy = Runs conceded / Overs bowled
export const getEconomy = async (matchId, ballRangeId, teamId) => {
  const query = `
SELECT ROUND(SUM(runs_off_bat + COALESCE(wide, 0) + COALESCE(noball, 0)) / (COUNT(DISTINCT ball) / 6.0), 2) AS economy
FROM ball_by_ball_score WHERE match_id = $1 AND team_id = $2 AND ball >= $3 AND ball <= $4
`
  const { economy } = await pool.queryOne(query, [matchId, teamId, ...getBallRange(ballRangeId)])
  return economy
}

export const getTeamRun = async (matchId, ballRangeId, teamId) => {
  const query = `
SELECT COALESCE(SUM(runs_off_bat + extra), 0) AS runs FROM ball_by_ball_score
WHERE match_id = $1 AND team_id = $2 AND ball >= $3 AND ball <= $4
`
  const { runs } = await pool.queryOne(query, [matchId, teamId, ...getBallRange(ballRangeId)])
  return runs
}

export const getBoundaries = async (matchId, ballRangeId, teamId) => {
  const query = `
SELECT COUNT(six) AS sixes, COUNT(four) AS fours FROM ball_by_ball_score
WHERE match_id = $1 AND team_id = $2 AND ball >= $3 AND ball <= $4
`
  const { sixes, fours } = await pool.queryOne(query, [matchId, teamId, ...getBallRange(ballRangeId)])
  return sixes + fours
}

// returns true if batter was out else false
export const getBatterWicket = async (matchId, ballRangeId, batterId) => {
  const query = `
SELECT COUNT(wicket) + COUNT(run_out) AS wicket FROM ball_by_ball_score
WHERE match_id = $1 AND batter = $2 AND ball >= $3 AND ball <= $4
`
  const { wicket } = await pool.queryOne(query, [matchId, batterId, ...getBallRange(ballRangeId)])
  return Boolean(wicket)
}
