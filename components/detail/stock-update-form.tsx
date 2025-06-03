"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Loader2, Package, ScanLine } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Stock Update Form Component
export default function StockUpdateForm({ outletId, initialData }: { outletId: string; initialData?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [currentStock, setCurrentStock] = useState<number>(0)
  const [orderQuantity, setOrderQuantity] = useState<number>(0)
  const [notes, setNotes] = useState<string>("")
  const [productDetails, setProductDetails] = useState<any>(null)
  const [barcode, setBarcode] = useState<string>("")

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")
        if (!response.ok) throw new Error("Failed to fetch products")
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        setError("Failed to load products. Please try again.")
        console.error(err)
      }
    }

    fetchProducts()
  }, [])

  // Fetch product details when a product is selected
  useEffect(() => {
    if (!selectedProduct) {
      setProductDetails(null)
      return
    }

    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`/api/products/${selectedProduct}`)
        if (!response.ok) throw new Error("Failed to fetch product details")
        const data = await response.json()
        setProductDetails(data)

        // Check if there's existing stock data for this product at this outlet
        const stockResponse = await fetch(`/api/stock/${outletId}?productId=${selectedProduct}`)
        if (stockResponse.ok) {
          const stockData = await stockResponse.json()
          if (stockData && stockData.length > 0) {
            setCurrentStock(stockData[0].currentStock || 0)
            setBarcode(stockData[0].barcode || "")
          } else {
            setCurrentStock(0)
            setBarcode("")
          }
        }
      } catch (err) {
        setError("Failed to load product details. Please try again.")
        console.error(err)
      }
    }

    fetchProductDetails()
  }, [selectedProduct, outletId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const payload = {
        outletId: Number.parseInt(outletId),
        productId: Number.parseInt(selectedProduct),
        currentStock,
        orderQuantity,
        notes,
        barcode,
      }

      const response = await fetch("/api/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update stock")
      }

      setSuccess(true)
      toast({
        title: "Stock Updated",
        description: "The stock information has been successfully updated.",
      })

      // Redirect back to outlet details view
      setTimeout(() => {
        router.push(`/detail/${outletId}/view`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Update Stock & Order Information</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <Package className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Stock information has been updated successfully.</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={loading} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Product Barcode</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    disabled={loading}
                    className="flex-1"
                    placeholder="Enter product barcode"
                  />
                  <Button type="button" size="icon" variant="outline" disabled={loading}>
                    <ScanLine className="h-4 w-4" />
                    <span className="sr-only">Scan barcode</span>
                  </Button>
                </div>
              </div>
            </div>

            <Tabs defaultValue="stock" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stock">Stock Information</TabsTrigger>
                <TabsTrigger value="product">Product Details</TabsTrigger>
              </TabsList>

              <TabsContent value="stock" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      min="0"
                      value={currentStock}
                      onChange={(e) => setCurrentStock(Number.parseInt(e.target.value) || 0)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderQuantity">Order Quantity (Boxes)</Label>
                    <Input
                      id="orderQuantity"
                      type="number"
                      min="0"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(Number.parseInt(e.target.value) || 0)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={loading}
                    placeholder="Add any additional notes about this stock update"
                    className="min-h-[100px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="product" className="pt-4">
                {productDetails ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Product Name</h3>
                        <p className="mt-1">{productDetails.name}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Category</h3>
                        <p className="mt-1">{productDetails.category?.name || "Uncategorized"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Box Unit</h3>
                        <p className="mt-1">{productDetails.boxUnit || "N/A"}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Minimum Stock</h3>
                        <p className="mt-1">{productDetails.minStock || "Not set"}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Expiration Details</h3>
                      <p className="mt-1">{productDetails.expirationDetails || "No expiration information"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <Package className="mx-auto h-12 w-12 opacity-30" />
                    <p className="mt-2">Select a product to view details</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <CardFooter className="flex justify-end space-x-4 px-0 pt-6">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedProduct}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
