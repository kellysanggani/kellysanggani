import type { Metadata } from "next"
import OutletManagementHeader from "@/components/outlets/outlet-management-header"
import OutletManagementTable from "@/components/outlets/outlet-management-table"
import QuickNavigation from "@/components/dashboard/quick-navigation"

export const metadata: Metadata = {
  title: "Outlet Management | Cinema Stock Manager",
  description: "Manage cinema outlet information and settings",
}

export default function OutletManagementPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <OutletManagementHeader />
      <QuickNavigation />
      <OutletManagementTable />
    </div>
  )
}
