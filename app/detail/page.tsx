import type { Metadata } from "next"
import { Suspense } from "react"
import DetailHeader from "@/components/detail/detail-header"
import DetailFilters from "@/components/detail/detail-filters"
import OutletTable from "@/components/detail/outlet-table"
import QuickNavigation from "@/components/dashboard/quick-navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Outlet Details | Cinema Stock Manager",
  description: "Detailed view of cinema outlets and stock levels",
}

// Loading skeletons for components
function FiltersLoading() {
  return (
    <Card className="p-4 h-[72px]">
      <Skeleton className="h-full w-full" />
    </Card>
  )
}

function TableLoading() {
  return (
    <Card className="p-4">
      <Skeleton className="h-[400px] w-full" />
    </Card>
  )
}

export default function DetailPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <DetailHeader />
      <QuickNavigation />

      <Suspense fallback={<FiltersLoading />}>
        <DetailFilters />
      </Suspense>

      <Suspense fallback={<TableLoading />}>
        <OutletTable />
      </Suspense>
    </div>
  )
}
