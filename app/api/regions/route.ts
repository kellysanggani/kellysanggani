import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db/database-service"
import { validateStringArray } from "@/lib/validation/schemas"

export async function GET() {
  try {
    console.log("API: Fetching regions...")
    const regions = await DatabaseService.getRegions()
    console.log(`API: Successfully fetched ${regions.length} regions`)

    // Validate and sanitize region data
    const validatedRegions = regions.map((region) => ({
      id: region.id || 0,
      name: region.name || "Unknown Region",
      created_at: region.created_at || new Date().toISOString(),
      updated_at: region.updated_at || new Date().toISOString(),
    }))

    return NextResponse.json(validatedRegions)
  } catch (error) {
    console.error("Error fetching regions:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch regions",
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
    console.log("API: Updating regions with data:", rawData)

    // Validate regions array
    const validation = validateStringArray(rawData.regions, "regions")
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

    const validatedRegions = validation.data!

    // Update regions in database
    await DatabaseService.updateRegions(validatedRegions)

    // Fetch updated regions to return
    const updatedRegions = await DatabaseService.getRegions()

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${validatedRegions.length} regions`,
      data: updatedRegions,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating regions:", error)
    return NextResponse.json(
      {
        error: "Failed to update regions",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json()
    console.log("API: Creating region with data:", rawData)

    if (!rawData.name || typeof rawData.name !== "string") {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: "Region name is required and must be a string",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    // Create region in database
    const newRegion = await DatabaseService.createRegion(rawData.name.trim())

    if (!newRegion) {
      throw new Error("Failed to create region")
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created region "${newRegion.name}"`,
      data: newRegion,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error creating region:", error)
    return NextResponse.json(
      {
        error: "Failed to create region",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
