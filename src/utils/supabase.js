import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

class SupabaseRealtime {
  async send(channelName, event, payload) {
    const channel = supabase.channel(channelName)
    await channel.send({ type: 'broadcast', event, payload })
    supabase.removeChannel(channel) // clean up the channel
  }
}

export const supabaseRealtime = new SupabaseRealtime()
