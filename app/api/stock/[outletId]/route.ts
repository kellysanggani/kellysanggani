import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { outletId: string } }) {
  try {
    const outletId = params.outletId
    // Return empty array for now to avoid database connection issues during build
    return NextResponse.json([])
  } catch (error) {
    console.error("Error fetching stock for outlet:", error)
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 })
  }
}
