import { AppProviders } from "@/components/providers/app-providers"
import { AppLayout } from "@/components/layout/app-layout"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { QuickNavigation } from "@/components/dashboard/quick-navigation"

export const dynamic = "force-dynamic"

export default function DashboardPage() {
  return (
    <AppProviders>
      <AppLayout>
        <div className="space-y-6">
          <DashboardHeader />
          <DashboardStats />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCharts />
            <QuickNavigation />
          </div>
        </div>
      </AppLayout>
    </AppProviders>
  )
}
