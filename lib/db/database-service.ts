import { sql } from "@vercel/postgres"

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
  availability: "In Stock" | "Low Stock" | "Out of Stock" | null
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
  // Outlets
  static async getOutlets(): Promise<Outlet[]> {
    const result = await sql<Outlet>`SELECT * FROM outlets ORDER BY name`
    return result.rows
  }

  static async getOutletById(id: number): Promise<Outlet | undefined> {
    const result = await sql<Outlet>`SELECT * FROM outlets WHERE id = ${id}`
    return result.rows.length > 0 ? result.rows[0] : undefined
  }

  static async updateOutlet(id: number, data: Partial<Outlet>): Promise<Outlet | null> {
    try {
      const result = await sql<Outlet>`
        UPDATE outlets 
        SET 
          name = COALESCE(${data.name || null}, name),
          pic_name = COALESCE(${data.pic_name || null}, pic_name),
          pic_contact = COALESCE(${data.pic_contact || null}, pic_contact),
          last_check_date = COALESCE(${data.last_check_date || null}, last_check_date),
          last_updated_by = COALESCE(${data.last_updated_by || null}, last_updated_by),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error("Error updating outlet:", error)
      throw error
    }
  }

  // Products
  static async getProducts(): Promise<Product[]> {
    const result = await sql<Product>`SELECT * FROM products ORDER BY name`
    return result.rows
  }

  static async getProductById(id: number): Promise<Product | undefined> {
    const result = await sql<Product>`SELECT * FROM products WHERE id = ${id}`
    return result.rows.length > 0 ? result.rows[0] : undefined
  }

  static async updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
    try {
      const result = await sql<Product>`
        UPDATE products 
        SET 
          name = COALESCE(${data.name || null}, name),
          supplier = COALESCE(${data.supplier || null}, supplier),
          expiration_date = COALESCE(${data.expiration_date || null}, expiration_date),
          availability = COALESCE(${data.availability || null}, availability),
          barcode = COALESCE(${data.barcode || null}, barcode),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
      return result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }

  // Stock Levels
  static async getStockLevelsByOutlet(outletId: number): Promise<any[]> {
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
  }

  static async getStockLevels(outletId: number): Promise<StockLevel[]> {
    // This will be implemented with actual database calls
    return []
  }

  static async updateStockLevelWithOrder(
    outletId: number,
    productId: number,
    quantity: number,
    orderQuantity: number,
    updatedBy: string,
  ): Promise<StockLevel | null> {
    try {
      // Check if the stock level exists
      const existingResult = await sql<StockLevel>`
        SELECT * FROM stock_levels 
        WHERE outlet_id = ${outletId} AND product_id = ${productId}
      `

      if (existingResult.rows.length > 0) {
        // Update existing stock level
        const result = await sql<StockLevel>`
          UPDATE stock_levels 
          SET quantity = ${quantity}, 
              order_quantity = ${orderQuantity},
              last_updated = CURRENT_TIMESTAMP, 
              updated_by = ${updatedBy}
          WHERE outlet_id = ${outletId} AND product_id = ${productId}
          RETURNING *
        `
        return result.rows[0]
      } else {
        // Insert new stock level
        const result = await sql<StockLevel>`
          INSERT INTO stock_levels (outlet_id, product_id, quantity, order_quantity, last_updated, updated_by)
          VALUES (${outletId}, ${productId}, ${quantity}, ${orderQuantity}, CURRENT_TIMESTAMP, ${updatedBy})
          RETURNING *
        `
        return result.rows[0]
      }
    } catch (error) {
      console.error("Error updating stock level:", error)
      throw error
    }
  }

  // Audit Trail
  static async addAuditEntry(entry: {
    entity_type: string
    entity_id: number
    action: string
    details: string
    field: string
    user_id: string
    user_email: string
    ip_address: string
  }): Promise<AuditTrail | null> {
    try {
      const result = await sql<AuditTrail>`
        INSERT INTO audit_trail (
          entity_type, entity_id, action, details, field, 
          user_id, user_email, ip_address, timestamp
        )
        VALUES (
          ${entry.entity_type}, ${entry.entity_id}, ${entry.action}, 
          ${entry.details}, ${entry.field}, 
          ${entry.user_id}, ${entry.user_email}, ${entry.ip_address},
          CURRENT_TIMESTAMP
        )
        RETURNING *
      `
      return result.rows[0]
    } catch (error) {
      console.error("Error adding audit entry:", error)
      return null
    }
  }

  static async getAuditTrail(entityType?: string, entityId?: number): Promise<AuditTrail[]> {
    try {
      if (entityType && entityId) {
        const result = await sql<AuditTrail>`
          SELECT * FROM audit_trail 
          WHERE entity_type = ${entityType} AND entity_id = ${entityId} 
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
  }
}

export default DatabaseService
