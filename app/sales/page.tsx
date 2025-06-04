import { AppProviders } from "@/components/providers/app-providers"
import { AppLayout } from "@/components/layout/app-layout"
import { SalesTeamManagement } from "@/components/sales/sales-team-management"

export const dynamic = "force-dynamic"

export default function SalesPage() {
  return (
    <AppProviders>
      <AppLayout>
        <div className="space-y-6">
          <SalesTeamManagement />
        </div>
      </AppLayout>
    </AppProviders>
  )
}
