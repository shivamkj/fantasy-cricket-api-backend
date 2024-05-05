import pg from 'pg'
const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
  keepAlive: true,
  idleTimeoutMillis: 30000,
  max: 20,
  connectionTimeoutMillis: 5000,
})

async function queryOne(query, values) {
  const {
    rows: [firstRow],
  } = await this.query(query, values)
  return firstRow
}
pg.Pool.prototype.queryOne = queryOne
pg.Client.prototype.queryOne = queryOne

function insertMany(values, tableName, appendQuery = '') {
  const allKeys = Object.keys(values[0])

  const valArr = []
  const queryValues = []
  let paramsCount = 1
  for (const obj of values) {
    for (const key of allKeys) {
      valArr.push(obj[key])
    }
    queryValues.push(`(${allKeys.map(() => `$${paramsCount++}`).join(', ')})`)
  }

  const query = `INSERT INTO ${tableName} (${allKeys.join(', ')}) VALUES ${queryValues.join(', ')} ${appendQuery};`
  return this.query(query, valArr)
}
pg.Pool.prototype.insertMany = insertMany
pg.Client.prototype.insertMany = insertMany

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
