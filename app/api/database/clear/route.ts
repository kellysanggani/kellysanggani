import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db/database-service"

export async function POST() {
  try {
    console.log("API: Clearing all database data...")

    await DatabaseService.clearAllData()

    console.log("API: Successfully cleared all data")

    return NextResponse.json({
      success: true,
      message: "All data has been cleared successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error clearing data:", error)
    return NextResponse.json(
      {
        error: "Failed to clear data",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
