import NodeCache from 'node-cache'

export const PROD = process.env.NODE_ENV == 'production'

class CacheWrapper {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 60 * 60 * 1, // 1 hour
      checkperiod: 60 * 3, // 3 minutes
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
