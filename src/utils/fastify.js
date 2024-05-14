import fastifyPackage from 'fastify'
import { PROD } from './helper.js'
import jwt from 'jsonwebtoken'

export const fastify = fastifyPackage({})

// Route for Health Check
fastify.get('/', (request, reply) => {
  reply.send({ status: 'OK' })
})

fastify.setErrorHandler((err, _, reply) => {
  if (PROD) {
    return reply.status(500).send({ error: 'Internal Server Error' })
  }

  if (err.name == customError) {
    return reply.status(err.httpCode).send({ error: err.message })
  }
  console.error(err)
  reply.status(500).send({ error: err.message })
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

const jwtSecret = process.env.JWT_SECRET

// Auth Handler
export const authHandler = (request, reply, done) => {
  const authHeader = request.headers.authorization?.replace('Bearer ', '')

  jwt.verify(authHeader, jwtSecret, function (err, decoded) {
    if (err == null) {
      request.userId = decoded.sub
      done()
    } else {
      reply.status(401).send({ error: 'Unauthorized (Invalid Token)' })
    }
  })
}
