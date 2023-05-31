const { createClient } = require('@supabase/supabase-js')

export const supabase = createClient('https://wdwiwhwjivnlyvwhxywe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkd2l3aHdqaXZubHl2d2h4eXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODE4NTUyNDgsImV4cCI6MTk5NzQzMTI0OH0.tTwpfV6xD3VYic3aXnSdVK8pqzSHfqy0-lwVPVtH42Y', {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})
