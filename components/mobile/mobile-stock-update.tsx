"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Save, Package, Minus, Plus, AlertTriangle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface MobileStockUpdateProps {
  outlet: {
    id: number
    name: string
    stockLevels: Array<{ product: string; quantity: number }>
  }
  updateStockLevel: (outletId: number, product: string, quantity: number) => Promise<void>
}

export default function MobileStockUpdate({ outlet, updateStockLevel }: MobileStockUpdateProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    outlet.stockLevels.forEach((stock) => {
      initial[stock.product] = stock.quantity
    })
    return initial
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleQuantityChange = (product: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [product]: Math.max(0, value),
    }))
  }

  const incrementQuantity = (product: string) => {
    setQuantities((prev) => ({
      ...prev,
      [product]: (prev[product] || 0) + 1,
    }))
  }

  const decrementQuantity = (product: string) => {
    setQuantities((prev) => ({
      ...prev,
      [product]: Math.max(0, (prev[product] || 0) - 1),
    }))
  }

  const getStockStatus = (quantity: number) => {
    if (quantity >= 100) return { label: "High", color: "bg-green-500" }
    if (quantity >= 50) return { label: "Medium", color: "bg-yellow-500" }
    return { label: "Low", color: "bg-red-500" }
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // Update stock levels in the local database
      for (const product in quantities) {
        if (quantities.hasOwnProperty(product)) {
          const newQuantity = quantities[product]
          // Find the original stock level for this product
          const originalStockLevel = outlet.stockLevels.find((stock) => stock.product === product)
          if (originalStockLevel && newQuantity !== originalStockLevel.quantity) {
            await updateStockLevel(outlet.id, product, newQuantity)
          }
        }
      }

      toast({
        title: "Stock updated",
        description: `Stock levels for ${outlet.name} have been updated.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock levels. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Update Stock - {outlet.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {outlet.stockLevels.map((stock, index) => {
            const currentQuantity = quantities[stock.product] || 0
            const status = getStockStatus(currentQuantity)
            const hasChanged = currentQuantity !== stock.quantity

            return (
              <Card key={index} className={`${hasChanged ? "border-blue-500 bg-blue-50" : ""}`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Product Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{stock.product}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-white ${status.color}`}>{status.label}</Badge>
                          {currentQuantity < 30 && (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="text-xs">Low Stock</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {hasChanged && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          Changed
                        </Badge>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="space-y-2">
                      <Label className="text-sm">Quantity</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => decrementQuantity(stock.product)}
                          disabled={currentQuantity <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <div className="flex-1">
                          <Input
                            type="number"
                            min="0"
                            value={currentQuantity}
                            onChange={(e) => handleQuantityChange(stock.product, Number.parseInt(e.target.value) || 0)}
                            className="text-center text-lg font-bold"
                          />
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => incrementQuantity(stock.product)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Quick Add Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(stock.product, currentQuantity + 10)}
                          className="flex-1"
                        >
                          +10
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(stock.product, currentQuantity + 25)}
                          className="flex-1"
                        >
                          +25
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(stock.product, currentQuantity + 50)}
                          className="flex-1"
                        >
                          +50
                        </Button>
                      </div>
                    </div>

                    {/* Change Indicator */}
                    {hasChanged && (
                      <div className="text-sm text-blue-600 bg-blue-100 rounded p-2">
                        {stock.quantity} → {currentQuantity}
                        <span className="ml-2">
                          ({currentQuantity > stock.quantity ? "+" : ""}
                          {currentQuantity - stock.quantity})
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isLoading} className="w-full h-12 text-lg" size="lg">
        <Save className="h-5 w-5 mr-2" />
        {isLoading ? "Saving..." : "Save All Changes"}
      </Button>

      <Toaster />
    </div>
  )
}
