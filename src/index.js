#!/usr/bin/env node

import 'dotenv/config'
import { fastify } from './utils/fastify.js'
import { pool } from './utils/postgres.js'
import './routes.js'
import { worker } from './modules/async_processing/index.js'

const PORT = process.env.PORT || 3003

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, _) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log('Server is running on port', PORT)
})

async function cleanUp() {
  try {
    console.log('cleaning up everything')
    await fastify.close()
    await worker.close()
    await pool.end()
    console.log('shutting down')
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

process.once('SIGTERM', cleanUp)
process.once('SIGINT', cleanUp)

process.on('uncaughtException', function (err) {
  console.error('Uncaught exception', err)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at: Promise', { promise, reason })
})
