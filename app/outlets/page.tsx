import { AppProviders } from "@/components/providers/app-providers"
import { AppLayout } from "@/components/layout/app-layout"
import { OutletManagementHeader } from "@/components/outlets/outlet-management-header"
import { OutletManagementTable } from "@/components/outlets/outlet-management-table"

export const dynamic = "force-dynamic"

export default function OutletsPage() {
  return (
    <AppProviders>
      <AppLayout>
        <div className="space-y-6">
          <OutletManagementHeader />
          <OutletManagementTable />
        </div>
      </AppLayout>
    </AppProviders>
  )
}
