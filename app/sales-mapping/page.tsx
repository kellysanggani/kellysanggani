import { AppProviders } from "@/components/providers/app-providers"
import { AppLayout } from "@/components/layout/app-layout"
import { SalesMappingHeader } from "@/components/sales-mapping/sales-mapping-header"
import { SalesMappingTable } from "@/components/sales-mapping/sales-mapping-table"

export const dynamic = "force-dynamic"

export default function SalesMappingPage() {
  return (
    <AppProviders>
      <AppLayout>
        <div className="space-y-6">
          <SalesMappingHeader />
          <SalesMappingTable />
        </div>
      </AppLayout>
    </AppProviders>
  )
}
