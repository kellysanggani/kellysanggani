"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Package,
  Calendar,
  Edit,
  Save,
  X,
  History,
  User,
  Clock,
  RefreshCw,
  ArrowLeft,
  Camera,
  Upload,
  ImageIcon,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from "next/navigation"

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
  stock_picture?: string | null
  order_picture?: string | null
}

interface StockLevel {
  id: number
  product_id: number
  product_name: string
  quantity: number
  last_updated: string | null
  updated_by: string | null
  expiration_date: string | null
}

interface Product {
  id: number
  name: string
  supplier: string | null
  expiration_date: string | null
  availability: "In Stock" | "Low Stock" | "Out of Stock"
}

interface AuditTrail {
  id: number
  entity_type: string
  entity_id: number
  action: string
  details: string | null
  field: string | null
  old_value: string | null
  new_value: string | null
  user_id: string | null
  user_email: string | null
  ip_address: string | null
  timestamp: string
}

interface OutletViewDetailsProps {
  outlet: Outlet
  stockLevels?: StockLevel[]
  auditTrail?: AuditTrail[]
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not set"

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Date formatting error:", error)
    return "Invalid date"
  }
}

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return "Not set"

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch (error) {
    console.error("Date formatting error:", error)
    return "Invalid date"
  }
}

const getAvailabilityColor = (availability: string) => {
  switch (availability) {
    case "In Stock":
      return "text-green-600"
    case "Low Stock":
      return "text-yellow-600"
    case "Out of Stock":
      return "text-red-600"
    default:
      return "text-gray-500"
  }
}

