const {createClient} = require("@supabase/supabase-js");

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY,
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  },
);
