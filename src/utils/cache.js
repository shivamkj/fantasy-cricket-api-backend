import NodeCache from 'node-cache'

class CacheWrapper {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 60 * 60 * 3, // 3 minute
      checkperiod: 60 * 60, // 1 minute
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
