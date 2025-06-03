import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db/database-service"

export async function GET() {
  try {
    const stockLevels = DatabaseService.getStockLevels()
    return NextResponse.json(stockLevels)
  } catch (error) {
    console.error("Error fetching stock levels:", error)
    return NextResponse.json({ error: "Failed to fetch stock levels" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { outletId, productId, quantity, updatedBy } = await request.json()

    const updatedStock = DatabaseService.updateStockLevel(outletId, productId, quantity, updatedBy)
    if (!updatedStock) {
      return NextResponse.json({ error: "Failed to update stock" }, { status: 500 })
    }

    // Add audit trail
    DatabaseService.addAuditEntry({
      entity_type: "stock",
      entity_id: updatedStock.id,
      action: "Updated stock quantity",
      details: `Updated quantity to ${quantity}`,
      field: "quantity",
      user_id: "current-user-id",
      user_email: updatedBy,
      ip_address: "192.168.1.1",
    })

    return NextResponse.json(updatedStock)
  } catch (error) {
    console.error("Error updating stock:", error)
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 })
  }
}
