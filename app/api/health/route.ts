import { NextResponse } from "next/server"
import { dbService } from "@/lib/db/database-service"
import { sql } from "@vercel/postgres"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Test database connection
    await dbService.ensureInitialized()

    // Get counts
    const outlets = await sql`SELECT COUNT(*) FROM outlets`
    const products = await sql`SELECT COUNT(*) FROM products`
    const categories = await sql`SELECT COUNT(*) FROM categories`
    const regions = await sql`SELECT COUNT(*) FROM regions`

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      environment: process.env.NODE_ENV || "development",
      storage: "postgres",
      counts: {
        outlets: Number.parseInt(outlets.rows[0].count),
        products: Number.parseInt(products.rows[0].count),
        categories: Number.parseInt(categories.rows[0].count),
        regions: Number.parseInt(regions.rows[0].count),
      },
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
