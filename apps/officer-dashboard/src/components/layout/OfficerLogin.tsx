import * as React from "react"
import { Loader2, Sprout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

/**
 * Real sign-in, used whenever a Supabase project is configured. The mock
 * dataset keeps the name-and-centre card in SignIn.tsx instead — there is no
 * auth server to talk to there, and the demo must run without one.
 *
 * Phone is the primary route because it matches how farmers sign in. Email
 * stays available: it does not depend on an SMS provider being reachable, so
 * it is the route that still works when Twilio is not delivering.
 */

type Route = "phone" | "email"

export function OfficerLogin() {
  const { sendOtp, verifyOtp, signInWithPassword } = useAuth()

  const [route, setRoute] = React.useState<Route>("phone")
  const [phone, setPhone] = React.useState("")
  const [code, setCode] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [otpSent, setOtpSent] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in")
    } finally {
      setBusy(false)
    }
  }

  const phoneReady = phone.replace(/\D/g, "").length >= 10
  const emailReady = email.includes("@") && password.length > 0

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div
            className="mb-2 grid size-10 place-items-center rounded-lg"
            style={{ backgroundColor: "color-mix(in oklch, var(--primary) 14%, transparent)" }}
          >
            <Sprout className="size-5" style={{ color: "var(--primary)" }} />
          </div>
          <CardTitle>AgriQ officer desk</CardTitle>
          <CardDescription>
            Sign in with the number or address registered to your officer account. Every
            checkpoint you clear is logged against it.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            {(["phone", "email"] as Route[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRoute(r)
                  setError(null)
                }}
                className={cn(
                  "flex-1 rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
                  route === r
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r === "phone" ? "Phone" : "Email"}
              </button>
            ))}
          </div>

          {route === "phone" ? (
            <>
              <div className="grid gap-1.5">
                <Label htmlFor="officer-phone">Mobile number</Label>
                <Input
                  id="officer-phone"
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  className="tabular"
                  placeholder="9876543210"
                  value={phone}
                  disabled={otpSent}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Ten digits. +91 is assumed unless you type a country code.
                </p>
              </div>

              {otpSent && (
                <div className="grid gap-1.5">
                  <Label htmlFor="officer-otp">Code from the SMS</Label>
                  <Input
                    id="officer-otp"
                    inputMode="numeric"
                    autoFocus
                    className="tabular tracking-[0.3em]"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && code.length >= 4) {
                        void run(() => verifyOtp(phone, code))
                      }
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid gap-1.5">
                <Label htmlFor="officer-email">Email</Label>
                <Input
                  id="officer-email"
                  type="email"
                  autoFocus
                  placeholder="officer@example.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="officer-password">Password</Label>
                <Input
                  id="officer-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && emailReady) {
                      void run(() => signInWithPassword(email, password))
                    }
                  }}
                />
              </div>
            </>
          )}

          {error && (
            <div
              className="rounded-lg px-3 py-2.5 text-sm"
              style={{
                backgroundColor: "color-mix(in oklch, var(--destructive) 12%, transparent)",
              }}
            >
              {error}
            </div>
          )}

          {route === "phone" ? (
            otpSent ? (
              <div className="grid gap-2">
                <Button
                  disabled={busy || code.trim().length < 4}
                  onClick={() => void run(() => verifyOtp(phone, code))}
                >
                  {busy && <Loader2 className="animate-spin" />}
                  Verify and open the desk
                </Button>
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    setOtpSent(false)
                    setCode("")
                    setError(null)
                  }}
                >
                  Use a different number
                </Button>
              </div>
            ) : (
              <Button
                disabled={busy || !phoneReady}
                onClick={() =>
                  void run(async () => {
                    await sendOtp(phone)
                    setOtpSent(true)
                  })
                }
              >
                {busy && <Loader2 className="animate-spin" />}
                Send code
              </Button>
            )
          ) : (
            <Button
              disabled={busy || !emailReady}
              onClick={() => void run(() => signInWithPassword(email, password))}
            >
              {busy && <Loader2 className="animate-spin" />}
              Open the desk
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Signed in, but no `officers` row — so RLS will return an empty queue no
 * matter what. Saying that outright beats an officer staring at a desk with no
 * farmers on it and assuming the mandi is quiet.
 */
export function NotAnOfficer({ email }: { email?: string | null }) {
  const { signOut } = useAuth()
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>This account is not an officer</CardTitle>
          <CardDescription>
            Signed in{email ? ` as ${email}` : ""}, but there is no matching row in the
            officers table — so the queue would come back empty whatever the mandi is
            doing. Ask P1 to add this account, then sign in again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => void signOut()}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
