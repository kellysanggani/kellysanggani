"use client"

import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import PermissionGuard from "@/components/auth/permission-guard"
import { updateStock } from "@/lib/actions/stock-actions"

interface StockUpdateFormProps {
  outlet: {
    id: string
    name: string
  }
  productId: string
  currentStock: number
}

function StockUpdateForm({ outlet, productId, currentStock }: StockUpdateFormProps) {
  const { toast } = useToast()
  const [stockLevel, setStockLevel] = useState(currentStock)
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleUpdateStock(formData: FormData) {
    const quantity = formData.get("quantity") as string
    if (!quantity) {
      toast({
        title: "Error",
        description: "Please enter a quantity",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const parsedQuantity = Number.parseInt(quantity)

      await updateStock({
        outletId: outlet.id,
        productId,
        quantity: parsedQuantity,
      })

      setStockLevel(parsedQuantity) // Update local state with input
      toast({
        title: "Success",
        description: `Stock level updated to ${quantity}`,
      })
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to update stock level",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <PermissionGuard permission="canEditStock">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Package className="h-5 w-5" />
            Update Stock Levels
          </CardTitle>
          <CardDescription>Update stock quantities for {outlet.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleUpdateStock(formData)
            }}
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="quantity" className="text-gray-700">
                Quantity
              </Label>
              <Input
                type="number"
                id="quantity"
                name="quantity"
                placeholder="Enter quantity"
                defaultValue={currentStock}
                className="text-gray-800"
              />
            </div>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Stock"}
            </Button>
            <p className="text-gray-700">
              Current stock level: <span className="font-medium">{stockLevel}</span>
            </p>
          </form>
        </CardContent>
      </Card>
    </PermissionGuard>
  )
}

export default StockUpdateForm
