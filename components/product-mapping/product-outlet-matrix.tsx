"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Save, Package, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Define safe interfaces
interface SafeOutlet {
  id: number
  name: string
}

interface SafeProduct {
  id: number
  name: string
}

interface SafeProductMapping {
  id: number
  outlet_id: number
  product_id: number
  is_active: boolean
}

export default function ProductOutletMatrix() {
  const [outlets, setOutlets] = useState<SafeOutlet[]>([])
  const [products, setProducts] = useState<SafeProduct[]>([])
  const [mappings, setMappings] = useState<SafeProductMapping[]>([])
  const [localMappings, setLocalMappings] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch data with comprehensive error handling
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching outlets, products, and mappings...")

      // Fetch all data in parallel with individual error handling
      const [outletsResponse, productsResponse, mappingsResponse] = await Promise.allSettled([
        fetch("/api/outlets"),
        fetch("/api/products"),
        fetch("/api/product-mappings"),
      ])

      // Process outlets
      let outletsData: any[] = []
      if (outletsResponse.status === "fulfilled" && outletsResponse.value.ok) {
        const data = await outletsResponse.value.json()
        outletsData = Array.isArray(data) ? data : []
        console.log("Fetched outlets:", outletsData)
      } else {
        console.error("Failed to fetch outlets:", outletsResponse)
      }

      // Process products
      let productsData: any[] = []
      if (productsResponse.status === "fulfilled" && productsResponse.value.ok) {
        const data = await productsResponse.value.json()
        productsData = Array.isArray(data) ? data : []
        console.log("Fetched products:", productsData)
      } else {
        console.error("Failed to fetch products:", productsResponse)
      }

      // Process mappings
      let mappingsData: any[] = []
      if (mappingsResponse.status === "fulfilled" && mappingsResponse.value.ok) {
        const data = await mappingsResponse.value.json()
        mappingsData = Array.isArray(data) ? data : []
        console.log("Fetched mappings:", mappingsData)
      } else {
        console.error("Failed to fetch mappings:", mappingsResponse)
      }

      // Process and validate data
      const safeOutlets: SafeOutlet[] = []
      if (Array.isArray(outletsData)) {
        outletsData.forEach((outlet) => {
          try {
            if (outlet && typeof outlet.id === "number" && typeof outlet.name === "string") {
              safeOutlets.push({
                id: outlet.id,
                name: outlet.name,
              })
            }
          } catch (outletError) {
            console.error("Error processing outlet:", outlet, outletError)
          }
        })
      }

      const safeProducts: SafeProduct[] = []
      if (Array.isArray(productsData)) {
        productsData.forEach((product) => {
          try {
            if (product && typeof product.id === "number" && typeof product.name === "string") {
              safeProducts.push({
                id: product.id,
                name: product.name,
              })
            }
          } catch (productError) {
            console.error("Error processing product:", product, productError)
          }
        })
      }

      const safeMappings: SafeProductMapping[] = []
      if (Array.isArray(mappingsData)) {
        mappingsData.forEach((mapping) => {
          try {
            if (
              mapping &&
              typeof mapping.id === "number" &&
              typeof mapping.outlet_id === "number" &&
              typeof mapping.product_id === "number" &&
              typeof mapping.is_active === "boolean"
            ) {
              safeMappings.push({
                id: mapping.id,
                outlet_id: mapping.outlet_id,
                product_id: mapping.product_id,
                is_active: mapping.is_active,
              })
            }
          } catch (mappingError) {
            console.error("Error processing mapping:", mapping, mappingError)
          }
        })
      }

      setOutlets(safeOutlets)
      setProducts(safeProducts)
      setMappings(safeMappings)

      // Initialize local mappings
      const mappingState: Record<string, boolean> = {}
      safeOutlets.forEach((outlet) => {
        safeProducts.forEach((product) => {
          const key = `${outlet.id}-${product.id}`
          const mapping = safeMappings.find((m) => m.outlet_id === outlet.id && m.product_id === product.id)
          mappingState[key] = mapping?.is_active || false
        })
      })
      setLocalMappings(mappingState)

      console.log("Data processing complete:", {
        outlets: safeOutlets.length,
        products: safeProducts.length,
        mappings: safeMappings.length,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(error instanceof Error ? error.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const isProductMapped = (outletId: number, productId: number) => {
    try {
      const key = `${outletId}-${productId}`
      return localMappings[key] || false
    } catch (error) {
      console.error("Error checking product mapping:", error)
      return false
    }
  }

  const toggleProductMapping = (outletId: number, productId: number) => {
    try {
      const key = `${outletId}-${productId}`
      setLocalMappings((prev) => ({
        ...prev,
        [key]: !prev[key],
      }))
    } catch (error) {
      console.error("Error toggling product mapping:", error)
    }
  }

  const handleSave = async () => {
    if (!outlets || !products) return

    setIsLoading(true)
    try {
      // Save all mappings
      const savePromises = outlets.flatMap((outlet) => {
        return products
          .map((product) => {
            const key = `${outlet.id}-${product.id}`
            const isActive = localMappings[key] || false

            return fetch("/api/product-mappings", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                outletId: outlet.id,
                productId: product.id,
                isActive,
              }),
            }).catch((error) => {
              console.error(`Error updating mapping for outlet ${outlet.id}, product ${product.id}:`, error)
              return null
            })
          })
          .filter(Boolean)
      })

      await Promise.all(savePromises)

      toast({
        title: "✅ Mapping Saved Successfully!",
        description: "Product-outlet mapping has been updated successfully.",
        duration: 4000,
      })
    } catch (error) {
      console.error("Error saving product mappings:", error)
      toast({
        title: "❌ Save Failed",
        description: "Failed to save product-outlet mapping. Please try again.",
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectAllForProduct = (productId: number) => {
    if (!outlets) return

    setLocalMappings((prev) => {
      const newMappings = { ...prev }
      outlets.forEach((outlet) => {
        const key = `${outlet.id}-${productId}`
        newMappings[key] = true
      })
      return newMappings
    })
  }

  const deselectAllForProduct = (productId: number) => {
    if (!outlets) return

    setLocalMappings((prev) => {
      const newMappings = { ...prev }
      outlets.forEach((outlet) => {
        const key = `${outlet.id}-${productId}`
        newMappings[key] = false
      })
      return newMappings
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading product mappings...</span>
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
              <h3 className="text-lg font-semibold">Error Loading Data</h3>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (outlets.length === 0 || products.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            <p>No data available. Please ensure there are outlets and products in the system.</p>
            <Button onClick={fetchData} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Product-Outlet Mapping
        </CardTitle>
        <CardDescription>
          Check which products are supplied to each outlet. Only checked products will be available for stock
          management.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Outlet Name</TableHead>
                {products.map((product) => (
                  <TableHead key={product.id} className="text-center min-w-[150px]">
                    <div className="space-y-2">
                      <div className="font-medium">{product.name}</div>
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-6"
                          onClick={() => selectAllForProduct(product.id)}
                        >
                          All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-6"
                          onClick={() => deselectAllForProduct(product.id)}
                        >
                          None
                        </Button>
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {outlets.map((outlet) => (
                <TableRow key={outlet.id}>
                  <TableCell className="font-medium">{outlet.name}</TableCell>
                  {products.map((product) => (
                    <TableCell key={product.id} className="text-center">
                      <Checkbox
                        checked={isProductMapped(outlet.id, product.id)}
                        onCheckedChange={() => toggleProductMapping(outlet.id, product.id)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Mapping
              </>
            )}
          </Button>
        </div>
      </CardContent>
      <Toaster />
    </Card>
  )
}
