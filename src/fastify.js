import fastifyPackage from 'fastify'
import { getLast6BallsV1, getLobbyV1, getMatchesV1 } from './modules/match.js'

export const fastify = fastifyPackage({
  logger: true,
})

// Route for Health Check
fastify.get('/', (request, reply) => {
  reply.send({ status: 'OK' })
})

fastify.get('/api/v1/matches', getMatchesV1)
fastify.get('/api/v1/matches/lobby', getLobbyV1)
fastify.get('/api/v1/matches/last-6-balls', getLast6BallsV1)
