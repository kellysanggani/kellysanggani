import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Return empty array for now to avoid database connection issues during build
    return NextResponse.json([])
  } catch (error) {
    console.error("Error fetching stock:", error)
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 })
  }
}
