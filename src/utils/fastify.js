import fastifyPackage from 'fastify'

export const PROD = process.env.NODE_ENV == 'production'

export const fastify = fastifyPackage({
  logger: !PROD,
})

// Route for Health Check
fastify.get('/', (request, reply) => {
  reply.send({ status: 'OK' })
})

fastify.setErrorHandler((err, _, reply) => {
  if (err.name == customError) {
    reply.status(err.httpCode).send({ error: err.message })
  }

  if (PROD) {
    reply.status(500).send({ error: 'Internal Server Error' })
  } else {
    console.log(err)
    reply.status(500).send({ error: err.message })
  }
})

const customError = 'customError'

export class NotFound extends Error {
  constructor(entity) {
    super(`${entity} not found`)
    this.httpCode = 404
    this.name = customError
  }
}

export class ClientErr extends Error {
  constructor(error) {
    super(error ?? 'Client ERROR')
    this.httpCode = 400
    this.name = customError
  }
}
