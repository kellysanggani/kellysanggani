import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db/database-service"
import { validateProduct } from "@/lib/validation/schemas"

export async function GET() {
  try {
    console.log("API: Fetching products...")
    const products = await DatabaseService.getProducts()
    console.log(`API: Successfully fetched ${products.length} products`)

    // Validate and sanitize product data
    const validatedProducts = products.map((product) => {
      const validation = validateProduct(product)
      if (!validation.isValid) {
        console.warn(`Invalid product data for ID ${product.id}:`, validation.errors)
        // Return sanitized version
        return {
          id: product.id,
          name: product.name || "Unknown Product",
          supplier: product.supplier || null,
          low_threshold: typeof product.low_threshold === "number" ? product.low_threshold : 10,
          critical_threshold: typeof product.critical_threshold === "number" ? product.critical_threshold : 5,
          availability: product.availability || "In Stock",
          expiration_date: product.expiration_date || null,
          last_updated: product.last_updated || null,
          created_at: product.created_at || new Date().toISOString(),
          updated_at: product.updated_at || new Date().toISOString(),
        }
      }
      return product
    })

    return NextResponse.json(validatedProducts)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch products",
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
    console.log("API: Creating product with data:", rawData)

    // Validate input data
    const validation = validateProduct(rawData)
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

    // For now, return success with validated data
    // In real implementation, you'd call DatabaseService.createProduct(validation.data)
    return NextResponse.json(
      {
        success: true,
        message: "Product validation passed",
        data: validation.data,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
