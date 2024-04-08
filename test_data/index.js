import 'dotenv/config'
import * as matches from './matches.js'
import * as betting from './betting.js'

await matches.createTeams()
await matches.createLiveMatches()
await matches.createUpcomingMatches()

await betting.createLobby()

process.exit(0)
