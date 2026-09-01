import * as React from "react"
import { BarChart3, ListChecks, Settings2 } from "lucide-react"
import { Toaster } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppShell } from "@/components/layout/AppShell"
import { SignIn } from "@/components/layout/SignIn"
import { QueueDesk } from "@/components/queue/QueueDesk"
import { MetricsPanel } from "@/components/metrics/MetricsPanel"
import { CapacityPanel } from "@/components/config/CapacityPanel"
import { OfficerProvider, useOfficer } from "@/hooks/useOfficer"
import { useQueue } from "@/hooks/useQueue"
import { computeMetrics } from "@/lib/metrics"

function Desk() {
  const { session, center, loading } = useOfficer()
  const queue = useQueue(session?.center_id ?? null)

  const metrics = React.useMemo(
    () => computeMetrics(queue.entries, queue.log, center),
    [queue.entries, queue.log, center],
  )

  if (loading && !session) {
    return <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">Loading…</div>
  }
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
          <QueueDesk queue={queue} officerName={session.officer_name} />
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
    <OfficerProvider>
      <Desk />
      <Toaster position="bottom-right" richColors closeButton />
    </OfficerProvider>
  )
}
