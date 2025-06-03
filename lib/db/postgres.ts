import { sql } from "@vercel/postgres"

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT NOW()`
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// Initialize database schema
export async function initializeDatabase(): Promise<void> {
  try {
    // Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create regions table
    await sql`
      CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create outlets table
    await sql`
      CREATE TABLE IF NOT EXISTS outlets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        region_id INTEGER REFERENCES regions(id),
        sales_person VARCHAR(255),
        last_check_date DATE,
        last_order_date DATE,
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(255),
        store_name VARCHAR(255),
        pic_name VARCHAR(255),
        pic_contact VARCHAR(50),
        last_updated_by VARCHAR(255),
        last_updated_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        supplier VARCHAR(255),
        expiration_date DATE,
        availability VARCHAR(50) DEFAULT 'In Stock',
        low_threshold INTEGER DEFAULT 10,
        critical_threshold INTEGER DEFAULT 5,
        last_updated TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create stock_levels table with expiration_date column
    await sql`
      CREATE TABLE IF NOT EXISTS stock_levels (
        id SERIAL PRIMARY KEY,
        outlet_id INTEGER REFERENCES outlets(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 0,
        expiration_date DATE,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(255),
        UNIQUE(outlet_id, product_id)
      )
    `

    // Add expiration_date column if it doesn't exist (for existing databases)
    try {
      await sql`
        ALTER TABLE stock_levels 
        ADD COLUMN IF NOT EXISTS expiration_date DATE
      `
      console.log("Added expiration_date column to stock_levels table")
    } catch (error) {
      console.log("expiration_date column already exists or error adding it:", error)
    }

    // Create product_mappings table
    await sql`
      CREATE TABLE IF NOT EXISTS product_mappings (
        id SERIAL PRIMARY KEY,
        outlet_id INTEGER REFERENCES outlets(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(outlet_id, product_id)
      )
    `

    // Create audit_trail table
    await sql`
      CREATE TABLE IF NOT EXISTS audit_trail (
        id SERIAL PRIMARY KEY,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INTEGER NOT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        field VARCHAR(100),
        old_value TEXT,
        new_value TEXT,
        user_id VARCHAR(255),
        user_email VARCHAR(255),
        ip_address VARCHAR(45),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Insert default categories if they don't exist
    await sql`
      INSERT INTO categories (name) 
      VALUES ('Premium'), ('Standard'), ('Budget'), ('VIP')
      ON CONFLICT (name) DO NOTHING
    `

    // Insert default regions if they don't exist
    await sql`
      INSERT INTO regions (name) 
      VALUES ('Downtown'), ('Uptown'), ('Midtown'), ('Westside'), ('Eastside')
      ON CONFLICT (name) DO NOTHING
    `

    // Insert sample products if they don't exist
    const existingProducts = await sql`SELECT COUNT(*) as count FROM products`
    if (existingProducts.rows[0].count === "0") {
      await sql`
        INSERT INTO products (name, supplier, low_threshold, critical_threshold) VALUES
        ('Fairprice Potato Chips', 'Fairprice', 20, 5),
        ('Reese Nutrageous', 'Hershey', 15, 3),
        ('Reese Pieces', 'Hershey', 25, 8)
      `
    }

    // Insert sample outlets if they don't exist
    const existingOutlets = await sql`SELECT COUNT(*) as count FROM outlets`
    if (existingOutlets.rows[0].count === "0") {
      await sql`
        INSERT INTO outlets (name, category_id, region_id, address, phone, email) VALUES
        ('Main Street Store', 1, 1, '123 Main St, Downtown', '+1 (555) 123-4567', 'mainstore@example.com'),
        ('Mall Location', 2, 2, '456 Mall Ave, Uptown', '+1 (555) 234-5678', 'mall@example.com'),
        ('Express Shop', 3, 3, '789 Quick St, Midtown', '+1 (555) 345-6789', 'express@example.com')
      `
    }

    console.log("Database schema initialized successfully")
  } catch (error) {
    console.error("Error initializing database schema:", error)
    throw error
  }
}

// Insert sample data
export async function insertSampleData(): Promise<void> {
  try {
    // Check if data already exists
    const existingData = await sql`SELECT COUNT(*) FROM categories`
    if (Number.parseInt(existingData.rows[0].count) > 0) {
      console.log("Sample data already exists, skipping insertion")
      return
    }

    // Insert categories
    const categoryResult = await sql`
      INSERT INTO categories (name) VALUES 
      ('Premium'), ('Standard'), ('Budget'), ('VIP')
      RETURNING id, name
    `
    const categories = categoryResult.rows

    // Insert regions
    const regionResult = await sql`
      INSERT INTO regions (name) VALUES 
      ('Downtown'), ('Uptown'), ('Midtown'), ('Westside'), ('Eastside')
      RETURNING id, name
    `
    const regions = regionResult.rows

    // Insert products
    const productResult = await sql`
      INSERT INTO products (name, supplier, expiration_date, availability, low_threshold, critical_threshold, last_updated) VALUES 
      ('Fairprice Potato Chips', 'Fairprice', '2024-08-15', 'In Stock', 30, 10, '2023-06-01'),
      ('Reese Nutrageous', 'Hershey''s', '2024-12-31', 'Low Stock', 25, 8, '2023-05-28'),
      ('Reese Pieces', 'Hershey''s', '2024-10-20', 'Out of Stock', 20, 5, '2023-05-25')
      RETURNING id, name
    `
    const products = productResult.rows

    // Find category and region IDs
    const premiumCategoryId = categories.find((c) => c.name === "Premium")?.id
    const standardCategoryId = categories.find((c) => c.name === "Standard")?.id
    const downtownRegionId = regions.find((r) => r.name === "Downtown")?.id
    const uptownRegionId = regions.find((r) => r.name === "Uptown")?.id
    const midtownRegionId = regions.find((r) => r.name === "Midtown")?.id
    const westsideRegionId = regions.find((r) => r.name === "Westside")?.id
    const eastsideRegionId = regions.find((r) => r.name === "Eastside")?.id

    // Insert outlets
    const outletResult = await sql`
      INSERT INTO outlets (
        name, category_id, region_id, sales_person, last_check_date, 
        last_order_date, address, phone, email, store_name, 
        pic_name, pic_contact, last_updated_by, last_updated_at
      ) VALUES 
      ('Cinema City Central', ${premiumCategoryId}, ${downtownRegionId}, 'John Smith', '2023-06-01', '2023-05-25', '123 Main Street, Downtown', '+1 (555) 123-4567', 'manager@cinemacentral.com', 'Central Plaza Store', 'Alice Johnson', '+1 (555) 123-4568', 'John Smith', '2023-06-01T10:30:00Z'),
      ('Starlight Cinemas', ${standardCategoryId}, ${uptownRegionId}, 'Emily Johnson', '2023-05-28', '2023-05-20', '456 Cinema Boulevard, Uptown', '+1 (555) 234-5678', 'info@starlightcinemas.com', 'Starlight Mall Store', 'Bob Wilson', '+1 (555) 234-5679', 'Emily Johnson', '2023-05-28T14:15:00Z'),
      ('Golden Screen Theatres', ${premiumCategoryId}, ${midtownRegionId}, 'Michael Brown', '2023-05-30', '2023-05-22', '789 Theater Lane, Midtown', '+1 (555) 345-6789', 'contact@goldenscreen.com', '', 'Carol Davis', '+1 (555) 345-6790', 'Michael Brown', '2023-05-30T09:45:00Z'),
      ('Silver Screen Cinema', ${standardCategoryId}, ${westsideRegionId}, 'Sarah Davis', '2023-05-29', '2023-05-24', '321 Movie Street, Westside', '+1 (555) 456-7890', 'manager@silverscreen.com', '', 'David Wilson', '+1 (555) 456-7891', 'Sarah Davis', '2023-05-29T16:20:00Z'),
      ('Premiere Cineplex', ${premiumCategoryId}, ${eastsideRegionId}, 'David Wilson', '2023-05-27', '2023-05-18', '654 Entertainment Ave, Eastside', '+1 (555) 567-8901', 'info@premierecineplex.com', '', 'Eva Martinez', '+1 (555) 567-8902', 'David Wilson', '2023-05-27T11:10:00Z')
      RETURNING id, name
    `
    const outlets = outletResult.rows

    // Insert product mappings
    // Cinema City Central - all products
    await sql`INSERT INTO product_mappings (outlet_id, product_id, is_active) VALUES (${outlets[0].id}, ${products[0].id}, true)`
    await sql`INSERT INTO product_mappings (outlet_id, product_id, is_active) VALUES (${outlets[0].id}, ${products[1].id}, true)`
    await sql`INSERT INTO product_mappings (outlet_id, product_id, is_active) VALUES (${outlets[0].id}, ${products[2].id}, true)`

    // Starlight Cinemas - no Reese Pieces
    await sql`INSERT INTO product_mappings (outlet_id, product_id, is_active) VALUES (${outlets[1].id}, ${products[0].id}, true)`
    await sql`INSERT INTO product_mappings (outlet_id, product_id, is_active) VALUES (${outlets[1].id}, ${products[1].id}, true)`

    // Golden Screen - all products
    await sql`INSERT INTO product_mappings (outlet_id, product_id, is_active) VALUES (${outlets[2].id}, ${products[0].id}, true)`
    await sql`INSERT INTO product_mappings (outlet_id, product_id, is_active) VALUES (${outlets[2].id}, ${products[1].id}, true)`
    await sql`INSERT INTO product_mappings (outlet_id, product_id, is_active) VALUES (${outlets[2].id}, ${products[2].id}, true)`

    // Silver Screen - no Reese Nutrageous
    await sql`INSERT INTO product_mappings (outlet_id, product_id, is_active) VALUES (${outlets[3].id}, ${products[0].id}, true)`
    await sql`INSERT INTO product_mappings (outlet_id, product_id, is_active) VALUES (${outlets[3].id}, ${products[2].id}, true)`

    // Premiere Cineplex - no Fairprice Chips
    await sql`INSERT INTO product_mappings (outlet_id, product_id, is_active) VALUES (${outlets[4].id}, ${products[1].id}, true)`
    await sql`INSERT INTO product_mappings (outlet_id, product_id, is_active) VALUES (${outlets[4].id}, ${products[2].id}, true)`

    // Insert stock levels
    // Cinema City Central stock
    await sql`INSERT INTO stock_levels (outlet_id, product_id, quantity, last_updated, updated_by) VALUES (${outlets[0].id}, ${products[0].id}, 150, '2023-06-01', 'John Smith')`
    await sql`INSERT INTO stock_levels (outlet_id, product_id, quantity, last_updated, updated_by) VALUES (${outlets[0].id}, ${products[1].id}, 75, '2023-06-01', 'John Smith')`
    await sql`INSERT INTO stock_levels (outlet_id, product_id, quantity, last_updated, updated_by) VALUES (${outlets[0].id}, ${products[2].id}, 25, '2023-06-01', 'John Smith')`

    // Starlight Cinemas stock
    await sql`INSERT INTO stock_levels (outlet_id, product_id, quantity, last_updated, updated_by) VALUES (${outlets[1].id}, ${products[0].id}, 80, '2023-05-28', 'Emily Johnson')`
    await sql`INSERT INTO stock_levels (outlet_id, product_id, quantity, last_updated, updated_by) VALUES (${outlets[1].id}, ${products[1].id}, 30, '2023-05-28', 'Emily Johnson')`

    // Golden Screen stock
    await sql`INSERT INTO stock_levels (outlet_id, product_id, quantity, last_updated, updated_by) VALUES (${outlets[2].id}, ${products[0].id}, 35, '2023-05-30', 'Michael Brown')`
    await sql`INSERT INTO stock_levels (outlet_id, product_id, quantity, last_updated, updated_by) VALUES (${outlets[2].id}, ${products[1].id}, 120, '2023-05-30', 'Michael Brown')`
    await sql`INSERT INTO stock_levels (outlet_id, product_id, quantity, last_updated, updated_by) VALUES (${outlets[2].id}, ${products[2].id}, 110, '2023-05-30', 'Michael Brown')`

    // Silver Screen stock
    await sql`INSERT INTO stock_levels (outlet_id, product_id, quantity, last_updated, updated_by) VALUES (${outlets[3].id}, ${products[0].id}, 65, '2023-05-29', 'Sarah Davis')`
    await sql`INSERT INTO stock_levels (outlet_id, product_id, quantity, last_updated, updated_by) VALUES (${outlets[3].id}, ${products[2].id}, 55, '2023-05-29', 'Sarah Davis')`

    // Premiere Cineplex stock
    await sql`INSERT INTO stock_levels (outlet_id, product_id, quantity, last_updated, updated_by) VALUES (${outlets[4].id}, ${products[1].id}, 20, '2023-05-27', 'David Wilson')`
    await sql`INSERT INTO stock_levels (outlet_id, product_id, quantity, last_updated, updated_by) VALUES (${outlets[4].id}, ${products[2].id}, 15, '2023-05-27', 'David Wilson')`

    // Insert sample users
    await sql`
      INSERT INTO users (email, name, role, is_active) VALUES 
      ('admin@example.com', 'Admin User', 'Admin', true),
      ('manager@example.com', 'Manager User', 'Manager', true),
      ('staff@example.com', 'Staff User', 'Stock Clerk', true),
      ('viewer@example.com', 'Viewer User', 'Viewer', true)
    `

    // Insert sample audit trail entries
    await sql`
      INSERT INTO audit_trail (
        entity_type, entity_id, action, details, field, 
        user_id, user_email, ip_address, timestamp
      ) VALUES 
      ('outlet', ${outlets[0].id}, 'Updated stock quantities', 'Fairprice Chips: 120 → 150, Reese Pieces: 30 → 25', 'stock_quantities', '1', 'john@example.com', '192.168.1.100', '2023-06-01T10:30:00Z'),
      ('outlet', ${outlets[1].id}, 'Updated sales person', 'Changed from ''Mike Wilson'' to ''Emily Johnson''', 'sales_person', '2', 'emily@example.com', '192.168.1.101', '2023-05-28T14:15:00Z')
    `

    console.log("Sample data inserted successfully")
  } catch (error) {
    console.error("Error inserting sample data:", error)
    throw error
  }
}

// Check if database is initialized
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'outlets'
    `
    return result.rows.length > 0
  } catch (error) {
    console.error("Error checking database initialization:", error)
    return false
  }
}

// Ensure database is initialized
export async function ensureDatabaseInitialized(): Promise<void> {
  try {
    const isInitialized = await isDatabaseInitialized()
    if (!isInitialized) {
      console.log("Initializing database...")
      await initializeDatabase()
      await insertSampleData()
    }
  } catch (error) {
    console.error("Error ensuring database initialization:", error)
    throw error
  }
}
