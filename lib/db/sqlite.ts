import Database from "better-sqlite3"
import fs from "fs"
import path from "path"

// Define the database path
const DB_PATH = path.join(process.cwd(), "data")
const DB_FILE = path.join(DB_PATH, "cinema-stock.db")

// Ensure the data directory exists
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true })
}

// Initialize the database connection
export function getDb() {
  const db = new Database(DB_FILE)

  // Enable foreign keys
  db.pragma("foreign_keys = ON")

  return db
}

// Check if the database needs initialization
export function isDatabaseInitialized(): boolean {
  try {
    const db = getDb()

    // Check if the outlets table exists
    const result = db
      .prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='outlets'
    `)
      .get()

    return !!result
  } catch (error) {
    console.error("Error checking database initialization:", error)
    return false
  }
}

// Initialize the database schema
export function initializeDatabase() {
  const db = getDb()

  // Create tables in a transaction
  db.transaction(() => {
    // Categories table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run()

    // Regions table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS regions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run()

    // Outlets table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS outlets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category_id INTEGER,
        region_id INTEGER,
        sales_person TEXT,
        last_check_date TEXT,
        last_order_date TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        store_name TEXT,
        pic_name TEXT,
        pic_contact TEXT,
        last_updated_by TEXT,
        last_updated_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (region_id) REFERENCES regions(id)
      )
    `).run()

    // Products table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        supplier TEXT,
        expiration_date TEXT,
        availability TEXT CHECK(availability IN ('In Stock', 'Low Stock', 'Out of Stock')),
        low_threshold INTEGER DEFAULT 30,
        critical_threshold INTEGER DEFAULT 10,
        last_updated TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run()

    // Stock levels table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS stock_levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        outlet_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        last_updated TEXT,
        updated_by TEXT,
        FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE(outlet_id, product_id)
      )
    `).run()

    // Product mappings table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS product_mappings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        outlet_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE(outlet_id, product_id)
      )
    `).run()

    // Audit trail table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS audit_trail (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        field TEXT,
        old_value TEXT,
        new_value TEXT,
        user_id TEXT,
        user_email TEXT,
        ip_address TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run()

    // Users table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        role TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        last_login TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run()

    // Create indexes for better performance
    db.prepare("CREATE INDEX IF NOT EXISTS idx_outlets_category ON outlets(category_id)").run()
    db.prepare("CREATE INDEX IF NOT EXISTS idx_outlets_region ON outlets(region_id)").run()
    db.prepare("CREATE INDEX IF NOT EXISTS idx_stock_levels_outlet ON stock_levels(outlet_id)").run()
    db.prepare("CREATE INDEX IF NOT EXISTS idx_stock_levels_product ON stock_levels(product_id)").run()
    db.prepare("CREATE INDEX IF NOT EXISTS idx_product_mappings_outlet ON product_mappings(outlet_id)").run()
    db.prepare("CREATE INDEX IF NOT EXISTS idx_product_mappings_product ON product_mappings(product_id)").run()
    db.prepare("CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail(entity_type, entity_id)").run()
  })()

  console.log("Database schema initialized successfully")
}

