import { pool } from '../postgres.js'

export async function getMatches(request, reply) {
  try {
    const { rows } = await pool.query('select * from match limit 10')

    reply.send({ data: rows })
  } catch (error) {
    // Handle errors
    console.error(error)
    reply.status(500).send({ error: 'Internal Server Error' })
  }
}
