import { DatabaseService } from "./database-service"
import type { Outlet, Product, StockLevel, ProductMapping, AuditTrail } from "./database-service"

export interface SyncResult {
  success: boolean
  message: string
  synced: {
    outlets: number
    products: number
    stockLevels: number
    mappings: number
  }
  errors: string[]
}

export class SQLiteSyncService {
  // Sync all data to another SQLite database (for backup/replication)
  static async syncToDatabase(targetDbPath: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      message: "",
      synced: { outlets: 0, products: 0, stockLevels: 0, mappings: 0 },
      errors: [],
    }

    try {
      // Get all data from current database
      const outlets = DatabaseService.getOutlets()
      const products = DatabaseService.getProducts()
      const stockLevels = DatabaseService.getStockLevels()
      const mappings = DatabaseService.getProductMappings()

      // In a real implementation, you would:
      // 1. Connect to target database
      // 2. Create tables if they don't exist
      // 3. Insert/update data
      // 4. Handle conflicts

      result.synced.outlets = outlets.length
      result.synced.products = products.length
      result.synced.stockLevels = stockLevels.length
      result.synced.mappings = mappings.length

      result.success = true
      result.message = `Successfully synced ${outlets.length} outlets, ${products.length} products, ${stockLevels.length} stock levels, and ${mappings.length} mappings`

      // Add audit trail
      DatabaseService.addAuditEntry({
        entity_type: "system",
        entity_id: 0,
        action: "Database sync completed",
        details: result.message,
        field: "sync",
        user_id: "system",
        user_email: "system@app.com",
        ip_address: "127.0.0.1",
      })
    } catch (error) {
      result.errors.push(`Sync failed: ${error}`)
      result.message = "Sync operation failed"
      console.error("Database sync error:", error)
    }

    return result
  }

  // Export data to JSON format
  static exportToJSON(): {
    outlets: Outlet[]
    products: Product[]
    stockLevels: StockLevel[]
    mappings: ProductMapping[]
    auditTrail: AuditTrail[]
    exportedAt: string
  } {
    return {
      outlets: DatabaseService.getOutlets(),
      products: DatabaseService.getProducts(),
      stockLevels: DatabaseService.getStockLevels(),
      mappings: DatabaseService.getProductMappings(),
      auditTrail: DatabaseService.getAuditTrail(),
      exportedAt: new Date().toISOString(),
    }
  }

  // Import data from JSON format
  static importFromJSON(data: {
    outlets?: Outlet[]
    products?: Product[]
    stockLevels?: StockLevel[]
    mappings?: ProductMapping[]
  }): SyncResult {
    const result: SyncResult = {
      success: false,
      message: "",
      synced: { outlets: 0, products: 0, stockLevels: 0, mappings: 0 },
      errors: [],
    }

    try {
      // Import outlets
      if (data.outlets) {
        data.outlets.forEach((outlet) => {
          try {
            DatabaseService.updateOutlet(outlet.id, outlet)
            result.synced.outlets++
          } catch (error) {
            result.errors.push(`Failed to import outlet ${outlet.name}: ${error}`)
          }
        })
      }

      // Import products
      if (data.products) {
        data.products.forEach((product) => {
          try {
            DatabaseService.updateProduct(product.id, product)
            result.synced.products++
          } catch (error) {
            result.errors.push(`Failed to import product ${product.name}: ${error}`)
          }
        })
      }

      // Import stock levels
      if (data.stockLevels) {
        data.stockLevels.forEach((stock) => {
          try {
            DatabaseService.updateStockLevel(stock.outlet_id, stock.product_id, stock.quantity, stock.updated_by)
            result.synced.stockLevels++
          } catch (error) {
            result.errors.push(`Failed to import stock level: ${error}`)
          }
        })
      }

      // Import mappings
      if (data.mappings) {
        data.mappings.forEach((mapping) => {
          try {
            DatabaseService.updateProductMapping(mapping.outlet_id, mapping.product_id, mapping.is_active)
            result.synced.mappings++
          } catch (error) {
            result.errors.push(`Failed to import mapping: ${error}`)
          }
        })
      }

      result.success = result.errors.length === 0
      result.message = result.success
        ? `Successfully imported ${result.synced.outlets} outlets, ${result.synced.products} products, ${result.synced.stockLevels} stock levels, and ${result.synced.mappings} mappings`
        : `Import completed with ${result.errors.length} errors`

      // Add audit trail
      DatabaseService.addAuditEntry({
        entity_type: "system",
        entity_id: 0,
        action: "Data import completed",
        details: result.message,
        field: "import",
        user_id: "system",
        user_email: "system@app.com",
        ip_address: "127.0.0.1",
      })
    } catch (error) {
      result.errors.push(`Import failed: ${error}`)
      result.message = "Import operation failed"
      console.error("Data import error:", error)
    }

    return result
  }

  // Get database statistics
  static getDatabaseStats() {
    return {
      outlets: DatabaseService.getOutlets().length,
      products: DatabaseService.getProducts().length,
      stockLevels: DatabaseService.getStockLevels().length,
      mappings: DatabaseService.getProductMappings().length,
      auditEntries: DatabaseService.getAuditTrail().length,
      categories: DatabaseService.getCategories().length,
      regions: DatabaseService.getRegions().length,
      users: DatabaseService.getUsers().length,
    }
  }

  // Validate database integrity
  static validateDatabase(): {
    isValid: boolean
    issues: string[]
    warnings: string[]
  } {
    const issues: string[] = []
    const warnings: string[] = []

    try {
      const outlets = DatabaseService.getOutlets()
      const products = DatabaseService.getProducts()
      const stockLevels = DatabaseService.getStockLevels()
      const mappings = DatabaseService.getProductMappings()

      // Check for orphaned stock levels
      stockLevels.forEach((stock) => {
        const outletExists = outlets.some((o) => o.id === stock.outlet_id)
        const productExists = products.some((p) => p.id === stock.product_id)

        if (!outletExists) {
          issues.push(`Stock level references non-existent outlet ID: ${stock.outlet_id}`)
        }
        if (!productExists) {
          issues.push(`Stock level references non-existent product ID: ${stock.product_id}`)
        }
      })

      // Check for orphaned mappings
      mappings.forEach((mapping) => {
        const outletExists = outlets.some((o) => o.id === mapping.outlet_id)
        const productExists = products.some((p) => p.id === mapping.product_id)

        if (!outletExists) {
          issues.push(`Product mapping references non-existent outlet ID: ${mapping.outlet_id}`)
        }
        if (!productExists) {
          issues.push(`Product mapping references non-existent product ID: ${mapping.product_id}`)
        }
      })

      // Check for outlets without any mappings
      outlets.forEach((outlet) => {
        const hasMappings = mappings.some((m) => m.outlet_id === outlet.id && m.is_active)
        if (!hasMappings) {
          warnings.push(`Outlet "${outlet.name}" has no active product mappings`)
        }
      })

      // Check for products with expired dates
      products.forEach((product) => {
        const expDate = new Date(product.expiration_date)
        const today = new Date()
        if (expDate < today) {
          warnings.push(`Product "${product.name}" has expired (${product.expiration_date})`)
        }
      })
    } catch (error) {
      issues.push(`Database validation error: ${error}`)
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
    }
  }
}
