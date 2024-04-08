import fastifyPackage from 'fastify'
import { getMatches } from './match/index.js'

export const fastify = fastifyPackage({
  logger: true,
})

// Route for Health Check
fastify.get('/', (request, reply) => {
  reply.send({ status: 'OK' })
})

fastify.get('/api/v1/matches', getMatches)
