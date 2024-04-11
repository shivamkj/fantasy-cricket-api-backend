import { fastify } from './fastify.js'
import { getLobbyV1 as getLobbiesV1, listMatchesV1 } from './modules/match.js'
import { getLast6BallsV1, getScoreCardV1 } from './modules/score_card.js'
import { buyTicketV1, listUserTicketV1, aggregateUserTicketV1 } from './modules/ticket.js'

fastify.get('/v1/matches', listMatchesV1)
fastify.get('/v1/matches/:matchId/lobby', getLobbiesV1)
fastify.get('/v1/matches/:matchId/last-6-balls', getLast6BallsV1)
fastify.get('/v1/matches/:matchId/scorecard', getScoreCardV1)

fastify.post('/v1/matches/:matchId/tickets', buyTicketV1)
fastify.get('/v1/matches/:matchId/tickets', listUserTicketV1)
fastify.get('/v1/users/:userId/tickets', aggregateUserTicketV1)
