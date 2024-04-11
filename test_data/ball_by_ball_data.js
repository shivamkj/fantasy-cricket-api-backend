import { match1Innings1, match1Innings2 } from './ball_by_ball_data/match1.js'
import { match2Innings1, match2Innings2 } from './ball_by_ball_data/match2.js'
import { match3Innings1, match3Innings2 } from './ball_by_ball_data/match3.js'
import { match4Innings1, match4Innings2 } from './ball_by_ball_data/match4.js'
import { match5Innings1, match5Innings2 } from './ball_by_ball_data/match5.js'
import { players } from './ball_by_ball_data/players.js'
import { knex } from './utils.js'
import { allTeams, matchStartId, liveMatches } from './matches.js'

export async function createPlayers() {
  await knex('player').insert(players)
}

export async function createBallByBallData() {
  const playersIdMap = {}
  for (const player of players) {
    playersIdMap[`${player.first_name} ${player.last_name}`] = player.id
  }
  const teamsId = await knex('match')
    .select('team1_id', 'team2_id')
    .whereBetween('id', [matchStartId, matchStartId + liveMatches])

  const allInnings = [
    { matchId: matchStartId + 0, teamId: teamsId[0].team1_id, inning: match1Innings1 },
    { matchId: matchStartId + 0, teamId: teamsId[0].team2_id, inning: match1Innings2 },
    { matchId: matchStartId + 1, teamId: teamsId[1].team1_id, inning: match2Innings1 },
    { matchId: matchStartId + 1, teamId: teamsId[1].team2_id, inning: match2Innings2 },
    { matchId: matchStartId + 2, teamId: teamsId[2].team1_id, inning: match3Innings1 },
    { matchId: matchStartId + 2, teamId: teamsId[2].team2_id, inning: match3Innings2 },
    { matchId: matchStartId + 3, teamId: teamsId[3].team1_id, inning: match4Innings1 },
    { matchId: matchStartId + 3, teamId: teamsId[3].team2_id, inning: match4Innings2 },
    { matchId: matchStartId + 4, teamId: teamsId[4].team1_id, inning: match5Innings1 },
    { matchId: matchStartId + 4, teamId: teamsId[4].team2_id, inning: match5Innings2 },
  ]

  const teamLastIdx = allTeams.length - 1
  const balls = []

  for (const inning of allInnings) {
    for (const ball of inning.inning) {
      balls.push({
        match_id: inning.matchId,
        batter: ball.batter,
        bowler: ball.bowler,
        ball: ball.ball,
        teamid: inning.teamId,
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
  }

  await knex('ball_by_ball_score').insert(balls)
}
