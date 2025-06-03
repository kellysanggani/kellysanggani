"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Store, AlertTriangle, TrendingUp, Users } from "lucide-react"

interface DashboardStats {
  totalOutlets: number
  totalProducts: number
  lowStockItems: number
  outOfStockItems: number
  totalUsers: number
  recentUpdates: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOutlets: 0,
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalUsers: 0,
    recentUpdates: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [outletsResponse, productsResponse, usersResponse, salesTeamResponse] = await Promise.allSettled([
        fetch("/api/outlets"),
        fetch("/api/products"),
        fetch("/api/users"),
        fetch("/api/sales-team"),
      ])

      // Process outlets
      let outlets: any[] = []
      if (outletsResponse.status === "fulfilled" && outletsResponse.value.ok) {
        outlets = await outletsResponse.value.json()
      }

      // Process products
      let products: any[] = []
      if (productsResponse.status === "fulfilled" && productsResponse.value.ok) {
        products = await productsResponse.value.json()
      }

      // Process users
      let users: any[] = []
      if (usersResponse.status === "fulfilled" && usersResponse.value.ok) {
        users = await usersResponse.value.json()
      }

      // Process sales team data
      let salesTeamStats = null
      if (salesTeamResponse.status === "fulfilled" && salesTeamResponse.value.ok) {
        const salesData = await salesTeamResponse.value.json()
        salesTeamStats = salesData.stats
      }

      // Fetch stock levels for all outlets
      const stockPromises = outlets.map((outlet: any) =>
        fetch(`/api/stock/${outlet.id}`).then((res) => (res.ok ? res.json() : [])),
      )
      const stockResults = await Promise.all(stockPromises)
      const allStockLevels = stockResults.flat()

      // Calculate low stock and out of stock items
      let lowStockCount = 0
      let outOfStockCount = 0

      allStockLevels.forEach((stock: any) => {
        const product = products.find((p: any) => p.id === stock.product_id)
        if (product) {
          if (stock.quantity === 0) {
            outOfStockCount++
          } else if (stock.quantity <= product.low_threshold) {
            lowStockCount++
          }
        }
      })

      // Calculate recent updates (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const recentUpdates = allStockLevels.filter((stock: any) => {
        if (!stock.last_updated) return false
        const updateDate = new Date(stock.last_updated)
        return updateDate >= sevenDaysAgo
      }).length

      setStats({
        totalOutlets: outlets.length,
        totalProducts: products.length,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount,
        totalUsers: salesTeamStats?.totalSalesStaff || users.length,
        recentUpdates,
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Outlets",
      value: stats.totalOutlets,
      description: "Active cinema outlets",
      icon: Store,
      color: "text-blue-600",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      description: "Products in catalog",
      icon: Package,
      color: "text-green-600",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems,
      description: "Items below threshold",
      icon: AlertTriangle,
      color: "text-yellow-600",
    },
    {
      title: "Out of Stock",
      value: stats.outOfStockItems,
      description: "Items with zero quantity",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "System users",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Recent Updates",
      value: stats.recentUpdates,
      description: "Stock updates (7 days)",
      icon: TrendingUp,
      color: "text-indigo-600",
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Loading data...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
