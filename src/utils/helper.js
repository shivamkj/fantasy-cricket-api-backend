import NodeCache from 'node-cache'

export const PROD = process.env.NODE_ENV == 'production'

export const VIRTUAL = process.env.VIRTUAL == true

export const tll = {
  '2min': 60 * 2,
  '5min': 60 * 5,
  '30min': 60 * 30,
  '1hr': 60 * 60 * 1,
}

class CacheWrapper {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: tll['1hr'],
      checkperiod: tll['2min'],
    })
  }
  get(key) {
    return this.cache.get(key)
  }
  set(key, value, ttl) {
    this.cache.set(key, value, ttl)
  }
  del(key) {
    this.cache.del(key)
  }
}

export const Cache = new CacheWrapper()

export const round = (num) => {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

export function formatAMPM(date) {
  var hours = date.getHours()
  var minutes = date.getMinutes()
  var ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes
  var strTime = hours + ':' + minutes + ' ' + ampm
  return strTime
}
