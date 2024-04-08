import pg from 'pg'
const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
  idleTimeoutMillis: 30000,
})

try {
  // the pool will emit an error on behalf of any idle clients
  // it contains if a backend error or network partition happens
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
  })
} catch (err) {
  console.error(err)
}
