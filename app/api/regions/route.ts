import { NextResponse, type NextRequest } from "next/server"
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

    // For now, return success with validated data
    // In real implementation, you'd update the database
    return NextResponse.json({
      success: true,
      message: `Successfully validated ${validatedRegions.length} regions`,
      data: validatedRegions,
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
