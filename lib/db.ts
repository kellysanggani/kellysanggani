import { sql } from "@vercel/postgres"
import { ensureDatabaseInitialized } from "./db/postgres"

// Database connection and query interface
export class Database {
  private static initialized = false

  private static async ensureInitialized(): Promise<void> {
    if (!Database.initialized) {
      try {
        await ensureDatabaseInitialized()
        Database.initialized = true
      } catch (error) {
        console.error("Failed to initialize database:", error)
        throw error
      }
    }
  }

  // Execute raw SQL queries
  static async query(query: string, params: any[] = []): Promise<any> {
    await Database.ensureInitialized()
    try {
      const result = await sql.query(query, params)
      return result
    } catch (error) {
      console.error("Database query error:", error)
      throw error
    }
  }

  // Execute SQL with template literals
  static async execute(strings: TemplateStringsArray, ...values: any[]): Promise<any> {
    await Database.ensureInitialized()
    try {
      return await sql(strings, ...values)
    } catch (error) {
      console.error("Database execution error:", error)
      throw error
    }
  }

  // Get database connection status
  static async getStatus(): Promise<{ connected: boolean; error?: string }> {
    try {
      await Database.ensureInitialized()
      const result = await sql`SELECT 1 as test`
      return { connected: true }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Transaction support
  static async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    await Database.ensureInitialized()
    try {
      // Note: Vercel Postgres doesn't have built-in transaction support
      // This is a simplified implementation
      return await callback(sql)
    } catch (error) {
      console.error("Transaction error:", error)
      throw error
    }
  }
}

// Export the database instance
export const db = {
  query: Database.query.bind(Database),
  execute: Database.execute.bind(Database),
  getStatus: Database.getStatus.bind(Database),
  transaction: Database.transaction.bind(Database),
  sql, // Direct access to Vercel Postgres sql function
}

// Default export for convenience
export default db
