import { sql } from "@vercel/postgres"
import { ensureDatabaseInitialized } from "./postgres"

// Define interfaces for our data models
export interface Outlet {
  id: number
  name: string
  category_id: number | null
  region_id: number | null
  sales_person: string | null
  last_check_date: string | null
  last_order_date: string | null
  address: string | null
  phone: string | null
  email: string | null
  store_name: string | null
  pic_name: string | null
  pic_contact: string | null
  last_updated_by: string | null
  last_updated_at: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  name: string
  supplier: string | null
  expiration_date: string | null
  availability: "In Stock" | "Low Stock" | "Out of Stock"
  low_threshold: number
  critical_threshold: number
  last_updated: string | null
  created_at: string
  updated_at: string
  barcode?: string | null
}

export interface Category {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface Region {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface StockLevel {
  id: number
  outlet_id: number
  product_id: number
  quantity: number
  order_quantity: number
  expiration_date: string | null
  last_updated: string | null
  updated_by: string | null
}

export interface ProductMapping {
  id: number
  outlet_id: number
  product_id: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuditTrail {
  id: number
  entity_type: string
  entity_id: number
  action: string
  details: string | null
  field: string | null
  old_value: string | null
  new_value: string | null
  user_id: string | null
  user_email: string | null
  ip_address: string | null
  timestamp: string
}

export interface User {
  id: number
  email: string
  name: string | null
  role: string
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

// Database service class with static methods
export class DatabaseService {
  private static initialized = false

  // Initialize the database
  private static async ensureInitialized(): Promise<void> {
    if (!DatabaseService.initialized) {
      try {
        // Only initialize if we have a database URL
        if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
          console.warn("No database URL found, skipping initialization")
          return
        }

        await ensureDatabaseInitialized()
        DatabaseService.initialized = true
      } catch (error) {
        console.error("Failed to initialize database:", error)
        // Don't throw in production to allow the app to start
        if (process.env.NODE_ENV === "production") {
          console.warn("Database initialization failed in production, continuing...")
          return
        }
        throw error
      }
    }
  }

  // Outlets
  static async getOutlets(): Promise<Outlet[]> {
    try {
      await DatabaseService.ensureInitialized()
      const result = await sql<Outlet>`SELECT * FROM outlets ORDER BY name`
      return result.rows
    } catch (error) {
      console.error("Error getting outlets:", error)
      return []
    }
  }

  static async getOutletById(id: number): Promise<Outlet | undefined> {
    try {
      await DatabaseService.ensureInitialized()
      const result = await sql<Outlet>`SELECT * FROM outlets WHERE id = ${id}`
      return result.rows.length > 0 ? result.rows[0] : undefined
    } catch (error) {
      console.error(`Error getting outlet by id ${id}:`, error)
      return undefined
    }
  }

