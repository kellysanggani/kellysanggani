import fs from "fs"
import path from "path"
import { getDatabaseFilePath } from "./sqlite"

// Export the database to a file
export async function exportDatabase(): Promise<string> {
  const sourceDbPath = getDatabaseFilePath()
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const exportDir = path.join(process.cwd(), "exports")

  // Create exports directory if it doesn't exist
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true })
  }

  const exportPath = path.join(exportDir, `cinema-stock-${timestamp}.db`)

  // Copy the database file
  fs.copyFileSync(sourceDbPath, exportPath)

  return exportPath
}

// Import a database from a file
export async function importDatabase(importFilePath: string): Promise<boolean> {
  const targetDbPath = getDatabaseFilePath()

  try {
    // Validate the import file
    if (!fs.existsSync(importFilePath)) {
      throw new Error("Import file does not exist")
    }

    // Create a backup of the current database
    const backupDir = path.join(process.cwd(), "backups")
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const backupPath = path.join(backupDir, `cinema-stock-backup-${timestamp}.db`)

    // Only create backup if current database exists
    if (fs.existsSync(targetDbPath)) {
      fs.copyFileSync(targetDbPath, backupPath)
    }

    // Replace the current database with the import file
    fs.copyFileSync(importFilePath, targetDbPath)

    return true
  } catch (error) {
    console.error("Error importing database:", error)
    return false
  }
}

// Get a list of available database backups
export function getAvailableBackups(): string[] {
  const backupDir = path.join(process.cwd(), "backups")

  if (!fs.existsSync(backupDir)) {
    return []
  }

  return fs
    .readdirSync(backupDir)
    .filter((file) => file.endsWith(".db"))
    .sort()
    .reverse() // Most recent first
}

// Get a list of available database exports
export function getAvailableExports(): string[] {
  const exportDir = path.join(process.cwd(), "exports")

  if (!fs.existsSync(exportDir)) {
    return []
  }

  return fs
    .readdirSync(exportDir)
    .filter((file) => file.endsWith(".db"))
    .sort()
    .reverse() // Most recent first
}
