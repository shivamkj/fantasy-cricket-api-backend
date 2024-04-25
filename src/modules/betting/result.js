import { pool } from '../../utils/postgres'

export const betTypeArr = [
  betType.batterRun,
  betType.runRate,
  betType.bowlerRun,
  betType.wicket,
  betType.economy,
  betType.teamRun,
  betType.boundaries,
  betType.batterWicket,
]

// Test Params: matchId: 10000 AND batter: 12297
export const getBatterRun = async (matchId, batterId) => {
  const query = `
SELECT SUM(COALESCE(runs_off_bat, 0) + COALESCE(extra, 0)) AS runs FROM ball_by_ball_score
WHERE match_id = $1 AND batter = $1 AND ball >= 6.1 AND ball <= 10.6
`
  const { rows } = await pool.query(query, [matchId, batterId])
  return { runs: rows[0].runs }
}

// Test Params: matchId: 10000 AND bowler: 12148
export const getBowlersRun = async (matchId, bowlerId) => {
  const query = `
SELECT SUM(COALESCE(runs_off_bat, 0) + COALESCE(extra, 0)) AS runs FROM ball_by_ball_score
WHERE match_id = $1 AND bowler = $2 AND ball >= 6.1 AND ball <= 10.6
`
  const { rows } = await pool.query(query, [matchId, bowlerId])
  return { runs: rows[0].runs }
}

// Test Params: matchId: 10000 AND teamId: 18
export const getRunRate = async (matchId, teamId) => {
  const query = `
SELECT SUM(COALESCE(runs_off_bat, 0) + COALESCE(extra, 0)) AS runs, MAX(ball) as balls
FROM ball_by_ball_score WHERE match_id = $1 AND teamid = $2 AND ball >= 6.1 AND ball <= 10.6
`
  const { rows } = await pool.query(query, [matchId, teamId])
  const completedOvers = Math.trunc(rows[0].balls)
  const runRate = rows[0].runs / (completedOvers + (rows[0].balls - completedOvers + 1) / 6)
  return { runRate }
}

// Run rate = runs scored / number of overs bowled
export const getWicket = async (matchId, teamId) => {
  const query = `
SELECT COUNT(wicket) AS wickets FROM ball_by_ball_score
WHERE match_id = $1 AND teamid = $2 AND ball >= 0.1 AND ball <= 5.6
`
  const { rows } = await pool.query(query, [matchId, teamId])
  const completedOvers = Math.trunc(rows[0].balls)
  const runRate = rows[0].runs / (completedOvers + (rows[0].balls - completedOvers + 1) / 6)
  return { runRate }
}

// Economy = Runs conceded / Overs bowled
// Run rate = runs scored / number of overs bowled
export const getEconomy = async (matchId, teamId) => {
  const query = `
SELECT SUM(COALESCE(runs_off_bat, 0) + COALESCE(extra, 0)) AS runs, COUNT(*) as balls
FROM ball_by_ball_score WHERE match_id = $1 AND teamid = $2 AND ball >= 6.1 AND ball <= 10.6
`
  const { rows } = await pool.query(query, [matchId, teamId])
  const completedOvers = Math.trunc(rows[0].balls)
  const economy = rows[0].runs / (completedOvers + (rows[0].balls - completedOvers + 1) / 6)
  return { economy }
}

// Test Params: matchId: 10000 AND teamId: 18
export const getTeamRun = async (matchId, teamId) => {
  const query = `
SELECT SUM(COALESCE(runs_off_bat, 0) + COALESCE(extra, 0)) AS runs FROM ball_by_ball_score
WHERE match_id = $1 AND teamid = $2 AND ball >= 0.1 AND ball <= 5.6
`
  const { rows } = await pool.query(query, [matchId, teamId])
  return { runs: rows[0].runs }
}

// Test Params: matchId: 10000 AND teamId: 18
export const getBoundaries = async (matchId, teamId) => {
  const query = `
SELECT COUNT(six) AS sixes, COUNT(four) AS fours FROM ball_by_ball_score
WHERE match_id = 10000 AND teamid = 18 AND ball >= 0.1 AND ball <= 5.6
`
  const { rows } = await pool.query(query, [matchId, teamId])
  return { boundaries: rows[0].sixes + rows[0].fours }
}

// returns true if batter was out else false
// Test Params: matchId: 10000 AND batter: 12297
export const getBatterWicket = async (matchId, batterId) => {
  const query = `
SELECT COUNT(wicket) as wicket FROM ball_by_ball_score
WHERE match_id = 10000 AND batter = 12297 AND ball >= 0.1 AND ball <= 5
`
  const { rows } = await pool.query(query, [matchId, batterId])
  return { runs: Boolean(rows[0].wicket) }
}
