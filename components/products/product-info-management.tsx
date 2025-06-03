"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CalendarIcon, Edit, Package, AlertCircle, Loader2, RefreshCw, Barcode } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useApi, apiCall } from "@/lib/hooks/use-api"
import type { Product } from "@/lib/db/database-service"

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not set"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"
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

export default function ProductInfoManagement() {
  const { data: products, loading, error, mutate } = useApi<Product[]>("/api/products")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [expirationDate, setExpirationDate] = useState<Date | undefined>()
  const [availability, setAvailability] = useState("")
  const [barcode, setBarcode] = useState("")

  const getAvailabilityBadge = (availability: string | null) => {
    if (!availability) return <Badge variant="outline">Unknown</Badge>

    switch (availability) {
      case "In Stock":
        return <Badge className="bg-green-500">In Stock</Badge>
      case "Low Stock":
        return <Badge className="bg-yellow-500">Low Stock</Badge>
      case "Out of Stock":
        return <Badge className="bg-red-500">Out of Stock</Badge>
      default:
        return <Badge variant="outline">{availability}</Badge>
    }
  }

  const isExpiringSoon = (expirationDate: string | null) => {
    if (!expirationDate) return false
    try {
      const expDate = new Date(expirationDate)
      if (isNaN(expDate.getTime())) return false
      const today = new Date()
      const diffTime = expDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 30 && diffDays > 0
    } catch (error) {
      console.error("Error checking expiration:", error)
      return false
    }
  }

  const isExpired = (expirationDate: string | null) => {
    if (!expirationDate) return false
    try {
      const expDate = new Date(expirationDate)
      if (isNaN(expDate.getTime())) return false
      const today = new Date()
      return expDate < today
    } catch (error) {
      console.error("Error checking expiration:", error)
      return false
    }
  }

  const handleEdit = (product: Product) => {
    try {
      setEditingProduct(product)

      // Safely set expiration date
      if (product.expiration_date) {
        try {
          const date = new Date(product.expiration_date)
          if (!isNaN(date.getTime())) {
            setExpirationDate(date)
          } else {
            setExpirationDate(undefined)
          }
        } catch (error) {
          console.error("Error parsing expiration date:", error)
          setExpirationDate(undefined)
        }
      } else {
        setExpirationDate(undefined)
      }

      setAvailability(product.availability || "In Stock")
      setBarcode(product.barcode || "")
      setIsDialogOpen(true)
    } catch (error) {
      console.error("Error opening edit dialog:", error)
      toast({
        title: "Error",
        description: "Failed to open edit dialog. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    if (!editingProduct) return

    setIsSaving(true)
    try {
      const updates = {
        expiration_date: expirationDate ? expirationDate.toISOString().split("T")[0] : null,
        availability,
        barcode,
      }

      console.log("Saving product updates:", updates)

      await apiCall(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      })

      toast({
        title: "✅ Product Updated Successfully!",
        description: `${editingProduct.name} information has been updated.`,
        duration: 4000,
      })

      // Refresh the data
      await mutate()
      setIsDialogOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "❌ Update Failed",
        description: error instanceof Error ? error.message : "Failed to update product information.",
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRefresh = async () => {
    try {
      await mutate()
      toast({
        title: "Data Refreshed",
        description: "Product data has been refreshed successfully.",
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh product data. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading products...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="text-red-600">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Error Loading Products</h3>
              <p className="text-sm">There was a problem loading the product data.</p>
              <p className="text-xs mt-2 text-gray-500">Error: {error}</p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Safely filter and validate products
  const validProducts = Array.isArray(products)
    ? products.filter(
        (product) =>
          product && typeof product === "object" && typeof product.id === "number" && typeof product.name === "string",
      )
    : []

  if (validProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Information Management
          </CardTitle>
          <CardDescription>Manage product expiration dates and availability status</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <h3 className="text-lg font-semibold">No Products Found</h3>
              <p className="text-sm">There are no products to display at the moment.</p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Information Management
            </CardTitle>
            <CardDescription>Manage product expiration dates and availability status</CardDescription>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {validProducts.map((product) => {
            try {
              const productExpired = isExpired(product.expiration_date)
              const productExpiringSoon = isExpiringSoon(product.expiration_date)

              return (
                <div
                  key={product.id}
                  className={cn(
                    "flex items-center justify-between p-4 border rounded-lg transition-colors",
                    productExpired && "border-red-500 bg-red-50",
                    productExpiringSoon && !productExpired && "border-yellow-500 bg-yellow-50",
                  )}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{product.name || "Unnamed Product"}</h4>
                      {(productExpired || productExpiringSoon) && <AlertCircle className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Supplier: {product.supplier || "Unknown"}</span>
                      <span>•</span>
                      <span>Expires: {formatDate(product.expiration_date)}</span>
                      <span>•</span>
                      <span>Updated: {formatDate(product.last_updated)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {getAvailabilityBadge(product.availability)}
                      {product.barcode && (
                        <div className="flex items-center gap-1 text-xs">
                          <Barcode className="h-3 w-3" />
                          <span className="font-mono">{product.barcode}</span>
                        </div>
                      )}
                      {productExpired && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                      {productExpiringSoon && !productExpired && (
                        <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
                          Expires Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              )
            } catch (error) {
              console.error("Error rendering product:", product, error)
              return (
                <div key={product.id || Math.random()} className="p-4 border rounded-lg bg-red-50 border-red-200">
                  <p className="text-red-600 text-sm">Error displaying product data</p>
                </div>
              )
            }
          })}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Product Information</DialogTitle>
              <DialogDescription>
                Update expiration date and availability status for {editingProduct?.name || "this product"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Expiration Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expirationDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expirationDate ? formatDate(expirationDate.toISOString()) : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={expirationDate} onSelect={setExpirationDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Availability Status</Label>
                <Select value={availability} onValueChange={setAvailability}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Barcode</Label>
                <div className="flex items-center gap-2">
                  <Barcode className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Enter product barcode"
                    className="font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the product barcode for scanning and identification
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      <Toaster />
    </Card>
  )
}
