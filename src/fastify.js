import fastifyPackage from 'fastify'
import { getLobbyV1, getMatchesV1 } from './modules/match.js'
import { getLast6BallsV1, getScoreCardV1 } from './modules/score_card.js'

export const fastify = fastifyPackage({
  logger: true,
})

// Route for Health Check
fastify.get('/', (request, reply) => {
  reply.send({ status: 'OK' })
})

fastify.get('/v1/matches', getMatchesV1)
fastify.get('/v1/matches/:matchId/lobby', getLobbyV1)
fastify.get('/v1/matches/:matchId/last-6-balls', getLast6BallsV1)
fastify.get('/v1/matches/:matchId/scorecard', getScoreCardV1)
