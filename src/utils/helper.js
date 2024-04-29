import NodeCache from 'node-cache'

export const PROD = process.env.NODE_ENV == 'production'

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

export function throttle(func) {
  let throttled = false
  return async function (...args) {
    if (throttled) return
    try {
      throttled = true
      await func.apply(this, args)
    } catch (err) {
      console.error(err)
    } finally {
      throttled = false
    }
  }
}
