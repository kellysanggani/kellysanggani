import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db/database-service"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const regions = await DatabaseService.getRegions()
    return NextResponse.json(regions)
  } catch (error) {
    console.error("Error fetching regions:", error)
    return NextResponse.json({ error: "Failed to fetch regions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Region name is required" }, { status: 400 })
    }

    const region = await DatabaseService.createRegion(name)
    return NextResponse.json(region)
  } catch (error) {
    console.error("Error creating region:", error)
    return NextResponse.json({ error: "Failed to create region" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { regions } = await request.json()

    if (!Array.isArray(regions)) {
      return NextResponse.json({ error: "Regions must be an array" }, { status: 400 })
    }

    await DatabaseService.updateRegions(regions)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating regions:", error)
    return NextResponse.json({ error: "Failed to update regions" }, { status: 500 })
  }
}