// Insert sample data
export function insertSampleData() {
  const db = getDb()

  db.transaction(() => {
    // Insert sample categories
    const categoryIds = {
      Premium: db.prepare("INSERT INTO categories (name) VALUES (?)").run("Premium").lastInsertRowid,
      Standard: db.prepare("INSERT INTO categories (name) VALUES (?)").run("Standard").lastInsertRowid,
      Budget: db.prepare("INSERT INTO categories (name) VALUES (?)").run("Budget").lastInsertRowid,
      VIP: db.prepare("INSERT INTO categories (name) VALUES (?)").run("VIP").lastInsertRowid,
    }

    // Insert sample regions
    const regionIds = {
      Downtown: db.prepare("INSERT INTO regions (name) VALUES (?)").run("Downtown").lastInsertRowid,
      Uptown: db.prepare("INSERT INTO regions (name) VALUES (?)").run("Uptown").lastInsertRowid,
      Midtown: db.prepare("INSERT INTO regions (name) VALUES (?)").run("Midtown").lastInsertRowid,
      Westside: db.prepare("INSERT INTO regions (name) VALUES (?)").run("Westside").lastInsertRowid,
      Eastside: db.prepare("INSERT INTO regions (name) VALUES (?)").run("Eastside").lastInsertRowid,
    }

    // Insert sample products
    const insertProduct = db.prepare(`
      INSERT INTO products (
        name, supplier, expiration_date, availability, 
        low_threshold, critical_threshold, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    const productIds = {
      FairpriceChips: insertProduct.run(
        "Fairprice Potato Chips",
        "Fairprice",
        "2024-08-15",
        "In Stock",
        30,
        10,
        "2023-06-01",
      ).lastInsertRowid,
      ReeseNutrageous: insertProduct.run(
        "Reese Nutrageous",
        "Hershey's",
        "2024-12-31",
        "Low Stock",
        25,
        8,
        "2023-05-28",
      ).lastInsertRowid,
      ReesePieces: insertProduct.run("Reese Pieces", "Hershey's", "2024-10-20", "Out of Stock", 20, 5, "2023-05-25")
        .lastInsertRowid,
    }

    // Insert sample outlets
    const insertOutlet = db.prepare(`
      INSERT INTO outlets (
        name, category_id, region_id, sales_person, last_check_date, 
        last_order_date, address, phone, email, store_name, 
        pic_name, pic_contact, last_updated_by, last_updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const outletIds = {
      CinemaCityCentral: insertOutlet.run(
        "Cinema City Central",
        categoryIds.Premium,
        regionIds.Downtown,
        "John Smith",
        "2023-06-01",
        "2023-05-25",
        "123 Main Street, Downtown",
        "+1 (555) 123-4567",
        "manager@cinemacentral.com",
        "Central Plaza Store",
        "Alice Johnson",
        "+1 (555) 123-4568",
        "John Smith",
        "2023-06-01T10:30:00Z",
      ).lastInsertRowid,
      StarlightCinemas: insertOutlet.run(
        "Starlight Cinemas",
        categoryIds.Standard,
        regionIds.Uptown,
        "Emily Johnson",
        "2023-05-28",
        "2023-05-20",
        "456 Cinema Boulevard, Uptown",
        "+1 (555) 234-5678",
        "info@starlightcinemas.com",
        "Starlight Mall Store",
        "Bob Wilson",
        "+1 (555) 234-5679",
        "Emily Johnson",
        "2023-05-28T14:15:00Z",
      ).lastInsertRowid,
      GoldenScreen: insertOutlet.run(
        "Golden Screen Theatres",
        categoryIds.Premium,
        regionIds.Midtown,
        "Michael Brown",
        "2023-05-30",
        "2023-05-22",
        "789 Theater Lane, Midtown",
        "+1 (555) 345-6789",
        "contact@goldenscreen.com",
        "",
        "Carol Davis",
        "+1 (555) 345-6790",
        "Michael Brown",
        "2023-05-30T09:45:00Z",
      ).lastInsertRowid,
      SilverScreen: insertOutlet.run(
        "Silver Screen Cinema",
        categoryIds.Standard,
        regionIds.Westside,
        "Sarah Davis",
        "2023-05-29",
        "2023-05-24",
        "321 Movie Street, Westside",
        "+1 (555) 456-7890",
        "manager@silverscreen.com",
        "",
        "David Wilson",
        "+1 (555) 456-7891",
        "Sarah Davis",
        "2023-05-29T16:20:00Z",
      ).lastInsertRowid,
      PremiereCineplex: insertOutlet.run(
        "Premiere Cineplex",
        categoryIds.Premium,
        regionIds.Eastside,
        "David Wilson",
        "2023-05-27",
        "2023-05-18",
        "654 Entertainment Ave, Eastside",
        "+1 (555) 567-8901",
        "info@premierecineplex.com",
        "",
        "Eva Martinez",
        "+1 (555) 567-8902",
        "David Wilson",
        "2023-05-27T11:10:00Z",
      ).lastInsertRowid,
    }

    // Insert product mappings
    const insertMapping = db.prepare(`
      INSERT INTO product_mappings (outlet_id, product_id, is_active)
      VALUES (?, ?, ?)
    `)

    // Cinema City Central - all products
    insertMapping.run(outletIds.CinemaCityCentral, productIds.FairpriceChips, 1)
    insertMapping.run(outletIds.CinemaCityCentral, productIds.ReeseNutrageous, 1)
    insertMapping.run(outletIds.CinemaCityCentral, productIds.ReesePieces, 1)

    // Starlight Cinemas - no Reese Pieces
    insertMapping.run(outletIds.StarlightCinemas, productIds.FairpriceChips, 1)
    insertMapping.run(outletIds.StarlightCinemas, productIds.ReeseNutrageous, 1)

    // Golden Screen - all products
    insertMapping.run(outletIds.GoldenScreen, productIds.FairpriceChips, 1)
    insertMapping.run(outletIds.GoldenScreen, productIds.ReeseNutrageous, 1)
    insertMapping.run(outletIds.GoldenScreen, productIds.ReesePieces, 1)

    // Silver Screen - no Reese Nutrageous
    insertMapping.run(outletIds.SilverScreen, productIds.FairpriceChips, 1)
    insertMapping.run(outletIds.SilverScreen, productIds.ReesePieces, 1)

    // Premiere Cineplex - no Fairprice Chips
    insertMapping.run(outletIds.PremiereCineplex, productIds.ReeseNutrageous, 1)
    insertMapping.run(outletIds.PremiereCineplex, productIds.ReesePieces, 1)

    // Insert stock levels
    const insertStockLevel = db.prepare(`
      INSERT INTO stock_levels (outlet_id, product_id, quantity, last_updated, updated_by)
      VALUES (?, ?, ?, ?, ?)
    `)

    // Cinema City Central stock
    insertStockLevel.run(outletIds.CinemaCityCentral, productIds.FairpriceChips, 150, "2023-06-01", "John Smith")
    insertStockLevel.run(outletIds.CinemaCityCentral, productIds.ReeseNutrageous, 75, "2023-06-01", "John Smith")
    insertStockLevel.run(outletIds.CinemaCityCentral, productIds.ReesePieces, 25, "2023-06-01", "John Smith")

    // Starlight Cinemas stock
    insertStockLevel.run(outletIds.StarlightCinemas, productIds.FairpriceChips, 80, "2023-05-28", "Emily Johnson")
    insertStockLevel.run(outletIds.StarlightCinemas, productIds.ReeseNutrageous, 30, "2023-05-28", "Emily Johnson")

    // Golden Screen stock
    insertStockLevel.run(outletIds.GoldenScreen, productIds.FairpriceChips, 35, "2023-05-30", "Michael Brown")
    insertStockLevel.run(outletIds.GoldenScreen, productIds.ReeseNutrageous, 120, "2023-05-30", "Michael Brown")
    insertStockLevel.run(outletIds.GoldenScreen, productIds.ReesePieces, 110, "2023-05-30", "Michael Brown")

    // Silver Screen stock
    insertStockLevel.run(outletIds.SilverScreen, productIds.FairpriceChips, 65, "2023-05-29", "Sarah Davis")
    insertStockLevel.run(outletIds.SilverScreen, productIds.ReesePieces, 55, "2023-05-29", "Sarah Davis")

    // Premiere Cineplex stock
    insertStockLevel.run(outletIds.PremiereCineplex, productIds.ReeseNutrageous, 20, "2023-05-27", "David Wilson")
    insertStockLevel.run(outletIds.PremiereCineplex, productIds.ReesePieces, 15, "2023-05-27", "David Wilson")

    // Insert sample users
    const insertUser = db.prepare(`
      INSERT INTO users (email, name, role, is_active)
      VALUES (?, ?, ?, ?)
    `)

    insertUser.run("admin@example.com", "Admin User", "Admin", 1)
    insertUser.run("manager@example.com", "Manager User", "Manager", 1)
    insertUser.run("staff@example.com", "Staff User", "Stock Clerk", 1)
    insertUser.run("viewer@example.com", "Viewer User", "Viewer", 1)

    // Insert sample audit trail entries
    const insertAudit = db.prepare(`
      INSERT INTO audit_trail (
        entity_type, entity_id, action, details, field, 
        user_id, user_email, ip_address, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    insertAudit.run(
      "outlet",
      outletIds.CinemaCityCentral,
      "Updated stock quantities",
      "Fairprice Chips: 120 → 150, Reese Pieces: 30 → 25",
      "stock_quantities",
      "1",
      "john@example.com",
      "192.168.1.100",
      "2023-06-01T10:30:00Z",
    )

    insertAudit.run(
      "outlet",
      outletIds.StarlightCinemas,
      "Updated sales person",
      "Changed from 'Mike Wilson' to 'Emily Johnson'",
      "sales_person",
      "2",
      "emily@example.com",
      "192.168.1.101",
      "2023-05-28T14:15:00Z",
    )
  })()

  console.log("Sample data inserted successfully")
}

// Initialize the database if needed
export function ensureDatabaseInitialized() {
  if (!isDatabaseInitialized()) {
    initializeDatabase()
    insertSampleData()
    return true
  }
  return false
}

// Get the database file path
export function getDatabaseFilePath(): string {
  return DB_FILE
}
