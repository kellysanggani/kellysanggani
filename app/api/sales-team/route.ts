import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db/database-service"

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching sales team data...")

    // Get sales team statistics
    const stats = await dbService.getSalesTeamStats()

    // Get sales users with their outlet counts
    const salesUsers = await dbService.getSalesUsersWithOutletCounts()

    console.log("Sales team data fetched successfully:", {
      statsCount: Object.keys(stats).length,
      usersCount: salesUsers.length,
    })

    return NextResponse.json({
      stats,
      users: salesUsers,
    })
  } catch (error) {
    console.error("Error in sales team API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch sales team data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
