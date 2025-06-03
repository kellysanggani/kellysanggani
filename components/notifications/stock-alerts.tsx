"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, X, Bell } from "lucide-react"

interface StockAlert {
  id: string
  outletName: string
  product: string
  currentStock: number
  threshold: number
  severity: "low" | "critical"
  timestamp: Date
}

// Mock alerts data
const mockAlerts: StockAlert[] = [
  {
    id: "1",
    outletName: "Cinema City Central",
    product: "Reese Pieces",
    currentStock: 25,
    threshold: 30,
    severity: "low",
    timestamp: new Date(),
  },
  {
    id: "2",
    outletName: "Starlight Cinemas",
    product: "Reese Nutrageous",
    currentStock: 8,
    threshold: 25,
    severity: "critical",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: "3",
    outletName: "Premiere Cineplex",
    product: "Reese Pieces",
    currentStock: 5,
    threshold: 20,
    severity: "critical",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
  },
]

export default function StockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>(mockAlerts)
  const [isVisible, setIsVisible] = useState(true)

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId))
  }

  const dismissAllAlerts = () => {
    setAlerts([])
  }

  const criticalAlerts = alerts.filter((alert) => alert.severity === "critical")
  const lowAlerts = alerts.filter((alert) => alert.severity === "low")

  if (alerts.length === 0 || !isVisible) {
    return null
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Bell className="h-5 w-5" />
            Stock Alerts ({alerts.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={dismissAllAlerts}>
              Dismiss All
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {criticalAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-800 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Critical Stock Levels
            </h4>
            {criticalAlerts.map((alert) => (
              <Alert key={alert.id} variant="destructive" className="relative">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-sm">
                  {alert.outletName} - {alert.product}
                </AlertTitle>
                <AlertDescription className="text-xs">
                  Only {alert.currentStock} units remaining (threshold: {alert.threshold})
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Critical
                  </Badge>
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 p-0"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Alert>
            ))}
          </div>
        )}

        {lowAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-yellow-800">Low Stock Levels</h4>
            {lowAlerts.map((alert) => (
              <Alert key={alert.id} className="relative border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-sm text-yellow-800">
                  {alert.outletName} - {alert.product}
                </AlertTitle>
                <AlertDescription className="text-xs text-yellow-700">
                  {alert.currentStock} units remaining (threshold: {alert.threshold})
                  <Badge variant="outline" className="ml-2 text-xs border-yellow-300">
                    Low
                  </Badge>
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 p-0"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
