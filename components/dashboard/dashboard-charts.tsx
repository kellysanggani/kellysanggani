"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface StockData {
  outlet_name: string
  total_products: number
  low_stock_count: number
  out_of_stock_count: number
}

interface CategoryData {
  name: string
  count: number
  color: string
}

export default function DashboardCharts() {
  const [stockData, setStockData] = useState<StockData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [])

  const fetchChartData = async () => {
    try {
      setLoading(true)

      // Fetch outlets
      const outletsResponse = await fetch("/api/outlets")
      const outlets = outletsResponse.ok ? await outletsResponse.json() : []

      // Fetch products
      const productsResponse = await fetch("/api/products")
      const products = productsResponse.ok ? await productsResponse.json() : []

      // Fetch categories
      const categoriesResponse = await fetch("/api/categories")
      const categories = categoriesResponse.ok ? await categoriesResponse.json() : []

      // Prepare stock data for each outlet
      const stockDataPromises = outlets.map(async (outlet: any) => {
        const stockResponse = await fetch(`/api/stock/${outlet.id}`)
        const stockLevels = stockResponse.ok ? await stockResponse.json() : []

        let lowStockCount = 0
        let outOfStockCount = 0

        stockLevels.forEach((stock: any) => {
          const product = products.find((p: any) => p.id === stock.product_id)
          if (product) {
            if (stock.quantity === 0) {
              outOfStockCount++
            } else if (stock.quantity <= product.low_threshold) {
              lowStockCount++
            }
          }
        })

        return {
          outlet_name: outlet.name.length > 15 ? outlet.name.substring(0, 15) + "..." : outlet.name,
          total_products: stockLevels.length,
          low_stock_count: lowStockCount,
          out_of_stock_count: outOfStockCount,
        }
      })

      const resolvedStockData = await Promise.all(stockDataPromises)

      // Prepare category data
      const categoryColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1", "#d084d0"]
      const categoryDataMap = new Map()

      outlets.forEach((outlet: any) => {
        const category = categories.find((c: any) => c.id === outlet.category_id)
        const categoryName = category ? category.name : "Uncategorized"
        categoryDataMap.set(categoryName, (categoryDataMap.get(categoryName) || 0) + 1)
      })

      const resolvedCategoryData = Array.from(categoryDataMap.entries()).map(([name, count], index) => ({
        name,
        count,
        color: categoryColors[index % categoryColors.length],
      }))

      setStockData(resolvedStockData)
      setCategoryData(resolvedCategoryData)
    } catch (error) {
      console.error("Error fetching chart data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground">Loading chart data...</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground">Loading chart data...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Stock Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Status by Outlet</CardTitle>
          <CardDescription>Overview of stock levels across all outlets</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="outlet_name" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_products" fill="#8884d8" name="Total Products" />
              <Bar dataKey="low_stock_count" fill="#ffc658" name="Low Stock" />
              <Bar dataKey="out_of_stock_count" fill="#ff7300" name="Out of Stock" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Outlets by Category</CardTitle>
          <CardDescription>Distribution of outlets across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
