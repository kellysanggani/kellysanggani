"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"

export default function DetailFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize with default values, then update from searchParams when available
  const [category, setCategory] = useState("all")
  const [region, setRegion] = useState("all")

  // Update state when searchParams are available
  useEffect(() => {
    if (searchParams) {
      setCategory(searchParams.get("category") || "all")
      setRegion(searchParams.get("region") || "all")
    }
  }, [searchParams])

  const handleFilterChange = (type: string, value: string) => {
    if (!searchParams) return

    const params = new URLSearchParams(searchParams.toString())

    if (value === "all") {
      params.delete(type)
    } else {
      params.set(type, value)
    }

    if (type === "category") setCategory(value)
    if (type === "region") setRegion(value)

    // Update the URL with new search params
    router.push(`/detail?${params.toString()}`)
  }

  const clearFilters = () => {
    setCategory("all")
    setRegion("all")
    router.push("/detail")
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter outlets</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Category:</span>
            <Select value={category} onValueChange={(value) => handleFilterChange("category", value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Region:</span>
            <Select value={region} onValueChange={(value) => handleFilterChange("region", value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="Downtown">Downtown</SelectItem>
                <SelectItem value="Uptown">Uptown</SelectItem>
                <SelectItem value="Midtown">Midtown</SelectItem>
                <SelectItem value="Westside">Westside</SelectItem>
                <SelectItem value="Eastside">Eastside</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(category !== "all" || region !== "all") && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
