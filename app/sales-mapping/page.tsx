import type { Metadata } from "next"
import SalesMappingHeader from "@/components/sales-mapping/sales-mapping-header"
import SalesMappingTable from "@/components/sales-mapping/sales-mapping-table"
import QuickNavigation from "@/components/dashboard/quick-navigation"

export const metadata: Metadata = {
  title: "Sales Mapping | Cinema Stock Manager",
  description: "Assign sales persons to outlets",
}

export default function SalesMappingPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <QuickNavigation />
      <SalesMappingHeader />
      <SalesMappingTable />
    </div>
  )
}
