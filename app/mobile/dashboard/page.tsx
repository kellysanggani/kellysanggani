import type { Metadata } from "next"
import { AppProviders } from "@/components/providers/app-providers"
import { MobileLayout } from "@/components/mobile/mobile-layout"
import { MobileDashboard } from "@/components/mobile/mobile-dashboard"
import { Store, Package, Calendar, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Mobile Dashboard | Cinema Stock Manager",
  description: "Mobile-optimized dashboard for cinema stock management",
}

export const dynamic = "force-dynamic"

export default function MobileDashboardPage() {
  const stats = {
    totalOutlets: 100,
    checkedToday: 12,
    lowStockAlerts: 8,
    overdueChecks: 3,
  }

  const recentAlerts = [
    {
      id: "1",
      outletName: "Cinema City Central",
      message: "Reese Pieces running low (25 units)",
      severity: "low" as const,
      time: "2 hours ago",
    },
    {
      id: "2",
      outletName: "Starlight Cinemas",
      message: "Critical stock level for Reese Nutrageous (8 units)",
      severity: "critical" as const,
      time: "4 hours ago",
    },
    {
      id: "3",
      outletName: "Golden Screen",
      message: "Not checked for 6 days",
      severity: "critical" as const,
      time: "1 day ago",
    },
  ]

  const quickActions = [
    {
      title: "Check Outlets",
      description: "View all outlets",
      href: "/mobile/outlets",
      icon: Store,
      color: "text-blue-600",
    },
    {
      title: "Update Stock",
      description: "Quick stock update",
      href: "/mobile/stock-update",
      icon: Package,
      color: "text-green-600",
    },
    {
      title: "Schedule Check",
      description: "Plan visits",
      href: "/mobile/schedule",
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      title: "Find Outlets",
      description: "Map view",
      href: "/mobile/map",
      icon: MapPin,
      color: "text-red-600",
    },
  ]

  return (
    <AppProviders>
      <MobileLayout title="Dashboard" alertCount={8}>
        <MobileDashboard
          stats={stats}
          recentAlerts={recentAlerts}
          quickActions={quickActions.map((action) => ({
            ...action,
            icon: action.icon.name, // Pass the icon name instead of the function
          }))}
        />
      </MobileLayout>
    </AppProviders>
  )
}
