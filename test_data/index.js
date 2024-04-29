import 'dotenv/config'
import * as misc from './misc.js'
import * as matches from './matches.js'
import * as betting from './betting.js'

await matches.createTeams()
await matches.createMatches()
await matches.createPlayers()

await misc.createUsers()

await betting.createLobby()
await betting.createBetPrice()
await betting.createTicket()

process.exit(0)
