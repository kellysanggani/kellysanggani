"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, AlertTriangle } from 'lucide-react'
import Link from "next/link"
import { DatabaseService } from "@/lib/db/database-service"

export default function OutletTable() {
  const searchParams = useSearchParams()
  const [data, setData] = useState([])
  const [allOutlets, setAllOutlets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch outlets from database
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        setLoading(true)
        const outlets = await fetch('/api/outlets').then(res => res.json())
        const categories = await fetch('/api/categories').then(res => res.json())
        const regions = await fetch('/api/regions').then(res => res.json())
        
        // Transform data to match expected format
        const transformedOutlets = outlets.map(outlet => ({
          id: outlet.id,
          name: outlet.name,
          category: categories.find(c => c.id === outlet.category_id)?.name || 'Unknown',
          region: regions.find(r => r.id === outlet.region_id)?.name || 'Unknown',
          salesPerson: outlet.sales_person || 'N/A',
          lastCheckDate: outlet.last_check_date || '2023-05-20',
          stockLevels: [
            { product: "Fairprice Potato Chips", quantity: Math.floor(Math.random() * 200) },
            { product: "Reese Nutrageous", quantity: Math.floor(Math.random() * 150) },
            { product: "Reese Pieces", quantity: Math.floor(Math.random() * 120) },
          ],
          lastOrderDate: outlet.last_order_date || '2023-05-25',
          lastUpdatedBy: outlet.last_updated_by || outlet.sales_person || 'System',
          lastUpdatedAt: outlet.last_updated_at || outlet.updated_at,
        }))
        
        setAllOutlets(transformedOutlets)
        setError(null)
      } catch (err) {
        console.error('Error fetching outlets:', err)
        setError('Failed to load outlets')
      } finally {
        setLoading(false)
      }
    }

    fetchOutlets()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchOutlets, 30000)
    
    // Listen for storage events (cross-tab updates)
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('outlet_updated_')) {
        fetchOutlets()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Filter data based on search params
  useEffect(() => {
    if (!searchParams) {
      setData(allOutlets)
      return
    }

    const categoryFilter = searchParams.get("category")
    const regionFilter = searchParams.get("region")

    let filteredData = allOutlets

    if (categoryFilter && categoryFilter !== "all") {
      filteredData = filteredData.filter((outlet) => outlet.category === categoryFilter)
    }

    if (regionFilter && regionFilter !== "all") {
      filteredData = filteredData.filter((outlet) => outlet.region === regionFilter)
    }

    setData(filteredData)
  }, [searchParams, allOutlets])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const isOverdue = (dateString: string) => {
    const checkDate = new Date(dateString)
    const today = new Date()
    const diffTime = today.getTime() - checkDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 5
  }

  const overdueOutlets = data.filter((outlet) => isOverdue(outlet.lastCheckDate))

  if (loading) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading outlets...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Alert for overdue checks */}
      {overdueOutlets.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{overdueOutlets.length} outlet(s)</strong> have not been checked for more than 5 days:{" "}
            {overdueOutlets.map((outlet) => outlet.name).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Outlet Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Sales Person</TableHead>
                <TableHead>Last Check Date</TableHead>
                <TableHead>Fairprice Chips</TableHead>
                <TableHead>Reese Nutrageous</TableHead>
                <TableHead>Reese Pieces</TableHead>
                <TableHead>Last Order Date</TableHead>
                <TableHead>Last Updated By</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((outlet) => (
                <TableRow key={outlet.id} className={isOverdue(outlet.lastCheckDate) ? "bg-red-50" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {outlet.name}
                      {isOverdue(outlet.lastCheckDate) && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={outlet.category === "Premium" ? "default" : "secondary"}>{outlet.category}</Badge>
                  </TableCell>
                  <TableCell>{outlet.region}</TableCell>
                  <TableCell>{outlet.salesPerson}</TableCell>
                  <TableCell className={isOverdue(outlet.lastCheckDate) ? "text-red-600 font-medium" : ""}>
                    {formatDate(outlet.lastCheckDate)}
                  </TableCell>
                  <TableCell className="text-center font-medium">{outlet.stockLevels[0].quantity}</TableCell>
                  <TableCell className="text-center font-medium">{outlet.stockLevels[1].quantity}</TableCell>
                  <TableCell className="text-center font-medium">{outlet.stockLevels[2].quantity}</TableCell>
                  <TableCell>{formatDate(outlet.lastOrderDate)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{outlet.lastUpdatedBy}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/detail/${outlet.id}/view`}>View details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/detail/${outlet.id}/edit`}>Update stock</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
