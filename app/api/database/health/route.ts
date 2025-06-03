import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Check if all required tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('outlets', 'products', 'stock_levels', 'categories', 'regions', 'product_mappings', 'audit_trail', 'users')
      ORDER BY table_name
    `

    // Check if stock_levels has expiration_date column
    const stockLevelsColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'stock_levels' 
      AND table_schema = 'public'
      ORDER BY column_name
    `

    // Test a simple query
    const testQuery = await sql`SELECT COUNT(*) as count FROM outlets`

    return NextResponse.json({
      status: "healthy",
      tables: tables.rows.map((row) => row.table_name),
      stock_levels_columns: stockLevelsColumns.rows,
      outlet_count: testQuery.rows[0].count,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
