const { createClient } = require('@supabase/supabase-js')

const SupabaseClient = createClient('https://your-project-ref.supabase.co', 'anon-key', {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})
