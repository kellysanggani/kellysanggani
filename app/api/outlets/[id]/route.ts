import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db/database-service"
import { validateOutlet, isValidId } from "@/lib/validation/schemas"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    // Validate ID
    if (!isValidId(id)) {
      return NextResponse.json(
        {
          error: "Invalid outlet ID",
          details: ["ID must be a positive integer"],
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    console.log(`API: Fetching outlet with ID: ${id}`)
    const outlet = await DatabaseService.getOutletById(id)

    if (!outlet) {
      return NextResponse.json(
        {
          error: "Outlet not found",
          details: [`No outlet found with ID ${id}`],
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      )
    }

    // Validate outlet data before returning
    const validation = validateOutlet(outlet)
    if (!validation.isValid) {
      console.warn(`Invalid outlet data for ID ${id}:`, validation.errors)
      // Return sanitized version
      const sanitizedOutlet = {
        id: outlet.id,
        name: outlet.name || "Unknown Outlet",
        address: outlet.address || null,
        pic_name: outlet.pic_name || null,
        pic_contact: outlet.pic_contact || null,
        email: outlet.email || null,
        sales_person: outlet.sales_person || null,
        last_updated_at: outlet.last_updated_at || null,
      }
      return NextResponse.json(sanitizedOutlet)
    }

    return NextResponse.json(outlet)
  } catch (error) {
    console.error("Error fetching outlet:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch outlet",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    // Validate ID
    if (!isValidId(id)) {
      return NextResponse.json(
        {
          error: "Invalid outlet ID",
          details: ["ID must be a positive integer"],
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    const rawData = await request.json()
    console.log(`API: Updating outlet ${id} with data:`, rawData)

    // Validate input data
    const validation = validateOutlet(rawData)
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

    const updatedOutlet = await DatabaseService.updateOutlet(id, validation.data!)

    if (!updatedOutlet) {
      return NextResponse.json(
        {
          error: "Outlet not found or update failed",
          details: [`No outlet found with ID ${id} or update operation failed`],
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      )
    }

    // Add audit trail
    try {
      await DatabaseService.addAuditEntry({
        entity_type: "outlet",
        entity_id: id,
        action: "Updated outlet information",
        details: `Updated fields: ${Object.keys(validation.data!).join(", ")}`,
        field: "outlet_update",
        user_id: "system",
        user_email: "system@app.com",
        ip_address: request.headers.get("x-forwarded-for") || "127.0.0.1",
      })
    } catch (auditError) {
      console.error("Failed to add audit entry:", auditError)
      // Don't fail the update if audit fails
    }

    return NextResponse.json(updatedOutlet)
  } catch (error) {
    console.error("Error updating outlet:", error)
    return NextResponse.json(
      {
        error: "Failed to update outlet",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
