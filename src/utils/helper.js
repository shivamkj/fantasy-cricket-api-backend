import NodeCache from 'node-cache'
import { createClient } from '@supabase/supabase-js'

export const PROD = process.env.NODE_ENV == 'production'

export const tll = {
  '2min': 60 * 2,
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

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export const round = (num) => {
  return Math.round((num + Number.EPSILON) * 100) / 100
}
