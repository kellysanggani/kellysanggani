import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db/database-service"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    console.log("API: Fetching outlets...")
    const outlets = await DatabaseService.getOutlets()
    console.log(`API: Successfully fetched ${outlets.length} outlets`)

    return NextResponse.json(outlets)
  } catch (error) {
    console.error("Error fetching outlets:", error)
    return NextResponse.json({ error: "Failed to fetch outlets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log("API: Creating outlet with data:", data)

    // Create outlet in database
    const newOutlet = await DatabaseService.createOutlet(data)

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
    return NextResponse.json({ error: "Failed to create outlet" }, { status: 500 })
  }
}
