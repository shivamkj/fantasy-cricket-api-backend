import 'dotenv/config'
import { fastify } from './fastify.js'
import { pool } from './postgres.js'
import './routes.js'

export const PROD = process.env.PROD == 'prod'
const PORT = process.env.PORT || 3003

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, _) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log('Server is running on port', PORT)
})

async function cleanUp() {
  console.log('cleaning up everything')
  await fastify.close()
  await pool.end()
  console.log('shutting down')
}

process.once('SIGTERM', cleanUp)
process.once('SIGINT', cleanUp)
