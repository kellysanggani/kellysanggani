"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const initialProducts = [
  {
    id: 1,
    name: "Fairprice Potato Chips",
    expirationDate: "2024-08-15",
    availability: "In Stock",
    supplier: "Fairprice",
    lastUpdated: "2023-06-01",
  },
  {
    id: 2,
    name: "Reese Nutrageous",
    expirationDate: "2024-12-31",
    availability: "Low Stock",
    supplier: "Hershey's",
    lastUpdated: "2023-05-28",
  },
  {
    id: 3,
    name: "Reese Pieces",
    expirationDate: "2024-10-20",
    availability: "Out of Stock",
    supplier: "Hershey's",
    lastUpdated: "2023-05-25",
  },
]

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export default function ProductInfoCards() {
  const [products, setProducts] = useState(initialProducts)

  // Listen for product updates from the products page
  useEffect(() => {
    const handleProductUpdate = (event: any) => {
      const updatedProduct = event.detail
      setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
    }

    window.addEventListener("productUpdated", handleProductUpdate)
    return () => window.removeEventListener("productUpdated", handleProductUpdate)
  }, [])

  const getAvailabilityBadge = (availability: string) => {
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

  const isExpiringSoon = (expirationDate: string) => {
    const expDate = new Date(expirationDate)
    const today = new Date()
    const diffTime = expDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  const isExpired = (expirationDate: string) => {
    const expDate = new Date(expirationDate)
    const today = new Date()
    return expDate < today
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Product Information</h3>
        <p className="text-sm text-muted-foreground">Current product status and expiration dates</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {products.map((product) => (
          <Card
            key={product.id}
            className={cn(
              "relative",
              isExpired(product.expirationDate) && "border-red-500 bg-red-50",
              isExpiringSoon(product.expirationDate) &&
                !isExpired(product.expirationDate) &&
                "border-yellow-500 bg-yellow-50",
            )}
          >
            <CardHeader className="pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {product.name}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {getAvailabilityBadge(product.availability)}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Expires:</span>
                  <div className="flex items-center gap-1">
                    {(isExpired(product.expirationDate) || isExpiringSoon(product.expirationDate)) && (
                      <AlertCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        isExpired(product.expirationDate) && "text-red-600 font-medium",
                        isExpiringSoon(product.expirationDate) &&
                          !isExpired(product.expirationDate) &&
                          "text-yellow-600 font-medium",
                      )}
                    >
                      {formatDate(product.expirationDate)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Updated:</span>
                  <span className="text-sm">{formatDate(product.lastUpdated)}</span>
                </div>
              </div>

              {isExpired(product.expirationDate) && (
                <div className="text-xs text-red-600 font-medium">⚠️ Product has expired!</div>
              )}
              {isExpiringSoon(product.expirationDate) && !isExpired(product.expirationDate) && (
                <div className="text-xs text-yellow-600 font-medium">⚠️ Expires within 30 days</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
