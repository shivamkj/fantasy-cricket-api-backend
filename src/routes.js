import { fastify } from './utils/fastify.js'
import { getLobbyV1 as getLobbiesV1, listMatchesV1 } from './modules/match.js'
import { getCurrentOverBallsV1, getScoreCardV1 } from './modules/score_card.js'
import { listUserTicketV1, aggregateUserTicketV1 } from './modules/ticket.js'
import { buyBetV1, getBetPriceV1 } from './modules/betting/bet.js'
import { insertTestBalldata, startMatch } from './modules/internal/test_data_fill.js'
import { getResult, ticketResultRoute } from './modules/internal/reports.js'

fastify.get('/v1/matches', listMatchesV1)
fastify.get('/v1/matches/:matchId/lobby', getLobbiesV1)
fastify.get('/v1/matches/:matchId/over-balls', getCurrentOverBallsV1)
fastify.get('/v1/matches/:matchId/scorecard', getScoreCardV1)

fastify.get('/v1/matches/:matchId/tickets', listUserTicketV1)
fastify.get('/v1/users/:userId/tickets', aggregateUserTicketV1)

fastify.get('/v1/matches/:matchId/bet', getBetPriceV1)
fastify.post('/v1/matches/:matchId/ticket', buyBetV1)

fastify.post('/internal/:matchId/:innings/:rangeId/ball', insertTestBalldata)
fastify.post('/internal/:matchId/live', startMatch)
fastify.get('/internal/:matchId/:innings/:rangeId/result', getResult)
fastify.post('/internal/ticket/:ticketId/result', ticketResultRoute)
