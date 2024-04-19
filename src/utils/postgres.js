import pg from 'pg'
const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
  idleTimeoutMillis: 30000,
})

pg.types.setTypeParser(pg.types.builtins.INT8, (value) => parseInt(value))

pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value) => parseFloat(value))

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => parseFloat(value))

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
