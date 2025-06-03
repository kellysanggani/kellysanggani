"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, Package } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

const initialThresholds = {
  fairpriceChips: { low: 30, critical: 10 },
  reeseNutrageous: { low: 25, critical: 8 },
  reesePieces: { low: 20, critical: 5 },
}

export default function ProductThresholdSettings() {
  const [thresholds, setThresholds] = useState(initialThresholds)
  const [isLoading, setIsLoading] = useState(false)

  const handleThresholdChange = (product: string, type: "low" | "critical", value: string) => {
    const numValue = Number.parseInt(value) || 0
    setThresholds((prev) => ({
      ...prev,
      [product]: {
        ...prev[product as keyof typeof prev],
        [type]: numValue,
      },
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Settings Saved",
      description: "Product threshold settings have been updated successfully.",
    })

    setIsLoading(false)
  }

  const products = [
    { key: "fairpriceChips", name: "Fairprice Potato Chips" },
    { key: "reeseNutrageous", name: "Reese Nutrageous" },
    { key: "reesePieces", name: "Reese Pieces" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Level Thresholds
          </CardTitle>
          <CardDescription>
            Set the low and critical stock level thresholds for each product. Alerts will be triggered when stock falls
            below these levels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {products.map((product) => (
            <div key={product.key} className="space-y-4">
              <h4 className="font-medium">{product.name}</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`${product.key}-low`}>Low Stock Threshold</Label>
                  <Input
                    id={`${product.key}-low`}
                    type="number"
                    min="0"
                    value={thresholds[product.key as keyof typeof thresholds].low}
                    onChange={(e) => handleThresholdChange(product.key, "low", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Alert when stock falls below this level</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${product.key}-critical`}>Critical Stock Threshold</Label>
                  <Input
                    id={`${product.key}-critical`}
                    type="number"
                    min="0"
                    value={thresholds[product.key as keyof typeof thresholds].critical}
                    onChange={(e) => handleThresholdChange(product.key, "critical", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Critical alert when stock falls below this level</p>
                </div>
              </div>
              {product.key !== "reesePieces" && <hr className="my-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Toaster />
    </div>
  )
}
