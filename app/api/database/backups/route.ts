import { NextResponse } from "next/server"
import { getAvailableBackups, getAvailableExports } from "@/lib/db/db-export-import"

export async function GET() {
  try {
    const backups = getAvailableBackups()
    const exports = getAvailableExports()

    return NextResponse.json({
      backups,
      exports,
    })
  } catch (error) {
    console.error("Error fetching database backups:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch database backups",
      },
      { status: 500 },
    )
  }
}
