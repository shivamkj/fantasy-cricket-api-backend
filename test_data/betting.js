import { knex } from './utils.js'
import { randomInt } from './utils.js'

const lobbies = [
  { title: 'Star 50', price: 50 },
  { title: 'Legend 100', price: 100 },
  { title: 'High Stakes', price: 200 },
  { title: 'Social Lobby', price: 150 },
  { title: 'Private Lobby', price: 0 },
]

export async function createLobby() {
  for (let index = 10000; index < 10204; index++) {
    const matchLobbies = Object.assign([], lobbies)
    for (const lobby of matchLobbies) {
      lobby['match_id'] = index
      if (index < 1004) lobby['playing_count'] = randomInt(2000, 10000)
    }
    await knex('lobby').insert(matchLobbies)
  }
}
