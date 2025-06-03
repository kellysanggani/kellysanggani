import { NextResponse } from "next/server"
import { SQLiteSyncService } from "@/lib/db/sqlite-sync"

export async function POST() {
  try {
    const stats = SQLiteSyncService.getDatabaseStats()
    const validation = SQLiteSyncService.validateDatabase()

    return NextResponse.json({
      success: true,
      stats,
      validation,
      message: "Database sync status retrieved successfully",
    })
  } catch (error) {
    console.error("Error getting sync status:", error)
    return NextResponse.json({ error: "Failed to get sync status" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const data = SQLiteSyncService.exportToJSON()

    return NextResponse.json({
      success: true,
      data,
      message: "Data exported successfully",
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
