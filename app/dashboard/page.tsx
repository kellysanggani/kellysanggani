import type { Metadata } from "next"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import DashboardStats from "@/components/dashboard/dashboard-stats"
import DashboardCharts from "@/components/dashboard/dashboard-charts"
import DashboardFilters from "@/components/dashboard/dashboard-filters"
import StockAlerts from "@/components/notifications/stock-alerts"
import ProductInfoCards from "@/components/dashboard/product-info-cards"
import QuickNavigation from "@/components/dashboard/quick-navigation"

export const metadata: Metadata = {
  title: "Dashboard | Cinema Stock Manager",
  description: "Stock management dashboard for cinema outlets",
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <DashboardHeader />
      <QuickNavigation />
      <StockAlerts />
      <ProductInfoCards />
      <DashboardFilters />
      <DashboardStats />
      <DashboardCharts />
    </div>
  )
}
