import { knex } from './utils.js'
import { randomDate, randomInt } from './utils.js'

const allTeams = [
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

const matchStartId = 10000

export async function createUpcomingMatches() {
  const matches = createMatches(200, matchStartId + liveMatchCount)
  await knex('match').insert(matches)
}

export const liveMatchCount = 5

export async function createLiveMatches() {
  const matches = createMatches(liveMatchCount, matchStartId)
  for (const match of matches) {
    match['live'] = true
    match['crr'] = randomInt(5, 12)
    match['t1_run'] = randomInt(18, 100)
    match['t1_over'] = randomInt(2, 18)
    match['t1_wicket'] = randomInt(1, 10)
    match['t2_run'] = randomInt(18, 100)
    match['t2_over'] = randomInt(2, 18)
    match['t2_wicket'] = randomInt(1, 10)
  }
  await knex('match').insert(matches)
}

function createMatches(count, startID) {
  const leagues = ['IPL World Cup', 'ODI world cup']

  const matches = []
  const start = new Date(2024, 5, 1)
  const end = new Date(2024, 9, 30)

  for (let index = 0; index < count; index++) {
    const team1Idx = randomInt(0, 9)
    let team2Idx = team1Idx
    while (team1Idx == team2Idx) {
      team2Idx = randomInt(0, 9)
    }
    matches.push({
      id: startID + index,
      team1_id: allTeams[team1Idx].id,
      team2_id: allTeams[team2Idx].id,
      start_time: randomDate(start, end),
      league: leagues[randomInt(0, 1)],
    })
  }
  return matches
}
