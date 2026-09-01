import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

/**
 * Null until P1/P6 hand over the project URL + anon key. The repository layer
 * checks this and falls back to the mock store, so the whole dashboard runs
 * without a backend — which is the Stage 0 requirement.
 *
 * Only ever the ANON key here. The schema comment suggests service_role to skip
 * RLS; that must not happen in a Vite app, because everything in this bundle
 * ships to the browser. Officer access needs real policies — see README.
 */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
        realtime: { params: { eventsPerSecond: 10 } },
      })
    : null

export const isLiveMode = supabase !== null

export const DEFAULT_CENTER_ID = import.meta.env.VITE_DEFAULT_CENTER_ID?.trim() || null
