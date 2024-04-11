import fastifyPackage from 'fastify'

export const fastify = fastifyPackage({
  logger: true,
})

// Route for Health Check
fastify.get('/', (request, reply) => {
  reply.send({ status: 'OK' })
})

export function notFound(reply, entity = 'entity') {
  return reply.code(404).send({ error: `${entity} not found` })
}

export function clientErr(reply, error = 'Invalid Data passed') {
  return reply.code(400).send({ error: error })
}
