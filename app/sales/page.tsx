import type { Metadata } from "next"
import QuickNavigation from "@/components/dashboard/quick-navigation"
import SalesTeamManagement from "@/components/sales/sales-team-management"

export const metadata: Metadata = {
  title: "Sales Team | Cinema Stock Manager",
  description: "Manage sales team user information and assignments",
}

export default function SalesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <QuickNavigation />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Team</h2>
          <p className="text-muted-foreground">Manage sales team user information and outlet assignments</p>
        </div>
      </div>
      <SalesTeamManagement />
    </div>
  )
}
