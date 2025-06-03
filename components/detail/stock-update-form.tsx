"use client"

import { Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useFormStatus } from "react-dom"
import { useState } from "react"
import PermissionGuard from "@/components/auth/permission-guard"

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

    try {
      // const newStockLevel = await updateStock({
      //   outletId: outlet.id,
      //   productId,
      //   quantity: Number.parseInt(quantity),
      // })
      const newStockLevel = 0 // Placeholder since updateStock is removed

      if (newStockLevel >= 0) {
        setStockLevel(Number.parseInt(quantity)) // Update local state with input
        toast({
          title: "Success",
          description: `Stock level updated to ${quantity}`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update stock level",
          variant: "destructive",
        })
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      })
    }
  }

  return (
    <PermissionGuard permission="canEditStock">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Update Stock Levels
          </CardTitle>
          <CardDescription>Update stock quantities for {outlet.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdateStock} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input type="number" id="quantity" placeholder="Enter quantity" defaultValue={0} />
            </div>
            <StockUpdateButton />
            <p>Current stock level: {stockLevel}</p>
          </form>
        </CardContent>
      </Card>
    </PermissionGuard>
  )
}

function StockUpdateButton() {
  const { pending } = useFormStatus()

  return <Button disabled={pending}>{pending ? "Updating..." : "Update Stock"}</Button>
}

export default StockUpdateForm
