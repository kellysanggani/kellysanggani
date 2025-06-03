import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db/database-service"
import { validateStringArray } from "@/lib/validation/schemas"

export async function GET() {
  try {
    console.log("API: Fetching categories...")
    const categories = await DatabaseService.getCategories()
    console.log(`API: Successfully fetched ${categories.length} categories`)

    // Validate and sanitize category data
    const validatedCategories = categories.map((category) => ({
      id: category.id || 0,
      name: category.name || "Unknown Category",
      created_at: category.created_at || new Date().toISOString(),
      updated_at: category.updated_at || new Date().toISOString(),
    }))

    return NextResponse.json(validatedCategories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch categories",
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
    console.log("API: Updating categories with data:", rawData)

    // Validate categories array
    const validation = validateStringArray(rawData.categories, "categories")
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

    const validatedCategories = validation.data!

    // Update categories in database
    await DatabaseService.updateCategories(validatedCategories)

    // Fetch updated categories to return
    const updatedCategories = await DatabaseService.getCategories()

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${validatedCategories.length} categories`,
      data: updatedCategories,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating categories:", error)
    return NextResponse.json(
      {
        error: "Failed to update categories",
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
    console.log("API: Creating category with data:", rawData)

    if (!rawData.name || typeof rawData.name !== "string") {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: "Category name is required and must be a string",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    // Create category in database
    const newCategory = await DatabaseService.createCategory(rawData.name.trim())

    if (!newCategory) {
      throw new Error("Failed to create category")
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created category "${newCategory.name}"`,
      data: newCategory,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      {
        error: "Failed to create category",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
