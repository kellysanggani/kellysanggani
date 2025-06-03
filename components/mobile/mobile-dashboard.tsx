"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Store, Package, Calendar, MapPin, type LucideIcon } from "lucide-react"
import Link from "next/link"

// Map of icon names to components
const iconMap: Record<string, LucideIcon> = {
  Store,
  Package,
  Calendar,
  MapPin,
}

interface MobileDashboardProps {
  stats: {
    totalOutlets: number
    checkedToday: number
    lowStockAlerts: number
    overdueChecks: number
  }
  recentAlerts: Array<{
    id: string
    outletName: string
    message: string
    severity: "low" | "critical"
    time: string
  }>
  quickActions: Array<{
    title: string
    description: string
    href: string
    icon: string // Changed to string (icon name)
    color: string
  }>
}

export default function MobileDashboard({ stats, recentAlerts, quickActions }: MobileDashboardProps) {
  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalOutlets}</div>
            <div className="text-sm text-muted-foreground">Total Outlets</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.checkedToday}</div>
            <div className="text-sm text-muted-foreground">Checked Today</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.lowStockAlerts}</div>
            <div className="text-sm text-muted-foreground">Low Stock</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.overdueChecks}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      {recentAlerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    alert.severity === "critical" ? "bg-red-500" : "bg-yellow-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{alert.outletName}</div>
                  <div className="text-sm text-muted-foreground">{alert.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">{alert.time}</div>
                </div>
              </div>
            ))}
            {recentAlerts.length > 3 && (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/alerts">View All Alerts</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            // Get the icon component from the map or use Store as fallback
            const IconComponent = iconMap[action.icon] || Store

            return (
              <Button key={index} variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
                <Link href={action.href}>
                  <IconComponent className={`h-6 w-6 ${action.color}`} />
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Link>
              </Button>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
