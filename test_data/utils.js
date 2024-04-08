import createKnex from 'knex'

export const knex = createKnex({
  client: 'pg',
  connection: process.env.CONNECTION_STRING,
  searchPath: ['public'],
  useNullAsDefault: true,
})

// min and max included
export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

export const randomDate = (start, end, startHour, endHour) => {
  var date = new Date(+start + Math.random() * (end - start))
  if (startHour && endHour) {
    var hour = (startHour + Math.random() * (endHour - startHour)) | 0
    date.setHours(hour)
  }
  return date
}

export const randomBool = (probability = 0.5) => Math.random() < probability

export const dateToISOInt = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  // Construct the ISO date string and convert it to an integer
  return parseInt(`${year}${month}${day}`, 10)
}
