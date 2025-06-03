import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db/database-service"
import { validateProductMapping } from "@/lib/validation/schemas"

export async function GET() {
  try {
    console.log("API: Fetching product mappings...")
    const mappings = await DatabaseService.getProductMappings()
    console.log(`API: Successfully fetched ${mappings.length} product mappings`)

    // Validate mapping data
    const validatedMappings = mappings.map((mapping) => {
      // Ensure required fields exist
      return {
        id: mapping.id || 0,
        outlet_id: mapping.outlet_id || 0,
        product_id: mapping.product_id || 0,
        is_active: typeof mapping.is_active === "boolean" ? mapping.is_active : true,
        outlet_name: mapping.outlet_name || "Unknown Outlet",
        product_name: mapping.product_name || "Unknown Product",
        created_at: mapping.created_at || new Date().toISOString(),
        updated_at: mapping.updated_at || new Date().toISOString(),
      }
    })

    return NextResponse.json(validatedMappings)
  } catch (error) {
    console.error("Error fetching product mappings:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch product mappings",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const rawData = await request.json()
    console.log("API: Updating product mapping with data:", rawData)

    // Validate input data
    const validation = validateProductMapping(rawData)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    const { outletId, productId, isActive } = validation.data!

    const updatedMapping = await DatabaseService.updateProductMapping(outletId, productId, isActive)
    if (!updatedMapping) {
      return NextResponse.json(
        {
          error: "Failed to update product mapping",
          details: [`No mapping found for outlet ${outletId} and product ${productId}`],
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      )
    }

    // Add audit trail
    try {
      await DatabaseService.addAuditEntry({
        entity_type: "product_mapping",
        entity_id: outletId,
        action: `${isActive ? "Enabled" : "Disabled"} product mapping`,
        details: `Product ${productId} mapping ${isActive ? "enabled" : "disabled"} for outlet ${outletId}`,
        field: "is_active",
        user_id: "current-user-id",
        user_email: "user@example.com",
        ip_address: request.headers.get("x-forwarded-for") || "127.0.0.1",
      })
    } catch (auditError) {
      console.warn("Failed to add audit entry:", auditError)
      // Don't fail the update if audit fails
    }

    return NextResponse.json(updatedMapping)
  } catch (error) {
    console.error("Error updating product mapping:", error)
    return NextResponse.json(
      {
        error: "Failed to update product mapping",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