export default function OutletViewDetails({
  outlet: initialOutlet,
  stockLevels = [],
  auditTrail = [],
}: OutletViewDetailsProps) {
  const router = useRouter()
  const [outlet, setOutlet] = useState(initialOutlet)
  const [currentStockLevels, setCurrentStockLevels] = useState(stockLevels)
  const [isEditingSalesPerson, setIsEditingSalesPerson] = useState(false)
  const [salesPerson, setSalesPerson] = useState(outlet.sales_person || "")
  const [showAuditTrail, setShowAuditTrail] = useState(false)
  const [lastOrderDate, setLastOrderDate] = useState<string | null>(outlet.last_order_date)
  const [isUpdatingPODate, setIsUpdatingPODate] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [productDetails, setProductDetails] = useState<Record<number, Product>>({})
  const [stockPicture, setStockPicture] = useState<string | null>(outlet.stock_picture || null)
  const [orderPicture, setOrderPicture] = useState<string | null>(outlet.order_picture || null)
  const [isUploadingStock, setIsUploadingStock] = useState(false)
  const [isUploadingOrder, setIsUploadingOrder] = useState(false)

  // Fetch product details for availability and expiration information
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productIds = currentStockLevels.map((stock) => stock.product_id)
        const uniqueProductIds = [...new Set(productIds)]

        const productDetailsMap: Record<number, Product> = {}

        for (const productId of uniqueProductIds) {
          const response = await fetch(`/api/products/${productId}`)
          if (response.ok) {
            const product = await response.json()
            productDetailsMap[productId] = product
          }
        }

        setProductDetails(productDetailsMap)
      } catch (error) {
        console.error("Error fetching product details:", error)
      }
    }

    if (currentStockLevels.length > 0) {
      fetchProductDetails()
    }
  }, [currentStockLevels])

  // Function to refresh all data
  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      console.log(`Refreshing data for outlet ID: ${outlet.id}`)

      // Fetch updated outlet data
      const outletResponse = await fetch(`/api/outlets/${outlet.id}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })

      if (outletResponse.ok) {
        const updatedOutlet = await outletResponse.json()
        console.log(`Refreshed outlet data:`, updatedOutlet)
        setOutlet(updatedOutlet)
        setSalesPerson(updatedOutlet.sales_person || "")
        setLastOrderDate(updatedOutlet.last_order_date)
        setStockPicture(updatedOutlet.stock_picture || null)
        setOrderPicture(updatedOutlet.order_picture || null)
      }

      // Fetch updated stock levels
      const stockResponse = await fetch(`/api/stock/${outlet.id}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })

      if (stockResponse.ok) {
        const stockData = await stockResponse.json()
        setCurrentStockLevels(stockData)
      }

      toast({
        title: "✅ Data Refreshed",
        description: "All outlet information has been updated",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "❌ Refresh Failed",
        description: "Could not refresh the data. Please try again.",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleFileUpload = async (file: File, type: "stock" | "order") => {
    if (type === "stock") {
      setIsUploadingStock(true)
    } else {
      setIsUploadingOrder(true)
    }

    try {
      // Convert file to base64 for storage (in a real app, you'd upload to a file service)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64String = e.target?.result as string

        // Update outlet with picture
        const response = await fetch(`/api/outlets/${outlet.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [type === "stock" ? "stock_picture" : "order_picture"]: base64String,
          }),
        })

        if (response.ok) {
          const updatedOutlet = await response.json()
          setOutlet(updatedOutlet)

          if (type === "stock") {
            setStockPicture(base64String)
          } else {
            setOrderPicture(base64String)
          }

          toast({
            title: "✅ Picture Uploaded Successfully!",
            description: `${type === "stock" ? "Stock" : "Order"} picture has been saved`,
            duration: 4000,
          })
        } else {
          throw new Error("Failed to upload picture")
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: "❌ Upload Failed",
        description: `Could not upload ${type} picture. Please try again.`,
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      if (type === "stock") {
        setIsUploadingStock(false)
      } else {
        setIsUploadingOrder(false)
      }
    }
  }

  const handleCameraCapture = async (type: "stock" | "order") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      // In a real implementation, you'd show a camera interface
      // For now, we'll just show the file picker
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"
      input.capture = "environment"
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          handleFileUpload(file, type)
        }
      }
      input.click()

      // Stop the camera stream
      stream.getTracks().forEach((track) => track.stop())
    } catch (error) {
      // Fallback to file picker if camera access is denied
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          handleFileUpload(file, type)
        }
      }
      input.click()
    }
  }

  const handleUpdatePODate = async () => {
    setIsUpdatingPODate(true)

    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch(`/api/outlets/${outlet.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          last_order_date: today,
        }),
      })

      if (response.ok) {
        const updatedOutlet = await response.json()
        setOutlet(updatedOutlet)
        setLastOrderDate(today)
        toast({
          title: "✅ PO Date Updated Successfully!",
          description: `Last PO Issue Date has been set to ${formatDate(today)}`,
          duration: 4000,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update PO Issue Date")
      }
    } catch (error) {
      toast({
        title: "❌ Failed to Update PO Date",
        description: (
          <div className="space-y-1">
            <p>Could not update the PO Issue Date</p>
            <p className="text-sm opacity-80">{error instanceof Error ? error.message : "Unknown error occurred"}</p>
          </div>
        ),
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setIsUpdatingPODate(false)
    }
  }

  const handleSaveSalesPerson = async () => {
    try {
      const response = await fetch(`/api/outlets/${outlet.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sales_person: salesPerson,
        }),
      })

      if (response.ok) {
        const updatedOutlet = await response.json()
        setOutlet(updatedOutlet)
        toast({
          title: "✅ Sales Person Updated Successfully!",
          description: `Sales person changed to ${salesPerson}`,
          duration: 4000,
        })
        setIsEditingSalesPerson(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update sales person")
      }
    } catch (error) {
      toast({
        title: "❌ Failed to Update Sales Person",
        description: (
          <div className="space-y-1">
            <p>Could not update the sales person</p>
            <p className="text-sm opacity-80">{error instanceof Error ? error.message : "Unknown error occurred"}</p>
          </div>
        ),
        variant: "destructive",
        duration: 6000,
      })
    }
  }

  const handleCancelEdit = () => {
    setSalesPerson(outlet.sales_person || "")
    setIsEditingSalesPerson(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold break-words">{outlet.name} - Details</h1>
          <p className="text-sm text-muted-foreground">Last updated: {formatDateTime(outlet.updated_at)}</p>
        </div>
      </div>

      {/* Stock Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Package className="h-5 w-5" />
            Current Stock Levels
          </CardTitle>
          <CardDescription>Current inventory quantities with product availability and expiration dates</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStockLevels.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {currentStockLevels.map((stock) => {
                const product = productDetails[stock.product_id]
                return (
                  <div key={stock.product_id} className="space-y-2 text-center p-4 border rounded-lg">
                    <h4 className="font-medium text-sm sm:text-base break-words">{stock.product_name}</h4>
                    <div className="text-2xl sm:text-3xl font-bold text-primary">{stock.quantity}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">units in stock</p>

                    {/* Product Availability */}
                    {product?.availability && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Product Availability:</p>
                        <p className={`text-xs font-semibold ${getAvailabilityColor(product.availability)}`}>
                          {product.availability}
                        </p>
                      </div>
                    )}

                    {/* Product Expiration Date */}
                    {product?.expiration_date && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Expiration Date:</p>
                        <p className="text-xs text-orange-600">{formatDate(product.expiration_date)}</p>
                      </div>
                    )}

                    {stock.updated_by && (
                      <p className="text-xs text-muted-foreground">Last updated by {stock.updated_by}</p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No stock information available for this outlet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Picture Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <ImageIcon className="h-5 w-5" />
            Pictures
          </CardTitle>
          <CardDescription>Stock and order pictures for this outlet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {/* Stock Picture */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Stock Picture</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {stockPicture ? (
                    <div className="space-y-2">
                      <img
                        src={stockPicture || "/placeholder.svg"}
                        alt="Stock"
                        className="max-w-full h-32 object-cover mx-auto rounded"
                      />
                      <p className="text-xs text-muted-foreground">Stock picture uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-sm text-muted-foreground">No stock picture uploaded</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCameraCapture("stock")}
                  disabled={isUploadingStock}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isUploadingStock ? "Uploading..." : "Take Photo"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement("input")
                    input.type = "file"
                    input.accept = "image/*"
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) handleFileUpload(file, "stock")
                    }
                    input.click()
                  }}
                  disabled={isUploadingStock}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>

            {/* Order Picture */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Order Picture</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {orderPicture ? (
                    <div className="space-y-2">
                      <img
                        src={orderPicture || "/placeholder.svg"}
                        alt="Order"
                        className="max-w-full h-32 object-cover mx-auto rounded"
                      />
                      <p className="text-xs text-muted-foreground">Order picture uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-sm text-muted-foreground">No order picture uploaded</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCameraCapture("order")}
                  disabled={isUploadingOrder}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isUploadingOrder ? "Uploading..." : "Take Photo"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement("input")
                    input.type = "file"
                    input.accept = "image/*"
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) handleFileUpload(file, "order")
                    }
                    input.click()
                  }}
                  disabled={isUploadingOrder}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="h-5 w-5" />
            Important Dates
          </CardTitle>
          <CardDescription>Last check and order dates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Last Check Date</span>
              <p className="text-sm break-words">{formatDate(outlet.last_check_date)}</p>
              <p className="text-xs text-muted-foreground">(Automatically updated when stock is updated)</p>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Last PO Issue Date</span>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <p className="text-sm break-words">{formatDate(lastOrderDate)}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUpdatePODate}
                  disabled={isUpdatingPODate}
                  className="w-full sm:w-auto"
                >
                  {isUpdatingPODate ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-1"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-1" />
                      Update to Today
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Sales Information</CardTitle>
          <CardDescription>
            <p className="text-xs text-muted-foreground">Assigned sales person for this outlet</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <span className="text-sm font-medium text-muted-foreground">Sales Person</span>
                {isEditingSalesPerson ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Input value={salesPerson} onChange={(e) => setSalesPerson(e.target.value)} className="max-w-xs" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveSalesPerson}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <p className="text-sm font-medium break-words">{salesPerson || "Not assigned"}</p>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditingSalesPerson(true)}>
                      <Edit className="h-4 w-4" />
                      <span className="ml-1">Edit</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Update Information */}
      {outlet.last_updated_by && outlet.last_updated_at && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Clock className="h-5 w-5" />
              Last Update Information
            </CardTitle>
            <CardDescription>Information about the most recent update to this outlet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium break-words">{outlet.last_updated_by}</span>
              </div>
              <span className="text-muted-foreground hidden sm:inline">•</span>
              <span className="text-muted-foreground">{formatDateTime(outlet.last_updated_at)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <History className="h-5 w-5" />
                Audit Trail
              </CardTitle>
              <CardDescription>Complete history of changes made to this outlet</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setShowAuditTrail(!showAuditTrail)}>
              {showAuditTrail ? "Hide" : "Show"} History
            </Button>
          </div>
        </CardHeader>
        {showAuditTrail && (
          <CardContent>
            <div className="space-y-4">
              {auditTrail.length > 0 ? (
                auditTrail.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-muted pl-4 pb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-1 gap-2">
                      <span className="text-sm font-medium">{entry.action}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1 break-words">{entry.details}</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                      <span>by {entry.user_email || entry.user_id || "Unknown"}</span>
                      {entry.ip_address && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span>IP: {entry.ip_address}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No audit history available for this outlet.
                </p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <Toaster />
    </div>
  )
}