  static async createOutlet(data: Partial<Outlet>): Promise<Outlet | null> {
    try {
      await DatabaseService.ensureInitialized()

      try {
        console.log("Creating outlet with data:", data)

        const result = await sql<Outlet>`
        INSERT INTO outlets (
          name, category_id, region_id, sales_person, address, phone, email, 
          store_name, pic_name, pic_contact, created_at, updated_at
        )
        VALUES (
          ${data.name}, ${data.category_id || null}, ${data.region_id || null}, 
          ${data.sales_person || null}, ${data.address || null}, ${data.phone || null}, 
          ${data.email || null}, ${data.store_name || null}, ${data.pic_name || null}, 
          ${data.pic_contact || null}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING *
      `

        console.log("Successfully created outlet")
        return result.rows.length > 0 ? result.rows[0] : null
      } catch (error) {
        console.error("Error creating outlet:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in createOutlet:", error)
      return null
    }
  }

  static async updateOutlet(id: number, data: Partial<Outlet>): Promise<Outlet | null> {
    try {
      await DatabaseService.ensureInitialized()

      try {
        console.log(`Updating outlet ${id} with data:`, data)

        // Get current outlet to verify it exists
        const currentOutlet = await DatabaseService.getOutletById(id)
        if (!currentOutlet) {
          console.error(`Outlet with id ${id} not found`)
          return null
        }

        // Update the outlet with individual field updates
        const result = await sql<Outlet>`
        UPDATE outlets 
        SET 
          name = COALESCE(${data.name || null}, name),
          category_id = COALESCE(${data.category_id || null}, category_id),
          region_id = COALESCE(${data.region_id || null}, region_id),
          sales_person = COALESCE(${data.sales_person || null}, sales_person),
          last_check_date = COALESCE(${data.last_check_date || null}, last_check_date),
          last_order_date = COALESCE(${data.last_order_date || null}, last_order_date),
          address = COALESCE(${data.address || null}, address),
          phone = COALESCE(${data.phone || null}, phone),
          email = COALESCE(${data.email || null}, email),
          store_name = COALESCE(${data.store_name || null}, store_name),
          pic_name = COALESCE(${data.pic_name || null}, pic_name),
          pic_contact = COALESCE(${data.pic_contact || null}, pic_contact),
          last_updated_by = COALESCE(${data.last_updated_by || null}, last_updated_by),
          last_updated_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `

        console.log(`Successfully updated outlet ${id}`)
        return result.rows.length > 0 ? result.rows[0] : null
      } catch (error) {
        console.error("Error updating outlet:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in updateOutlet:", error)
      return null
    }
  }

  // Products
  static async getProducts(): Promise<Product[]> {
    try {
      await DatabaseService.ensureInitialized()
      const result = await sql<Product>`SELECT * FROM products ORDER BY name`
      return result.rows
    } catch (error) {
      console.error("Error getting products:", error)
      return []
    }
  }

  static async getProductById(id: number): Promise<Product | undefined> {
    try {
      await DatabaseService.ensureInitialized()
      const result = await sql<Product>`SELECT * FROM products WHERE id = ${id}`
      return result.rows.length > 0 ? result.rows[0] : undefined
    } catch (error) {
      console.error(`Error getting product by id ${id}:`, error)
      return undefined
    }
  }

  static async updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
    try {
      await DatabaseService.ensureInitialized()

      try {
        // Get current product to verify it exists
        const currentProduct = await DatabaseService.getProductById(id)
        if (!currentProduct) {
          console.error(`Product with id ${id} not found`)
          return null
        }

        // Update the product
        const result = await sql<Product>`
        UPDATE products 
        SET 
          name = COALESCE(${data.name || null}, name),
          supplier = COALESCE(${data.supplier || null}, supplier),
          expiration_date = COALESCE(${data.expiration_date || null}, expiration_date),
          availability = COALESCE(${data.availability || null}, availability),
          low_threshold = COALESCE(${data.low_threshold || null}, low_threshold),
          critical_threshold = COALESCE(${data.critical_threshold || null}, critical_threshold),
          barcode = COALESCE(${data.barcode || null}, barcode),
          last_updated = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `

        return result.rows.length > 0 ? result.rows[0] : null
      } catch (error) {
        console.error("Error updating product:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in updateProduct:", error)
      return null
    }
  }

  // Categories
  static async getCategories(): Promise<Category[]> {
    try {
      await DatabaseService.ensureInitialized()
      const result = await sql<Category>`SELECT * FROM categories ORDER BY name`
      return result.rows
    } catch (error) {
      console.error("Error getting categories:", error)
      return []
    }
  }

  static async createCategory(name: string): Promise<Category | null> {
    try {
      await DatabaseService.ensureInitialized()

      try {
        const result = await sql<Category>`
        INSERT INTO categories (name, created_at, updated_at)
        VALUES (${name}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `
        return result.rows.length > 0 ? result.rows[0] : null
      } catch (error) {
        console.error("Error creating category:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in createCategory:", error)
      return null
    }
  }

  static async updateCategories(categories: string[]): Promise<boolean> {
    try {
      await DatabaseService.ensureInitialized()

      try {
        // Start a transaction
        await sql`BEGIN`

        // Get existing categories
        const existingCategories = await sql<Category>`SELECT * FROM categories`
        const existingNames = existingCategories.rows.map((cat) => cat.name)

        // Find categories to add
        const categoriesToAdd = categories.filter((name) => !existingNames.includes(name))

        // Find categories to remove
        const categoriesToRemove = existingNames.filter((name) => !categories.includes(name))

        // Add new categories
        for (const categoryName of categoriesToAdd) {
          await sql`
          INSERT INTO categories (name, created_at, updated_at)
          VALUES (${categoryName}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `
        }

        // Remove categories (only if no outlets are using them)
        for (const categoryName of categoriesToRemove) {
          const category = existingCategories.rows.find((cat) => cat.name === categoryName)
          if (category) {
            // Check if any outlets are using this category
            const outletsUsingCategory = await sql`
            SELECT COUNT(*) FROM outlets WHERE category_id = ${category.id}
          `

            if (outletsUsingCategory.rows[0].count === "0") {
              await sql`DELETE FROM categories WHERE id = ${category.id}`
            } else {
              console.warn(`Cannot delete category "${categoryName}" - it's being used by outlets`)
            }
          }
        }

        await sql`COMMIT`
        return true
      } catch (error) {
        await sql`ROLLBACK`
        console.error("Error updating categories:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in updateCategories:", error)
      return false
    }
  }

  static async deleteCategory(id: number): Promise<boolean> {
    try {
      await DatabaseService.ensureInitialized()

      try {
        // Check if any outlets are using this category
        const outletsUsingCategory = await sql`
        SELECT COUNT(*) FROM outlets WHERE category_id = ${id}
      `

        if (outletsUsingCategory.rows[0].count !== "0") {
          throw new Error("Cannot delete category - it's being used by outlets")
        }

        await sql`DELETE FROM categories WHERE id = ${id}`
        return true
      } catch (error) {
        console.error("Error deleting category:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in deleteCategory:", error)
      return false
    }
  }

  // Regions
  static async getRegions(): Promise<Region[]> {
    try {
      await DatabaseService.ensureInitialized()
      const result = await sql<Region>`SELECT * FROM regions ORDER BY name`
      return result.rows
    } catch (error) {
      console.error("Error getting regions:", error)
      return []
    }
  }

  static async createRegion(name: string): Promise<Region | null> {
    try {
      await DatabaseService.ensureInitialized()

      try {
        const result = await sql<Region>`
        INSERT INTO regions (name, created_at, updated_at)
        VALUES (${name}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `
        return result.rows.length > 0 ? result.rows[0] : null
      } catch (error) {
        console.error("Error creating region:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in createRegion:", error)
      return null
    }
  }

  static async updateRegions(regions: string[]): Promise<boolean> {
    try {
      await DatabaseService.ensureInitialized()

      try {
        // Start a transaction
        await sql`BEGIN`

        // Get existing regions
        const existingRegions = await sql<Region>`SELECT * FROM regions`
        const existingNames = existingRegions.rows.map((reg) => reg.name)

        // Find regions to add
        const regionsToAdd = regions.filter((name) => !existingNames.includes(name))

        // Find regions to remove
        const regionsToRemove = existingNames.filter((name) => !regions.includes(name))

        // Add new regions
        for (const regionName of regionsToAdd) {
          await sql`
          INSERT INTO regions (name, created_at, updated_at)
          VALUES (${regionName}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `
        }

        // Remove regions (only if no outlets are using them)
        for (const regionName of regionsToRemove) {
          const region = existingRegions.rows.find((reg) => reg.name === regionName)
          if (region) {
            // Check if any outlets are using this region
            const outletsUsingRegion = await sql`
            SELECT COUNT(*) FROM outlets WHERE region_id = ${region.id}
          `

            if (outletsUsingRegion.rows[0].count === "0") {
              await sql`DELETE FROM regions WHERE id = ${region.id}`
            } else {
              console.warn(`Cannot delete region "${regionName}" - it's being used by outlets`)
            }
          }
        }

        await sql`COMMIT`
        return true
      } catch (error) {
        await sql`ROLLBACK`
        console.error("Error updating regions:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in updateRegions:", error)
      return false
    }
  }

  // Stock Levels
  static async getStockLevels(): Promise<StockLevel[]> {
    try {
      await DatabaseService.ensureInitialized()
      const result = await sql<StockLevel>`SELECT * FROM stock_levels`
      return result.rows
    } catch (error) {
      console.error("Error getting stock levels:", error)
      return []
    }
  }

  static async getStockLevelsByOutlet(outletId: number): Promise<any[]> {
    try {
      await DatabaseService.ensureInitialized()
      const result = await sql`
      SELECT 
        sl.*,
        p.name as product_name
      FROM stock_levels sl
      JOIN products p ON sl.product_id = p.id
      WHERE sl.outlet_id = ${outletId}
      ORDER BY p.name
    `
      return result.rows
    } catch (error) {
      console.error(`Error getting stock levels by outlet ${outletId}:`, error)
      return []
    }
  }

  static async updateStockLevel(
    outletId: number,
    productId: number,
    quantity: number,
    expirationDate: string | null,
    updatedBy: string,
  ): Promise<StockLevel | null> {
    try {
      await DatabaseService.ensureInitialized()

      try {
        console.log(`DatabaseService.updateStockLevel called with:`, {
          outletId,
          productId,
          quantity,
          expirationDate,
          updatedBy,
        })

        // Validate inputs
        if (!outletId || !productId || quantity < 0) {
          throw new Error(`Invalid parameters: outletId=${outletId}, productId=${productId}, quantity=${quantity}`)
        }

        // Check if the stock level exists
        const existingResult = await sql<StockLevel>`
        SELECT * FROM stock_levels 
        WHERE outlet_id = ${outletId} AND product_id = ${productId}
      `

        console.log(`Found ${existingResult.rows.length} existing stock records`)

        if (existingResult.rows.length > 0) {
          // Update existing stock level with expiration_date
          console.log(`Updating existing stock level for outlet ${outletId}, product ${productId}`)
          const result = await sql<StockLevel>`
          UPDATE stock_levels 
          SET quantity = ${quantity}, 
              expiration_date = ${expirationDate}, 
              last_updated = CURRENT_TIMESTAMP, 
              updated_by = ${updatedBy}
          WHERE outlet_id = ${outletId} AND product_id = ${productId}
          RETURNING *
        `
          console.log(`Update successful, returning:`, result.rows[0])
          return result.rows[0]
        } else {
          // Insert new stock level with expiration_date
          console.log(`Creating new stock level for outlet ${outletId}, product ${productId}`)
          const result = await sql<StockLevel>`
          INSERT INTO stock_levels (outlet_id, product_id, quantity, expiration_date, last_updated, updated_by)
          VALUES (${outletId}, ${productId}, ${quantity}, ${expirationDate}, CURRENT_TIMESTAMP, ${updatedBy})
          RETURNING *
        `
          console.log(`Insert successful, returning:`, result.rows[0])
          return result.rows[0]
        }
      } catch (error) {
        console.error("Error in DatabaseService.updateStockLevel:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in updateStockLevel:", error)
      return null
    }
  }

  // New method to update stock level with order quantity
  static async updateStockLevelWithOrder(
    outletId: number,
    productId: number,
    quantity: number,
    orderQuantity: number,
    updatedBy: string,
  ): Promise<StockLevel | null> {
    try {
      await DatabaseService.ensureInitialized()

      try {
        console.log(`DatabaseService.updateStockLevelWithOrder called with:`, {
          outletId,
          productId,
          quantity,
          orderQuantity,
          updatedBy,
        })

        // Validate inputs
        if (!outletId || !productId || quantity < 0 || orderQuantity < 0) {
          throw new Error(
            `Invalid parameters: outletId=${outletId}, productId=${productId}, quantity=${quantity}, orderQuantity=${orderQuantity}`,
          )
        }

        // Check if the stock level exists
        const existingResult = await sql<StockLevel>`
        SELECT * FROM stock_levels 
        WHERE outlet_id = ${outletId} AND product_id = ${productId}
      `

        console.log(`Found ${existingResult.rows.length} existing stock records`)

        if (existingResult.rows.length > 0) {
          // Update existing stock level with order quantity
          console.log(`Updating existing stock level for outlet ${outletId}, product ${productId}`)
          const result = await sql<StockLevel>`
          UPDATE stock_levels 
          SET quantity = ${quantity}, 
              order_quantity = ${orderQuantity},
              last_updated = CURRENT_TIMESTAMP, 
              updated_by = ${updatedBy}
          WHERE outlet_id = ${outletId} AND product_id = ${productId}
          RETURNING *
        `
          console.log(`Update successful, returning:`, result.rows[0])
          return result.rows[0]
        } else {
          // Insert new stock level with order quantity
          console.log(`Creating new stock level for outlet ${outletId}, product ${productId}`)
          const result = await sql<StockLevel>`
          INSERT INTO stock_levels (outlet_id, product_id, quantity, order_quantity, last_updated, updated_by)
          VALUES (${outletId}, ${productId}, ${quantity}, ${orderQuantity}, CURRENT_TIMESTAMP, ${updatedBy})
          RETURNING *
        `
          console.log(`Insert successful, returning:`, result.rows[0])
          return result.rows[0]
        }
      } catch (error) {
        console.error("Error in DatabaseService.updateStockLevelWithOrder:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in updateStockLevelWithOrder:", error)
      return null
    }
  }

  // Product Mappings
  static async getProductMappings(): Promise<ProductMapping[]> {
    try {
      await DatabaseService.ensureInitialized()
      const result = await sql<ProductMapping>`SELECT * FROM product_mappings`
      return result.rows
    } catch (error) {
      console.error("Error getting product mappings:", error)
      return []
    }
  }

  static async getProductMappingsByOutlet(outletId: number): Promise<ProductMapping[]> {
    try {
      await DatabaseService.ensureInitialized()
      const result = await sql<ProductMapping>`
      SELECT * FROM product_mappings 
      WHERE outlet_id = ${outletId}
    `
      return result.rows
    } catch (error) {
      console.error(`Error getting product mappings by outlet ${outletId}:`, error)
      return []
    }
  }

  static async updateProductMapping(
    outletId: number,
    productId: number,
    isActive: boolean,
  ): Promise<ProductMapping | null> {
    try {
      await DatabaseService.ensureInitialized()

      try {
        // Check if the mapping exists
        const existingResult = await sql<ProductMapping>`
        SELECT * FROM product_mappings 
        WHERE outlet_id = ${outletId} AND product_id = ${productId}
      `

        if (existingResult.rows.length > 0) {
          // Update existing mapping
          const result = await sql<ProductMapping>`
          UPDATE product_mappings 
          SET is_active = ${isActive}, updated_at = CURRENT_TIMESTAMP
          WHERE outlet_id = ${outletId} AND product_id = ${productId}
          RETURNING *
        `
          return result.rows[0]
        } else {
          // Insert new mapping
          const result = await sql<ProductMapping>`
          INSERT INTO product_mappings (outlet_id, product_id, is_active, created_at, updated_at)
          VALUES (${outletId}, ${productId}, ${isActive}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *
        `
          return result.rows[0]
        }
      } catch (error) {
        console.error("Error updating product mapping:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in updateProductMapping:", error)
      return null
    }
  }

  // Audit Trail
  static async addAuditEntry(entry: {
    entity_type: string
    entity_id: number
    action: string
    details: string
    field: string
    old_value?: string
    new_value?: string
    user_id: string
    user_email: string
    ip_address: string
  }): Promise<AuditTrail | null> {
    try {
      await DatabaseService.ensureInitialized()

      try {
        const result = await sql<AuditTrail>`
        INSERT INTO audit_trail (
          entity_type, entity_id, action, details, field, 
          old_value, new_value, user_id, user_email, ip_address, timestamp
        )
        VALUES (
          ${entry.entity_type}, ${entry.entity_id}, ${entry.action}, 
          ${entry.details}, ${entry.field}, 
          ${entry.old_value || null}, ${entry.new_value || null}, 
          ${entry.user_id}, ${entry.user_email}, ${entry.ip_address},
          CURRENT_TIMESTAMP
        )
        RETURNING *
      `

        return result.rows.length > 0 ? result.rows[0] : null
      } catch (error) {
        console.error("Error adding audit entry:", error)
        return null
      }
    } catch (error) {
      console.error("Error in addAuditEntry:", error)
      return null
    }
  }

  static async getAuditTrail(entityType?: string, entityId?: number): Promise<AuditTrail[]> {
    try {
      await DatabaseService.ensureInitialized()

      try {
        if (entityType && entityId) {
          const result = await sql<AuditTrail>`
          SELECT * FROM audit_trail 
          WHERE entity_type = ${entityType} AND entity_id = ${entityId} 
          ORDER BY timestamp DESC
        `
          return result.rows
        } else if (entityType) {
          const result = await sql<AuditTrail>`
          SELECT * FROM audit_trail 
          WHERE entity_type = ${entityType} 
          ORDER BY timestamp DESC
        `
          return result.rows
        } else {
          const result = await sql<AuditTrail>`
          SELECT * FROM audit_trail 
          ORDER BY timestamp DESC
          LIMIT 100
        `
          return result.rows
        }
      } catch (error) {
        console.error("Error fetching audit trail:", error)
        return []
      }
    } catch (error) {
      console.error("Error in getAuditTrail:", error)
      return []
    }
  }

  // Users
  static async getUsers(): Promise<User[]> {
    try {
      await DatabaseService.ensureInitialized()
      const result = await sql<User>`SELECT * FROM users ORDER BY name`
      return result.rows
    } catch (error) {
      console.error("Error getting users:", error)
      return []
    }
  }

  static async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      await DatabaseService.ensureInitialized()
      const result = await sql<User>`SELECT * FROM users WHERE email = ${email}`
      return result.rows.length > 0 ? result.rows[0] : undefined
    } catch (error) {
      console.error(`Error getting user by email ${email}:`, error)
      return undefined
    }
  }

  // Sales Team Analytics
  static async getSalesTeamStats(): Promise<{
    totalSalesStaff: number
    stockClerks: number
    salesManagers: number
    admins: number
    totalOutlets: number
    outletsWithSalesPerson: number
    outletsWithoutSalesPerson: number
  }> {
    try {
      await DatabaseService.ensureInitialized()

      try {
        // Get all users with sales roles
        const salesUsers = await sql`
        SELECT role FROM users 
        WHERE role IN ('stock_clerk', 'sales_manager', 'admin') 
        AND is_active = true
      `

        // Get outlet assignment stats
        const outletStats = await sql`
        SELECT 
          COUNT(*) as total_outlets,
          COUNT(sales_person) as outlets_with_sales_person
        FROM outlets
      `

        const roleCount = salesUsers.rows.reduce(
          (acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        const stats = outletStats.rows[0]

        return {
          totalSalesStaff: salesUsers.rows.length,
          stockClerks: roleCount.stock_clerk || 0,
          salesManagers: roleCount.sales_manager || 0,
          admins: roleCount.admin || 0,
          totalOutlets: Number.parseInt(stats.total_outlets),
          outletsWithSalesPerson: Number.parseInt(stats.outlets_with_sales_person),
          outletsWithoutSalesPerson:
            Number.parseInt(stats.total_outlets) - Number.parseInt(stats.outlets_with_sales_person),
        }
      } catch (error) {
        console.error("Error fetching sales team stats:", error)
        return {
          totalSalesStaff: 0,
          stockClerks: 0,
          salesManagers: 0,
          admins: 0,
          totalOutlets: 0,
          outletsWithSalesPerson: 0,
          outletsWithoutSalesPerson: 0,
        }
      }
    } catch (error) {
      console.error("Error in getSalesTeamStats:", error)
      return {
        totalSalesStaff: 0,
        stockClerks: 0,
        salesManagers: 0,
        admins: 0,
        totalOutlets: 0,
        outletsWithSalesPerson: 0,
        outletsWithoutSalesPerson: 0,
      }
    }
  }

  static async getSalesUsersWithOutletCounts(): Promise<any[]> {
    try {
      await DatabaseService.ensureInitialized()

      try {
        const result = await sql`
        SELECT 
          u.*,
          COUNT(o.id) as outlet_count,
          ARRAY_AGG(o.name) FILTER (WHERE o.name IS NOT NULL) as outlet_names
        FROM users u
        LEFT JOIN outlets o ON u.name = o.sales_person
        WHERE u.role IN ('stock_clerk', 'sales_manager', 'admin')
        GROUP BY u.id, u.email, u.name, u.role, u.is_active, u.last_login, u.created_at, u.updated_at
        ORDER BY u.name
      `

        return result.rows.map((user) => ({
          ...user,
          outlet_count: Number.parseInt(user.outlet_count) || 0,
          outlet_names: user.outlet_names || [],
        }))
      } catch (error) {
        console.error("Error fetching sales users with outlet counts:", error)
        return []
      }
    } catch (error) {
      console.error("Error in getSalesUsersWithOutletCounts:", error)
      return []
    }
  }
}

// Export a singleton instance for backward compatibility
class DatabaseServiceInstance {
  async getOutlets() {
    return DatabaseService.getOutlets()
  }

  async getOutlet(id: number) {
    return DatabaseService.getOutletById(id)
  }

  async createOutlet(data: Partial<Outlet>) {
    return DatabaseService.createOutlet(data)
  }

  async updateOutlet(id: number, data: Partial<Outlet>) {
    return DatabaseService.updateOutlet(id, data)
  }

  async getProducts() {
    return DatabaseService.getProducts()
  }

  async getProduct(id: number) {
    return DatabaseService.getProductById(id)
  }

  async updateProduct(id: number, data: Partial<Product>) {
    return DatabaseService.updateProduct(id, data)
  }

  async getCategories() {
    return DatabaseService.getCategories()
  }

  async createCategory(name: string) {
    return DatabaseService.createCategory(name)
  }

  async updateCategories(categories: string[]) {
    return DatabaseService.updateCategories(categories)
  }

  async deleteCategory(id: number) {
    return DatabaseService.deleteCategory(id)
  }

  async getRegions() {
    return DatabaseService.getRegions()
  }

  async createRegion(name: string) {
    return DatabaseService.createRegion(name)
  }

  async updateRegions(regions: string[]) {
    return DatabaseService.updateRegions(regions)
  }

  async getStockLevels(outletId: number) {
    return DatabaseService.getStockLevelsByOutlet(outletId)
  }

  async updateStockLevel(
    outletId: number,
    productId: number,
    quantity: number,
    expirationDate: string | null,
    updatedBy: string,
  ) {
    return DatabaseService.updateStockLevel(outletId, productId, quantity, expirationDate, updatedBy)
  }

  async updateStockLevelWithOrder(
    outletId: number,
    productId: number,
    quantity: number,
    orderQuantity: number,
    updatedBy: string,
  ) {
    return DatabaseService.updateStockLevelWithOrder(outletId, productId, quantity, orderQuantity, updatedBy)
  }

  async getProductMappings() {
    return DatabaseService.getProductMappings()
  }

  async getProductMappingsByOutlet(outletId: number) {
    return DatabaseService.getProductMappingsByOutlet(outletId)
  }

  async updateProductMapping(outletId: number, productId: number, isActive: boolean) {
    return DatabaseService.updateProductMapping(outletId, productId, isActive)
  }

  async addAuditTrail(
    entityType: string,
    entityId: number,
    action: string,
    details?: string,
    field?: string,
    oldValue?: string,
    newValue?: string,
    userId?: string,
    userEmail?: string,
    ipAddress?: string,
  ) {
    return DatabaseService.addAuditEntry({
      entity_type: entityType,
      entity_id: entityId,
      action,
      details: details || "",
      field: field || "",
      old_value: oldValue,
      new_value: newValue,
      user_id: userId || "",
      user_email: userEmail || "",
      ip_address: ipAddress || "",
    })
  }

  async getAuditTrail(entityType?: string, entityId?: number) {
    return DatabaseService.getAuditTrail(entityType, entityId)
  }

  async getUsers() {
    return DatabaseService.getUsers()
  }

  async getUserByEmail(email: string) {
    return DatabaseService.getUserByEmail(email)
  }

  async getSalesTeamStats() {
    return DatabaseService.getSalesTeamStats()
  }

  async getSalesUsersWithOutletCounts() {
    return DatabaseService.getSalesUsersWithOutletCounts()
  }

  async ensureInitialized() {
    return DatabaseService.ensureInitialized()
  }
}

// Export the singleton instance
export const dbService = new DatabaseServiceInstance()
