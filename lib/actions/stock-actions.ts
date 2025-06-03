"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth/session"
import { checkPermission } from "@/lib/auth/permissions"

interface UpdateStockParams {
  outletId: string
  productId: string
  quantity: number
}

export async function updateStock({ outletId, productId, quantity }: UpdateStockParams) {
  try {
    // Get current user and check permissions
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("User not authenticated")
    }

    const hasPermission = await checkPermission(user.id, "canEditStock")
    if (!hasPermission) {
      throw new Error("Insufficient permissions to update stock")
    }

    // Update stock level via API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/stock/${outletId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          updates: [
            {
              outlet_id: Number.parseInt(outletId),
              product_id: Number.parseInt(productId),
              quantity,
              updated_by: user.name || user.email,
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update stock")
    }

    const result = await response.json()

    // Revalidate relevant pages
    revalidatePath(`/detail/${outletId}`)
    revalidatePath(`/detail/${outletId}/view`)
    revalidatePath("/dashboard")

    return quantity
  } catch (error) {
    console.error("Error updating stock:", error)
    throw error
  }
}

export async function updateLastCheckDate(outletId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("User not authenticated")
    }

    const hasPermission = await checkPermission(user.id, "canEditStock")
    if (!hasPermission) {
      throw new Error("Insufficient permissions to update check date")
    }

    const today = new Date().toISOString().split("T")[0]

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/outlets/${outletId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          last_check_date: today,
          last_updated_by: user.name || user.email,
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update check date")
    }

    revalidatePath(`/detail/${outletId}`)
    revalidatePath(`/detail/${outletId}/view`)
    revalidatePath("/dashboard")

    return true
  } catch (error) {
    console.error("Error updating check date:", error)
    throw error
  }
}
