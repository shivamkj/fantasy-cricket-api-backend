import { pool } from '../../utils/postgres.js'
import { currencyType } from '../constants.js'
import { subscribeToMatch } from '../cricket_api/create_matches.js'
import { addPlayers } from '../cricket_api/player.js'

const defaultLobbies = [
  { title: 'Star 50', entry_price: 50, currency_type: currencyType.coin, bet_price: 20, commission: 5 },
  { title: 'Legend 100', entry_price: 100, currency_type: currencyType.token, bet_price: 30, commission: 5 },
  { title: 'High Stakes', entry_price: 200, currency_type: currencyType.coin, bet_price: 40, commission: 0 },
  { title: 'Social Lobby', entry_price: 150, currency_type: currencyType.money, bet_price: 30, commission: 5 },
  { title: 'Social Lobby', entry_price: 250, currency_type: currencyType.money, bet_price: 50, commission: 0 },
  { title: 'Private Lobby', entry_price: 50, currency_type: currencyType.money, bet_price: 20, commission: 5 },
]

export async function setupLiveMatch(matchId) {
  const { setup_done, key } = await pool.queryOne('SELECT key, setup_done FROM match WHERE id = $1', [matchId])
  if (setup_done) return false

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await addPlayers(matchId, client)

    await subscribeToMatch(key, 'web_socket')
    // await subscribeToMatch(key, 'web_hook')

    const lobbies = Object.assign([], defaultLobbies)
    for (const lobby of lobbies) {
      lobby['match_id'] = matchId
    }
    await client.insertMany(lobbies, 'lobby')

    await client.query('UPDATE match SET setup_done = TRUE WHERE id = $1', [matchId])

    await client.query('COMMIT')

    return true
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
