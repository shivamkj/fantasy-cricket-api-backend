import 'dotenv/config'
import * as matches from './matches.js'
import * as betting from './betting.js'
import * as ballByBallData from './ball_by_ball_data.js'

await matches.createTeams()
await matches.createMatches()

await ballByBallData.createPlayers()
await ballByBallData.createBallByBallData()

await betting.createLobby()

process.exit(0)
