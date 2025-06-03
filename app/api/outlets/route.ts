import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db/database-service"
import { validateOutlet } from "@/lib/validation/schemas"

export async function GET() {
  try {
    console.log("API: Fetching outlets...")
    const outlets = await DatabaseService.getOutlets()
    console.log(`API: Successfully fetched ${outlets.length} outlets`)

    // Validate each outlet data before returning
    const validatedOutlets = outlets.map((outlet) => {
      const validation = validateOutlet(outlet)
      if (!validation.isValid) {
        console.warn(`Invalid outlet data for ID ${outlet.id}:`, validation.errors)
        // Return sanitized version or skip invalid data
        return {
          id: outlet.id,
          name: outlet.name || "Unknown Outlet",
          address: outlet.address || null,
          pic_name: outlet.pic_name || null,
          pic_contact: outlet.pic_contact || null,
          email: outlet.email || null,
          sales_person: outlet.sales_person || null,
          last_updated_at: outlet.last_updated_at || null,
        }
      }
      return outlet
    })

    return NextResponse.json(validatedOutlets)
  } catch (error) {
    console.error("Error fetching outlets:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch outlets",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const rawData = await request.json()
    console.log("API: Creating outlet with data:", rawData)

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

    // Create outlet in database
    const newOutlet = await DatabaseService.createOutlet(validation.data)

    if (!newOutlet) {
      throw new Error("Failed to create outlet")
    }

    return NextResponse.json(
      {
        success: true,
        message: "Outlet created successfully",
        data: newOutlet,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating outlet:", error)
    return NextResponse.json(
      {
        error: "Failed to create outlet",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
