import { knex } from './utils.js'
import { randomDate, randomInt } from './utils.js'

export const allTeams = [
  { id: 1, team_name: 'Chennai Super Kings', logo: 'CSK.webp' },
  { id: 4, team_name: 'Delhi Capitals', logo: 'DC.webp' },
  { id: 7, team_name: 'Kolkata Knight Riders', logo: 'KKR.png' },
  { id: 9, team_name: 'Punjab Kings', logo: 'PK.webp' },
  { id: 12, team_name: 'Mumbai Indians', logo: 'MI.webp' },
  { id: 15, team_name: 'Sunrisers Hyderabad', logo: 'SRH.png' },
  { id: 18, team_name: 'Rajasthan Royals', logo: 'RR.webp' },
  { id: 20, team_name: 'Royal Challengers Bengaluru', logo: 'RCB.png' },
  { id: 25, team_name: 'Gujarat Titans', logo: 'GT.webp' },
  { id: 28, team_name: 'Lucknow Super Giants', logo: 'LSG.webp' },
]

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
      team1_id: team1.id,
      team2_id: team2.id,
      start_time: randomDate(start, end),
      league: leagues[randomInt(0, 1)],
      live: false,
    })
  }

  for (let index = 0; index < liveMatches; index++) {
    matches[index]['live'] = true
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
