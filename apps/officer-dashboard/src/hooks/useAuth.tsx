import * as React from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase, isLiveMode } from "@/lib/supabase"
import type { Officer } from "@/lib/types"

/**
 * Supabase auth for the officer desk.
 *
 * Two sign-in routes, because P1 enabled phone OTP but email/password stays on
 * as the fallback that does not depend on an SMS provider being reachable:
 *
 *   phone  -> signInWithOtp({ phone })  then verifyOtp
 *   email  -> signInWithPassword({ email, password })
 *
 * Either way the result is one `auth.users` row, and `officers.officer_id` is
 * that user's UID — no separate lookup table, per P1's handover. The officer
 * row is what supplies the desk's name and centre, so a signed-in user who is
 * not an officer is a distinct, reportable state rather than an empty queue.
 *
 * In mock mode every method is inert: `supabase` is null and the desk falls
 * back to the name-and-centre card instead.
 */

export interface AuthContextValue {
  user: User | null
  officer: Officer | null
  /** Restoring a stored session, or loading the officer row behind it. */
  loading: boolean
  /** Signed in, but no matching row in `officers`. */
  notAnOfficer: boolean
  sendOtp: (phone: string) => Promise<void>
  verifyOtp: (phone: string, code: string) => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

/**
 * Supabase wants E.164. Officers type the ten digits printed on their pass, so
 * assume +91 unless they typed a country code themselves.
 */
export function toE164(input: string): string {
  const trimmed = input.trim()
  if (trimmed.startsWith("+")) return "+" + trimmed.slice(1).replace(/\D/g, "")
  const digits = trimmed.replace(/\D/g, "")
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`
  return `+${digits}`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [officer, setOfficer] = React.useState<Officer | null>(null)
  const [loading, setLoading] = React.useState(isLiveMode)
  const [notAnOfficer, setNotAnOfficer] = React.useState(false)

  const applySession = React.useCallback(async (session: Session | null) => {
    const nextUser = session?.user ?? null
    setUser(nextUser)

    if (!nextUser || !supabase) {
      setOfficer(null)
      setNotAnOfficer(false)
      setLoading(false)
      return
    }

    // maybeSingle, not single: "no such officer" is a state to report, not a
    // thrown error. RLS also returns zero rows here if the policy excludes
    // this user, which looks identical from the client and is handled the same.
    const { data, error } = await supabase
      .from("officers")
      .select("officer_id, full_name, center_id")
      .eq("officer_id", nextUser.id)
      .maybeSingle()

    if (error) {
      setOfficer(null)
      setNotAnOfficer(true)
    } else {
      setOfficer((data as Officer) ?? null)
      setNotAnOfficer(data === null)
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let cancelled = false

    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) void applySession(data.session)
    })

    // Fires on sign-in, sign-out, and token refresh, so a session restored in
    // another tab lands here too.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) void applySession(session)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [applySession])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      officer,
      loading,
      notAnOfficer,

      async sendOtp(phone) {
        if (!supabase) throw new Error("No Supabase project configured")
        const { error } = await supabase.auth.signInWithOtp({ phone: toE164(phone) })
        if (error) throw error
      },

      async verifyOtp(phone, code) {
        if (!supabase) throw new Error("No Supabase project configured")
        const { error } = await supabase.auth.verifyOtp({
          phone: toE164(phone),
          token: code.trim(),
          type: "sms",
        })
        if (error) throw error
      },

      async signInWithPassword(email, password) {
        if (!supabase) throw new Error("No Supabase project configured")
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error
      },

      async signOut() {
        if (!supabase) return
        await supabase.auth.signOut()
        setOfficer(null)
        setNotAnOfficer(false)
      },
    }),
    [user, officer, loading, notAnOfficer],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
