import { type NextRequest, NextResponse } from "next/server"
import { importDatabase } from "@/lib/db/db-export-import"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 },
      )
    }

    // Check file type
    if (!file.name.endsWith(".db")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only .db files are allowed.",
        },
        { status: 400 },
      )
    }

    // Create a temporary directory for the upload
    const uploadDir = path.join(process.cwd(), "uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Generate a unique filename
    const uniqueFilename = `${uuidv4()}-${file.name}`
    const filePath = path.join(uploadDir, uniqueFilename)

    // Convert the file to a buffer and save it
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)

    // Import the database
    const importResult = await importDatabase(filePath)

    // Clean up the temporary file
    fs.unlinkSync(filePath)

    if (importResult) {
      return NextResponse.json({
        success: true,
        message: "Database imported successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to import database",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error importing database:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to import database",
      },
      { status: 500 },
    )
  }
}
