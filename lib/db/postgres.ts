import { sql } from "@vercel/postgres"

export async function ensureDatabaseInitialized(): Promise<void> {
  try {
    console.log("Initializing database...")

    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

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
        barcode VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS stock_levels (
        id SERIAL PRIMARY KEY,
        outlet_id INTEGER REFERENCES outlets(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER DEFAULT 0,
        order_quantity INTEGER DEFAULT 0,
        expiration_date DATE,
        last_updated TIMESTAMP,
        updated_by VARCHAR(255),
        UNIQUE(outlet_id, product_id)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS product_mappings (
        id SERIAL PRIMARY KEY,
        outlet_id INTEGER REFERENCES outlets(id),
        product_id INTEGER REFERENCES products(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(outlet_id, product_id)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS audit_trail (
        id SERIAL PRIMARY KEY,
        entity_type VARCHAR(100) NOT NULL,
        entity_id INTEGER NOT NULL,
        action VARCHAR(100) NOT NULL,
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

    // Only insert default categories and regions if they don't exist
    const categoriesCount = await sql`SELECT COUNT(*) FROM categories`
    if (categoriesCount.rows[0].count === "0") {
      await sql`
        INSERT INTO categories (name) VALUES 
        ('Standard'),
        ('Premium')
        ON CONFLICT (name) DO NOTHING
      `
      console.log("Inserted default categories")
    }

    const regionsCount = await sql`SELECT COUNT(*) FROM regions`
    if (regionsCount.rows[0].count === "0") {
      await sql`
        INSERT INTO regions (name) VALUES 
        ('North'),
        ('South'),
        ('East'),
        ('West'),
        ('Central')
        ON CONFLICT (name) DO NOTHING
      `
      console.log("Inserted default regions")
    }

    console.log("Database initialization completed successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}
