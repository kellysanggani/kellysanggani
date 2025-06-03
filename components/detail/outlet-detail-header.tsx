"use client"

import { ArrowLeft, Building2, MapPin, User, Calendar, Package, RefreshCw, Eye, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"

interface Outlet {
  id: number
  name: string
  category_id: number | null
  region_id: number | null
  sales_person: string | null
  last_check_date: string | null
  last_order_date: string | null
  address: string | null
  phone: string | null
  email: string | null
  store_name: string | null
  pic_name: string | null
  pic_contact: string | null
  last_updated_by: string | null
  last_updated_at: string | null
  created_at: string
  updated_at: string
}

interface OutletDetailHeaderProps {
  outlet: Outlet
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not set"

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Date formatting error:", error)
    return "Invalid date"
  }
}

const getCategoryName = (categoryId: number | null) => {
  if (categoryId === null) return "Not set"

  const categories: Record<number, string> = {
    1: "Premium",
    2: "Standard",
    3: "Budget",
    4: "VIP",
  }
  return categories[categoryId] || "Unknown"
}

const getRegionName = (regionId: number | null) => {
  if (regionId === null) return "Not set"

  const regions: Record<number, string> = {
    1: "Downtown",
    2: "Uptown",
    3: "Midtown",
    4: "Westside",
    5: "Eastside",
  }
  return regions[regionId] || "Unknown"
}

export default function OutletDetailHeader({ outlet: initialOutlet }: OutletDetailHeaderProps) {
  const router = useRouter()
  const [outlet, setOutlet] = useState(initialOutlet)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Function to refresh outlet data
  const refreshOutletData = async () => {
    setIsRefreshing(true)
    try {
      console.log(`Refreshing outlet data for ID: ${outlet.id}`)
      const response = await fetch(`/api/outlets/${outlet.id}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const updatedOutlet = await response.json()
        console.log(`Refreshed outlet data:`, updatedOutlet)
        setOutlet(updatedOutlet)

        // Force page refresh to update all components
        window.location.reload()
      } else {
        console.error("Failed to refresh outlet data:", response.status)
      }
    } catch (error) {
      console.error("Error refreshing outlet data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Listen for storage events to detect updates from other tabs/components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `outlet_updated_${outlet.id}`) {
        console.log("Detected outlet update from another component")
        refreshOutletData()
      }
    }

    const handleCustomUpdate = (e: CustomEvent) => {
      if (e.detail.outletId === outlet.id) {
        console.log("Detected outlet update from custom event")
        refreshOutletData()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("outletUpdated", handleCustomUpdate as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("outletUpdated", handleCustomUpdate as EventListener)
    }
  }, [outlet.id])

  // Check for updates on component mount and periodically
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const response = await fetch(`/api/outlets/${outlet.id}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (response.ok) {
          const latestOutlet = await response.json()

          // Compare update timestamps
          if (latestOutlet.updated_at !== outlet.updated_at) {
            console.log("Outlet data is stale, updating...")
            setOutlet(latestOutlet)
          }
        }
      } catch (error) {
        console.error("Error checking for updates:", error)
      }
    }

    // Check immediately
    checkForUpdates()

    // Check for updates every 10 seconds
    const interval = setInterval(checkForUpdates, 10000)
    return () => clearInterval(interval)
  }, [outlet.id, outlet.updated_at])

  // Safety check
  if (!outlet) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md">
        <h3 className="text-red-600 font-medium">Error: Missing outlet data</h3>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Action Buttons - Responsive */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={refreshOutletData} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>

          <Link href={`/detail/${outlet.id}/view`}>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Eye className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </Button>
          </Link>

          <Link href={`/detail/${outlet.id}/edit`}>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Edit className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Edit Stock</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          </Link>

          {/* Removed Create Order action as requested */}
        </div>
      </div>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xl sm:text-2xl">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="break-words">{outlet.name}</span>
                </div>
                {outlet.last_updated_at && (
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    Updated {formatDate(outlet.last_updated_at)}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm sm:text-base">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {getRegionName(outlet.region_id)}
                </span>
                <Badge variant={getCategoryName(outlet.category_id) === "Premium" ? "default" : "secondary"}>
                  {getCategoryName(outlet.category_id)}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Sales Person */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" />
                Sales Person
              </div>
              <p className="text-sm font-medium break-words">{outlet.sales_person || "Not assigned"}</p>
            </div>

            {/* Last Check Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Last Check Date
              </div>
              <p className="text-sm">{formatDate(outlet.last_check_date)}</p>
            </div>

            {/* Last Order Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Package className="h-4 w-4" />
                Last PO Issue Date
              </div>
              <p className="text-sm">{formatDate(outlet.last_order_date)}</p>
            </div>

            {/* Store Name */}
            {outlet.store_name && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Store Name</div>
                <p className="text-sm break-words">{outlet.store_name}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
