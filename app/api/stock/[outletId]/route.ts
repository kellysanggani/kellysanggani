import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db/database-service"
import { validateStockUpdate, isValidId } from "@/lib/validation/schemas"

interface StockUpdate {
  outlet_id: number
  product_id: number
  quantity: number
  order_quantity?: number
  expiration_date?: string | null
  updated_by?: string
}

interface RequestBody {
  updates: StockUpdate[]
  signature?: string
  contact?: string
}

export async function GET(request: NextRequest, { params }: { params: { outletId: string } }) {
  try {
    const outletId = Number.parseInt(params.outletId)

    // Validate outlet ID
    if (!isValidId(outletId)) {
      return NextResponse.json(
        {
          error: "Invalid outlet ID",
          details: ["Outlet ID must be a positive integer"],
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    console.log(`API: Fetching stock levels for outlet ${outletId}`)
    const stockLevels = await DatabaseService.getStockLevelsByOutlet(outletId)
    console.log(`API: Found ${stockLevels.length} stock levels for outlet ${outletId}`)

    return NextResponse.json(stockLevels)
  } catch (error) {
    console.error("Error fetching stock levels:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch stock levels",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { outletId: string } }) {
  try {
    const outletId = Number.parseInt(params.outletId)

    // Validate outlet ID
    if (!isValidId(outletId)) {
      return NextResponse.json(
        {
          error: "Invalid outlet ID",
          details: ["Outlet ID must be a positive integer"],
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    const body = await request.json()
    console.log("API: Received stock update request:", body)

    const { updates, signature, contact } = body

    // Validate request body
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: ["Expected 'updates' array with at least one update"],
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    // Validate all updates
    const validationResults = updates.map((update, index) => {
      const validation = validateStockUpdate({
        ...update,
        outlet_id: update.outlet_id || outletId,
      })
      return { index, validation, originalData: update }
    })

    // Check for validation errors
    const validationErrors = validationResults
      .filter((result) => !result.validation.isValid)
      .map((result) => `Update ${result.index}: ${result.validation.errors.join(", ")}`)

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed for one or more updates",
          details: validationErrors,
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    console.log(`API: Processing ${updates.length} validated stock updates`)

    const results = []
    const errors = []

    // Process each validated update
    for (const { validation } of validationResults) {
      try {
        const { outlet_id, product_id, quantity, order_quantity, updated_by } = validation.data!

        console.log(
          `API: Updating stock - outlet: ${outlet_id}, product: ${product_id}, quantity: ${quantity}, order_quantity: ${order_quantity}`,
        )

        // Update stock level with order quantity
        const updatedStock = await DatabaseService.updateStockLevelWithOrder(
          outlet_id,
          product_id,
          quantity,
          order_quantity || 0,
          updated_by,
        )

        if (!updatedStock) {
          errors.push(`Failed to update stock level for product ${product_id}`)
          continue
        }

        results.push(updatedStock)

        // Add audit trail entry
        try {
          await DatabaseService.addAuditEntry({
            entity_type: "stock",
            entity_id: outlet_id,
            action: "Updated stock level and order quantity",
            details: `Product ${product_id}: stock set to ${quantity}, order quantity set to ${order_quantity || 0}`,
            field: "quantity_and_order",
            user_id: updated_by,
            user_email: `${updated_by}@example.com`,
            ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1",
          })
        } catch (auditError) {
          console.warn("Failed to add audit entry:", auditError)
          // Don't fail the entire operation for audit errors
        }
      } catch (updateError) {
        console.error(`Error updating stock for product ${validation.data!.product_id}:`, updateError)
        errors.push(
          `Failed to update product ${validation.data!.product_id}: ${updateError instanceof Error ? updateError.message : "Unknown error"}`,
        )
      }
    }

    // Handle signature and contact if provided
    if (signature || contact) {
      try {
        await DatabaseService.addAuditEntry({
          entity_type: "outlet",
          entity_id: outletId,
          action: "Store signature recorded",
          details: `Signature: ${signature || "N/A"}, Contact: ${contact || "N/A"}`,
          field: "signature",
          user_id: updates[0]?.updated_by || "system",
          user_email: `${updates[0]?.updated_by || "system"}@example.com`,
          ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1",
        })
      } catch (signatureError) {
        console.warn("Failed to record signature:", signatureError)
      }
    }

    // Return results
    if (errors.length > 0 && results.length === 0) {
      // All updates failed
      return NextResponse.json(
        {
          error: "All stock updates failed",
          details: errors,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    } else if (errors.length > 0) {
      // Some updates failed
      return NextResponse.json(
        {
          success: true,
          results,
          warnings: errors,
          message: `${results.length} updates succeeded, ${errors.length} failed`,
          timestamp: new Date().toISOString(),
        },
        { status: 207 },
      ) // 207 Multi-Status
    } else {
      // All updates succeeded
      return NextResponse.json({
        success: true,
        results,
        message: `Successfully updated ${results.length} stock levels`,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Error in stock update API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
