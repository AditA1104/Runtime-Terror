import * as React from "react"
import { BarChart3, ListChecks, Settings2 } from "lucide-react"
import { Toaster } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppShell } from "@/components/layout/AppShell"
import { SignIn } from "@/components/layout/SignIn"
import { NotAnOfficer, OfficerLogin } from "@/components/layout/OfficerLogin"
import { QueueDesk } from "@/components/queue/QueueDesk"
import { MetricsPanel } from "@/components/metrics/MetricsPanel"
import { CapacityPanel } from "@/components/config/CapacityPanel"
import { AuthProvider, useAuth } from "@/hooks/useAuth"
import { ThemeProvider } from "@/hooks/useTheme"
import { OfficerProvider, useOfficer } from "@/hooks/useOfficer"
import { useQueue } from "@/hooks/useQueue"
import { computeMetrics } from "@/lib/metrics"
import { isLiveMode } from "@/lib/supabase"

const Loading = () => (
  <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">Loading…</div>
)

function Desk() {
  const { session, center, loading, changedBy } = useOfficer()
  const auth = useAuth()
  const queue = useQueue(session?.center_id ?? null)

  const metrics = React.useMemo(
    () => computeMetrics(queue.entries, queue.log, center),
    [queue.entries, queue.log, center],
  )

  // Live mode gates on the Supabase session. Mock mode has no auth server, so
  // it keeps the name-and-centre card — which is what lets the demo run with
  // no backend at all.
  if (isLiveMode) {
    if (auth.loading) return <Loading />
    if (!auth.user) return <OfficerLogin />
    if (auth.notAnOfficer) return <NotAnOfficer email={auth.user.email} />
  }

  if (loading && !session) return <Loading />
  if (!session?.officer_name || !session.center_id) return <SignIn />

  return (
    <AppShell>
      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">
            <ListChecks />
            Queue desk
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart3 />
            Today
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings2 />
            Quota
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <QueueDesk queue={queue} changedBy={changedBy} centerId={session.center_id} />
        </TabsContent>
        <TabsContent value="metrics">
          <MetricsPanel metrics={metrics} center={center} />
        </TabsContent>
        <TabsContent value="config">
          <CapacityPanel />
        </TabsContent>
      </Tabs>
    </AppShell>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OfficerProvider>
          <Desk />
          <Toaster position="bottom-right" richColors closeButton />
        </OfficerProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
