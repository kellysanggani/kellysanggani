"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ArrowRight, Loader2, Info, Home, PenTool, Calendar, AlertCircle, User, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Outlet {
  id: number
  name: string
  pic_name?: string | null
  pic_contact?: string | null
  [key: string]: any
}

interface StockLevel {
  id: number
  product_id: number
  product_name: string
  quantity: number
  expiration_date?: string | null
  last_updated: string | null
  updated_by: string | null
  barcode?: string | null
  order_quantity?: number
}

interface Product {
  id: number
  name: string
  supplier: string | null
  expiration_date: string | null
  availability: "In Stock" | "Low Stock" | "Out of Stock"
  low_threshold: number
  critical_threshold: number
  last_updated: string | null
  created_at: string
  updated_at: string
  barcode?: string | null
}

interface StockUpdateFormProps {
  outlet: Outlet
  stockLevels: StockLevel[]
}

const formatDateShort = (dateString: string | null) => {
  if (!dateString) return "Not set"
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  } catch (error) {
    return "Invalid date"
  }
}

const getCurrentDate = () => {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default function StockUpdateForm({ outlet, stockLevels = [] }: StockUpdateFormProps) {
  const router = useRouter()
  const [quantities, setQuantities] = useState<Record<number, number>>(
    stockLevels.reduce(
      (acc, stock) => {
        acc[stock.product_id] = stock.quantity
        return acc
      },
      {} as Record<number, number>,
    ),
  )

  const [orderQuantities, setOrderQuantities] = useState<Record<number, number>>(
    stockLevels.reduce(
      (acc, stock) => {
        acc[stock.product_id] = stock.order_quantity || 0
        return acc
      },
      {} as Record<number, number>,
    ),
  )

  // Store original values for comparison
  const [originalQuantities] = useState<Record<number, number>>(
    stockLevels.reduce(
      (acc, stock) => {
        acc[stock.product_id] = stock.quantity
        return acc
      },
      {} as Record<number, number>,
    ),
  )

  const [originalOrderQuantities] = useState<Record<number, number>>(
    stockLevels.reduce(
      (acc, stock) => {
        acc[stock.product_id] = stock.order_quantity || 0
        return acc
      },
      {} as Record<number, number>,
    ),
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser] = useState("John Smith") // In a real app, this would come from authentication
  const [storeSignature, setStoreSignature] = useState("")
  const [picName, setPicName] = useState(outlet.pic_name || "")
  const [picContact, setPicContact] = useState(outlet.pic_contact || "")
  const [productDetails, setProductDetails] = useState<Record<number, Product>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Fetch product details for expiration information
  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true)
      try {
        const productIds = stockLevels.map((stock) => stock.product_id)
        const uniqueProductIds = [...new Set(productIds)]

        const productDetailsMap: Record<number, Product> = {}

        // Fetch each product's details
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
        toast({
          title: "Error",
          description: "Failed to load product expiration details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductDetails()
  }, [stockLevels])

  const handleQuantityChange = (productId: number, value: string) => {
    const quantity = Number.parseInt(value)
    if (!isNaN(quantity) && quantity >= 0) {
      setQuantities((prev) => ({
        ...prev,
        [productId]: quantity,
      }))
    }
  }

  const handleOrderQuantityChange = (productId: number, value: string) => {
    const quantity = Number.parseInt(value)
    if (!isNaN(quantity) && quantity >= 0) {
      setOrderQuantities((prev) => ({
        ...prev,
        [productId]: quantity,
      }))
    }
  }

  const getExpirationStatus = (date: string | null) => {
    if (!date) return { status: "none", message: "No expiration date set", color: "text-gray-500" }

    const expirationDate = new Date(date)
    const today = new Date()
    const diffTime = expirationDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { status: "expired", message: `Expired ${Math.abs(diffDays)} days ago`, color: "text-red-600" }
    } else if (diffDays <= 7) {
      return { status: "expiring", message: `Expires in ${diffDays} days`, color: "text-orange-600" }
    } else if (diffDays <= 30) {
      return { status: "warning", message: `Expires in ${diffDays} days`, color: "text-yellow-600" }
    } else {
      return { status: "good", message: `Expires in ${diffDays} days`, color: "text-green-600" }
    }
  }

  // Check if values have changed
  const hasQuantityChanged = (productId: number) => {
    return quantities[productId] !== originalQuantities[productId]
  }

  const hasOrderQuantityChanged = (productId: number) => {
    return orderQuantities[productId] !== originalOrderQuantities[productId]
  }

  const hasPicInfoChanged = () => {
    return picName !== outlet.pic_name || picContact !== outlet.pic_contact
  }

  // Generate change summary for each product
  const getChangesSummary = () => {
    const changes: string[] = []

    stockLevels.forEach((stock) => {
      const productChanges: string[] = []

      if (hasQuantityChanged(stock.product_id)) {
        productChanges.push(`Stock: ${originalQuantities[stock.product_id]} → ${quantities[stock.product_id]}`)
      }

      if (hasOrderQuantityChanged(stock.product_id)) {
        productChanges.push(
          `Order: ${originalOrderQuantities[stock.product_id]} box → ${orderQuantities[stock.product_id]} box`,
        )
      }

      if (productChanges.length > 0) {
        changes.push(`${stock.product_name}: ${productChanges.join(", ")}`)
      }
    })

    if (hasPicInfoChanged()) {
      changes.push(`Updated outlet contact information`)
    }

    return changes
  }

  const handleBackToHome = () => {
    router.push(`/detail/${outlet.id}/view`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("Starting stock update process...")
      console.log("Outlet ID:", outlet.id)
      console.log("Current quantities:", quantities)
      console.log("Order quantities:", orderQuantities)
      console.log("PIC Name:", picName)
      console.log("PIC Contact:", picContact)

      // Generate detailed change summary
      const changesSummary = getChangesSummary()

      if (changesSummary.length === 0 && !storeSignature) {
        toast({
          title: "ℹ️ No Changes Detected",
          description: "No changes were made to stock levels, order quantities, or contact information.",
          duration: 3000,
        })
        setIsSubmitting(false)
        return
      }

      // Create an array of updates to send to the API
      const updates = Object.entries(quantities).map(([productId, quantity]) => ({
        outlet_id: outlet.id,
        product_id: Number.parseInt(productId),
        quantity,
        order_quantity: orderQuantities[Number.parseInt(productId)] || 0,
        updated_by: currentUser,
      }))

      console.log("Prepared updates:", updates)
      console.log("Changes summary:", changesSummary)
      console.log("Store signature:", storeSignature)

      // Validate updates before sending
      const invalidUpdates = updates.filter(
        (update) => !update.product_id || typeof update.quantity !== "number" || update.quantity < 0,
      )

      if (invalidUpdates.length > 0) {
        throw new Error(`Invalid update data: ${invalidUpdates.length} updates have invalid values`)
      }

      // Send the updates to the API
      console.log("Sending stock update request...")
      const stockResponse = await fetch(`/api/stock/${outlet.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          updates,
          signature: storeSignature,
        }),
      })

      console.log("Stock response status:", stockResponse.status)
      const stockResponseData = await stockResponse.json()
      console.log("Stock response data:", stockResponseData)

      if (!stockResponse.ok) {
        // Enhanced error handling with more details
        const errorMessage = stockResponseData.error || `HTTP ${stockResponse.status}: Failed to update stock levels`
        const errorDetails = stockResponseData.details ? `\n\nDetails:\n${stockResponseData.details.join("\n")}` : ""
        throw new Error(`${errorMessage}${errorDetails}`)
      }

      // Update outlet information with PIC details
      console.log("Updating outlet information...")
      const today = new Date().toISOString().split("T")[0]
      const outletResponse = await fetch(`/api/outlets/${outlet.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          last_check_date: today,
          last_updated_by: currentUser,
          pic_name: picName,
          pic_contact: picContact,
        }),
      })

      console.log("Outlet response status:", outletResponse.status)

      if (!outletResponse.ok) {
        const outletErrorData = await outletResponse.json()
        console.warn("Failed to update outlet information:", outletErrorData)

        // Show warning but don't fail the entire operation
        toast({
          title: "⚠️ Partial Success",
          description: (
            <div className="space-y-2">
              <p>Stock levels updated but failed to update outlet information.</p>
              <div className="text-sm opacity-80">
                <p className="font-medium">Changes made:</p>
                <ul className="list-disc list-inside space-y-1">
                  {changesSummary.map((change, index) => (
                    <li key={index} className="text-xs">
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm">Redirecting to view page...</p>
            </div>
          ),
          variant: "destructive",
          duration: 3000,
        })

        // Still redirect since stock was updated successfully
        setTimeout(() => {
          router.push(`/detail/${outlet.id}/view`)
        }, 1500)
        return
      }

      // Success notification with detailed change information
      toast({
        title: "✅ Successfully Saved!",
        description: (
          <div className="space-y-2">
            <p>All changes have been saved successfully</p>
            <div className="text-sm opacity-90">
              <p className="font-medium">Changes made:</p>
              <ul className="list-disc list-inside space-y-1">
                {changesSummary.map((change, index) => (
                  <li key={index} className="text-xs">
                    {change}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-sm opacity-80">
              <p>• Last check date set to today</p>
              {hasPicInfoChanged() && <p>• Contact information updated</p>}
              {storeSignature && <p>• Store signature recorded</p>}
            </div>
            <p className="text-sm font-medium text-blue-600">Redirecting to view page...</p>
          </div>
        ),
        duration: 3000,
      })

      console.log("Stock update completed successfully")
      console.log("Changes applied:", changesSummary)

      // Redirect to the view detail page after successful save
      setTimeout(() => {
        router.push(`/detail/${outlet.id}/view`)
      }, 1500)
    } catch (error) {
      console.error("Error updating stock levels:", error)

      // Enhanced error notification - user stays on the same page
      toast({
        title: "❌ Save Failed!",
        description: (
          <div className="space-y-2">
            <p className="font-medium text-red-600">Failed to save changes</p>
            <p className="text-sm opacity-80 max-w-md break-words">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
            <div className="text-sm space-y-1">
              <p>• Please check your internet connection</p>
              <p>• Verify all data is correct</p>
              <p>• Try again in a few moments</p>
            </div>
            <p className="text-xs text-muted-foreground">Check the console for technical details</p>
          </div>
        ),
        variant: "destructive",
        duration: 8000,
      })

      // User remains on the edit page - no redirect
    } finally {
      setIsSubmitting(false)
    }
  }

  // If no stock levels, show a message
  if (stockLevels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Update Stock Levels</CardTitle>
          <CardDescription>No products are mapped to this outlet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please map products to this outlet in the Product Mapping section before updating stock levels.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Back to Home Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBackToHome} className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Back to Home
        </Button>
        <div className="text-right">
          <h1 className="text-xl font-bold">{outlet.name?.toUpperCase() || "OUTLET NAME"}</h1>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium">Nama Store:</span> {outlet.store_name || outlet.name}
            </p>
            <p>
              <span className="font-medium">Tanggal/Hari:</span> {getCurrentDate()}
            </p>
            <p>
              <span className="font-medium">SMD:</span> {currentUser}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock & Order Update Form</CardTitle>
          <CardDescription>Update stock quantities and order quantities for {outlet.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current User Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Updating as: {currentUser}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Date: {getCurrentDate()}</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading product details...</span>
              </div>
            ) : (
              /* Products Table */
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b">
                  <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm">
                    <div className="col-span-3">Barcode</div>
                    <div className="col-span-3">Description</div>
                    <div className="col-span-2">Expiration Date</div>
                    <div className="col-span-2">Stock</div>
                    <div className="col-span-2">Order (Box)</div>
                  </div>
                </div>

                <div className="divide-y">
                  {stockLevels.map((stock) => {
                    const product = productDetails[stock.product_id]
                    const expirationStatus = product?.expiration_date
                      ? getExpirationStatus(product.expiration_date)
                      : { status: "none", message: "No expiration date set", color: "text-gray-500" }
                    const quantityChanged = hasQuantityChanged(stock.product_id)
                    const orderChanged = hasOrderQuantityChanged(stock.product_id)
                    const hasChanges = quantityChanged || orderChanged

                    return (
                      <div key={stock.product_id} className="p-4">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-3">
                            <p className="text-sm font-mono">
                              {product?.barcode || stock.barcode || `${stock.product_id}`.padStart(8, "0")}
                            </p>
                          </div>
                          <div className="col-span-3">
                            <p className="text-sm font-medium">{stock.product_name}</p>
                            {product?.supplier && (
                              <p className="text-xs text-muted-foreground mt-1">Supplier: {product.supplier}</p>
                            )}
                          </div>
                          <div className="col-span-2">
                            {product?.expiration_date ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <p className="text-sm font-medium">{formatDateShort(product.expiration_date)}</p>
                                </div>
                                <p className={`text-xs ${expirationStatus.color}`}>{expirationStatus.message}</p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <p className="text-xs">Not set</p>
                              </div>
                            )}
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              min="0"
                              value={quantities[stock.product_id] || 0}
                              onChange={(e) => handleQuantityChange(stock.product_id, e.target.value)}
                              className={cn("w-full", quantityChanged && "border-orange-300 bg-orange-50")}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Was: {originalQuantities[stock.product_id]}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                value={orderQuantities[stock.product_id] || 0}
                                onChange={(e) => handleOrderQuantityChange(stock.product_id, e.target.value)}
                                className={cn("w-full", orderChanged && "border-orange-300 bg-orange-50")}
                                placeholder="0"
                              />
                              <span className="text-sm whitespace-nowrap">box</span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-muted-foreground">
                                Was: {originalOrderQuantities[stock.product_id]} box
                              </p>
                              {hasChanges && (
                                <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                                  <Info className="h-3 w-3" />
                                  <span>Modified</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Thresholds Information */}
                        {product && (product.low_threshold > 0 || product.critical_threshold > 0) && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <AlertCircle className="h-3 w-3" />
                              <span>
                                Thresholds:
                                {product.critical_threshold > 0 && (
                                  <span className="text-red-600 ml-1">Critical: {product.critical_threshold}</span>
                                )}
                                {product.low_threshold > 0 && (
                                  <span className="text-yellow-600 ml-1">Low: {product.low_threshold}</span>
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Contact Information Section - Split into PIC Name and PIC Contact */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                Outlet Contact Information
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pic-name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    PIC Name
                  </Label>
                  <Input
                    id="pic-name"
                    placeholder="Person in charge name"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    className={cn(picName !== outlet.pic_name && "border-orange-300 bg-orange-50")}
                  />
                  {outlet.pic_name && (
                    <p className="text-xs text-muted-foreground">Current: {outlet.pic_name || "Not set"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pic-contact" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    PIC Contact
                  </Label>
                  <Input
                    id="pic-contact"
                    placeholder="Phone number or email"
                    value={picContact}
                    onChange={(e) => setPicContact(e.target.value)}
                    className={cn(picContact !== outlet.pic_contact && "border-orange-300 bg-orange-50")}
                  />
                  {outlet.pic_contact && (
                    <p className="text-xs text-muted-foreground">Current: {outlet.pic_contact || "Not set"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Store Signature
              </h4>
              <div className="space-y-2">
                <Label htmlFor="store-signature">TTD Store</Label>
                <Textarea
                  id="store-signature"
                  placeholder="Store representative signature/name"
                  value={storeSignature}
                  onChange={(e) => setStoreSignature(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>

            {/* Changes Summary */}
            {getChangesSummary().length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Changes to be saved:
                </h4>
                <ul className="space-y-1 text-sm text-amber-700">
                  {getChangesSummary().map((change, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-amber-600">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleBackToHome}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || (getChangesSummary().length === 0 && !storeSignature)}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    Save Stock & Order Updates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <Toaster />
      </Card>
    </div>
  )
}
