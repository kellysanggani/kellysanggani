import { AppProviders } from "@/components/providers/app-providers"
import { AppLayout } from "@/components/layout/app-layout"
import { DetailHeader } from "@/components/detail/detail-header"
import { DetailFilters } from "@/components/detail/detail-filters"
import { OutletTable } from "@/components/detail/outlet-table"

export const dynamic = "force-dynamic"

export default function DetailPage() {
  return (
    <AppProviders>
      <AppLayout>
        <div className="space-y-6">
          <DetailHeader />
          <DetailFilters />
          <OutletTable />
        </div>
      </AppLayout>
    </AppProviders>
  )
}
