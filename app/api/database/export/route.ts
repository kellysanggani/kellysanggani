import { NextResponse } from "next/server"
import { exportDatabase } from "@/lib/db/db-export-import"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const exportPath = await exportDatabase()
    const filename = path.basename(exportPath)

    return NextResponse.json({
      success: true,
      message: "Database exported successfully",
      filename,
      path: exportPath,
    })
  } catch (error) {
    console.error("Error exporting database:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to export database",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    const exportPath = await exportDatabase()
    const filename = path.basename(exportPath)

    // Read the file as a buffer
    const fileBuffer = fs.readFileSync(exportPath)

    // Create a response with the file
    const response = new NextResponse(fileBuffer)

    // Set headers for file download
    response.headers.set("Content-Disposition", `attachment; filename=${filename}`)
    response.headers.set("Content-Type", "application/octet-stream")

    return response
  } catch (error) {
    console.error("Error downloading database:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to download database",
      },
      { status: 500 },
    )
  }
}
