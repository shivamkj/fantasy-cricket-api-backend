import { knex } from './utils.js'
import { randomDate, randomInt } from './utils.js'
import { players } from './ball_by_ball_data/players.js'

const baseURLLogo = 'https://yfiotzbqlesommmuhbwv.supabase.co/storage/v1/object/public/test.internal.public/'
export const allTeams = [
  { id: 1, team_name: 'Chennai Super Kings', code: 'CSK', logo: `${baseURLLogo}CSK.png` },
  { id: 4, team_name: 'Delhi Capitals', code: 'DC', logo: `${baseURLLogo}DC.png` },
  { id: 7, team_name: 'Kolkata Knight Riders', code: 'KKR', logo: `${baseURLLogo}KKR.png` },
  { id: 9, team_name: 'Punjab Kings', code: 'PK', logo: `${baseURLLogo}PK.png` },
  { id: 12, team_name: 'Mumbai Indians', code: 'MI', logo: `${baseURLLogo}MI.png` },
  { id: 15, team_name: 'Sunrisers Hyderabad', code: 'SRH', logo: `${baseURLLogo}SRH.png` },
  { id: 18, team_name: 'Rajasthan Royals', code: 'RR', logo: `${baseURLLogo}RR.png` },
  { id: 20, team_name: 'Royal Challengers Bengaluru', code: 'RCB', logo: `${baseURLLogo}RCB.png` },
  { id: 25, team_name: 'Gujarat Titans', code: 'GT', logo: `${baseURLLogo}GT.png` },
  { id: 28, team_name: 'Lucknow Super Giants', code: 'LSG', logo: `${baseURLLogo}LSG.png` },
]

export async function createPlayers() {
  await knex('player').insert(players)
}

export async function createTeams() {
  await knex('team').insert(allTeams)
}

export const totalMatches = 205
export const liveMatches = 5
export const matchStartId = 10000

export async function createMatches() {
  const matches = []

  const leagues = ['IPL World Cup', 'ODI world cup']
  const start = new Date(2024, 5, 1)
  const end = new Date(2024, 9, 30)

  for (let index = 0; index < totalMatches; index++) {
    const { team1, team2 } = randomTeams()
    matches.push({
      id: matchStartId + index,
      key: `${matchStartId + index}`,
      team1_id: team1.id,
      team2_id: team2.id,
      start_time: randomDate(start, end),
      league: leagues[randomInt(0, 1)],
      live: false,
    })
  }

  await knex('match').insert(matches)
}

export function randomTeams() {
  const teamLastIdx = allTeams.length - 1
  const team1Idx = randomInt(0, teamLastIdx)
  let team2Idx = team1Idx
  while (team1Idx == team2Idx) {
    team2Idx = randomInt(0, teamLastIdx)
  }
  return { team1: allTeams[team1Idx], team2: allTeams[team2Idx] }
}
