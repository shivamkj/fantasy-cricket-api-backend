import { fastify, authHandler } from './utils/fastify.js'
import { getLobbyV1 as getLobbiesV1, listEndedMatchesV1, listFeaturedMatchesV1 } from './modules/match.js'
import { getLiveMatchScoreV1, getScoreCardV1 } from './modules/score_card.js'
import { listUserTicketV1, aggregateUserTicketV1 } from './modules/ticket.js'
import { buyTicketV1, getBetPriceV1, getBetSlot } from './modules/betting/buy_ticket.js'
import { insertTestBalldata } from './modules/internal/insert_test_data.js'
import { getResult, ticketResultRoute } from './modules/internal/reports.js'
import { processAsyncTasks } from './modules/async_processing/index.js'
import { getPlayersV1 } from './modules/betting/player.js'
import { completeKyc, userDetails } from './modules/user.js'

// ****************** Public Routes ******************

fastify.get('/v1/matches', listFeaturedMatchesV1)
fastify.get('/v1/matches/ended', listEndedMatchesV1)
fastify.get('/v1/matches/:matchId/lobby', getLobbiesV1)
fastify.get('/v1/matches/:matchId/live', getLiveMatchScoreV1)
fastify.get('/v1/matches/:matchId/scorecard', getScoreCardV1)

// ****************** Private Routes ******************

export const privateRoutes = (fastify, options, done) => {
  fastify.addHook('preHandler', authHandler)

  fastify.get('/v1/matches/:lobbyId/bet', getBetPriceV1)
  fastify.get('/v1/matches/betSlot/:matchId', getBetSlot)
  fastify.get('/v1/matches/:matchId/tickets', listUserTicketV1)
  fastify.post('/v1/matches/:matchId/ticket', buyTicketV1)
  fastify.put('/v1/matches/:matchId/ticket', buyTicketV1)
  fastify.get('/v1/users/tickets', aggregateUserTicketV1)
  fastify.get('/v1/matches/:matchId/:betType/players', getPlayersV1)
  fastify.post('/v1/user/kyc', completeKyc)
  fastify.put('/v1/user/kyc', completeKyc)
  fastify.get('/v1/user/details', userDetails)

  // internal routes
  fastify.post('/internal/:matchId/:innings/:rangeId/ball', insertTestBalldata)
  fastify.get('/internal/:matchId/:innings/:rangeId/result', getResult)
  fastify.post('/internal/ticket/:ticketId/result', ticketResultRoute)
  fastify.post('/internal/process-async', processAsyncTasks)

  done()
}

fastify.register(privateRoutes)
