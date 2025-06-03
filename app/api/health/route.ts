import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Simple health check without using the Database class
    const result = await sql`SELECT 1 as test`

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      environment: process.env.NODE_ENV || "development",
      storage: "postgres",
      test: result.rows[0].test,
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
