// In-memory database for serverless environments
export interface Outlet {
  id: number
  name: string
  category: string
  category_id: number
  region: string
  region_id: number
  sales_person: string
  last_check_date: string
  last_order_date: string
  address: string
  phone: string
  email: string
  store_name?: string
  pic_name?: string
  pic_contact?: string
  last_updated_by?: string
  last_updated_at?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  name: string
  supplier: string
  expiration_date: string
  availability: "In Stock" | "Low Stock" | "Out of Stock"
  low_threshold: number
  critical_threshold: number
  last_updated: string
  created_at: string
  updated_at: string
}

export interface StockLevel {
  id: number
  outlet_id: number
  product_id: number
  quantity: number
  last_updated: string
  updated_by: string
}

export interface ProductMapping {
  id: number
  outlet_id: number
  product_id: number
  is_active: boolean
  created_at: string
  updated_at: string
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

export interface AuditTrail {
  id: number
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
  timestamp: string
}

// In-memory data store
class MemoryDatabase {
  private static instance: MemoryDatabase
  private outlets: Outlet[] = []
  private products: Product[] = []
  private stockLevels: StockLevel[] = []
  private productMappings: ProductMapping[] = []
  private categories: Category[] = []
  private regions: Region[] = []
  private auditTrail: AuditTrail[] = []
  private initialized = false

  private constructor() {
    this.initializeData()
  }

  static getInstance(): MemoryDatabase {
    if (!MemoryDatabase.instance) {
      MemoryDatabase.instance = new MemoryDatabase()
    }
    return MemoryDatabase.instance
  }

  private initializeData() {
    if (this.initialized) return

    // Initialize categories
    this.categories = [
      { id: 1, name: "Premium", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
      { id: 2, name: "Standard", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
      { id: 3, name: "Budget", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
      { id: 4, name: "VIP", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
    ]

    // Initialize regions
    this.regions = [
      { id: 1, name: "Downtown", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
      { id: 2, name: "Uptown", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
      { id: 3, name: "Midtown", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
      { id: 4, name: "Westside", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
      { id: 5, name: "Eastside", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
    ]

    // Initialize products
    this.products = [
      {
        id: 1,
        name: "Fairprice Potato Chips",
        supplier: "Fairprice",
        expiration_date: "2024-08-15",
        availability: "In Stock",
        low_threshold: 30,
        critical_threshold: 10,
        last_updated: "2023-06-01",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-06-01T00:00:00Z",
      },
      {
        id: 2,
        name: "Reese Nutrageous",
        supplier: "Hershey's",
        expiration_date: "2024-12-31",
        availability: "Low Stock",
        low_threshold: 25,
        critical_threshold: 8,
        last_updated: "2023-05-28",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-05-28T00:00:00Z",
      },
      {
        id: 3,
        name: "Reese Pieces",
        supplier: "Hershey's",
        expiration_date: "2024-10-20",
        availability: "Out of Stock",
        low_threshold: 20,
        critical_threshold: 5,
        last_updated: "2023-05-25",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-05-25T00:00:00Z",
      },
    ]

    // Initialize outlets
    this.outlets = [
      {
        id: 1,
        name: "Cinema City Central",
        category: "Premium",
        category_id: 1,
        region: "Downtown",
        region_id: 1,
        sales_person: "John Smith",
        last_check_date: "2023-06-01",
        last_order_date: "2023-05-25",
        address: "123 Main Street, Downtown",
        phone: "+1 (555) 123-4567",
        email: "manager@cinemacentral.com",
        store_name: "Central Plaza Store",
        pic_name: "Alice Johnson",
        pic_contact: "+1 (555) 123-4568",
        last_updated_by: "John Smith",
        last_updated_at: "2023-06-01T10:30:00Z",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-06-01T10:30:00Z",
      },
      {
        id: 2,
        name: "Starlight Cinemas",
        category: "Standard",
        category_id: 2,
        region: "Uptown",
        region_id: 2,
        sales_person: "Emily Johnson",
        last_check_date: "2023-05-28",
        last_order_date: "2023-05-20",
        address: "456 Cinema Boulevard, Uptown",
        phone: "+1 (555) 234-5678",
        email: "info@starlightcinemas.com",
        store_name: "Starlight Mall Store",
        pic_name: "Bob Wilson",
        pic_contact: "+1 (555) 234-5679",
        last_updated_by: "Emily Johnson",
        last_updated_at: "2023-05-28T14:15:00Z",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-05-28T14:15:00Z",
      },
      {
        id: 3,
        name: "Golden Screen Theatres",
        category: "Premium",
        category_id: 1,
        region: "Midtown",
        region_id: 3,
        sales_person: "Michael Brown",
        last_check_date: "2023-05-30",
        last_order_date: "2023-05-22",
        address: "789 Theater Lane, Midtown",
        phone: "+1 (555) 345-6789",
        email: "contact@goldenscreen.com",
        store_name: "",
        pic_name: "Carol Davis",
        pic_contact: "+1 (555) 345-6790",
        last_updated_by: "Michael Brown",
        last_updated_at: "2023-05-30T09:45:00Z",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-05-30T09:45:00Z",
      },
      {
        id: 4,
        name: "Silver Screen Cinema",
        category: "Standard",
        category_id: 2,
        region: "Westside",
        region_id: 4,
        sales_person: "Sarah Davis",
        last_check_date: "2023-05-29",
        last_order_date: "2023-05-24",
        address: "321 Movie Street, Westside",
        phone: "+1 (555) 456-7890",
        email: "manager@silverscreen.com",
        store_name: "",
        pic_name: "David Wilson",
        pic_contact: "+1 (555) 456-7891",
        last_updated_by: "Sarah Davis",
        last_updated_at: "2023-05-29T16:20:00Z",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-05-29T16:20:00Z",
      },
      {
        id: 5,
        name: "Premiere Cineplex",
        category: "Premium",
        category_id: 1,
        region: "Eastside",
        region_id: 5,
        sales_person: "David Wilson",
        last_check_date: "2023-05-27",
        last_order_date: "2023-05-18",
        address: "654 Entertainment Ave, Eastside",
        phone: "+1 (555) 567-8901",
        email: "info@premierecineplex.com",
        store_name: "",
        pic_name: "Eva Martinez",
        pic_contact: "+1 (555) 567-8902",
        last_updated_by: "David Wilson",
        last_updated_at: "2023-05-27T11:10:00Z",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-05-27T11:10:00Z",
      },
    ]

    // Initialize product mappings
    this.productMappings = [
      // Cinema City Central - all products
      {
        id: 1,
        outlet_id: 1,
        product_id: 1,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: 2,
        outlet_id: 1,
        product_id: 2,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: 3,
        outlet_id: 1,
        product_id: 3,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      // Starlight Cinemas - no Reese Pieces
      {
        id: 4,
        outlet_id: 2,
        product_id: 1,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: 5,
        outlet_id: 2,
        product_id: 2,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      // Golden Screen - all products
      {
        id: 6,
        outlet_id: 3,
        product_id: 1,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: 7,
        outlet_id: 3,
        product_id: 2,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: 8,
        outlet_id: 3,
        product_id: 3,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      // Silver Screen - no Reese Nutrageous
      {
        id: 9,
        outlet_id: 4,
        product_id: 1,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: 10,
        outlet_id: 4,
        product_id: 3,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      // Premiere Cineplex - no Fairprice Chips
      {
        id: 11,
        outlet_id: 5,
        product_id: 2,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: 12,
        outlet_id: 5,
        product_id: 3,
        is_active: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ]

    // Initialize stock levels
    this.stockLevels = [
      // Cinema City Central stock
      { id: 1, outlet_id: 1, product_id: 1, quantity: 150, last_updated: "2023-06-01", updated_by: "John Smith" },
      { id: 2, outlet_id: 1, product_id: 2, quantity: 75, last_updated: "2023-06-01", updated_by: "John Smith" },
      { id: 3, outlet_id: 1, product_id: 3, quantity: 25, last_updated: "2023-06-01", updated_by: "John Smith" },
      // Starlight Cinemas stock
      { id: 4, outlet_id: 2, product_id: 1, quantity: 80, last_updated: "2023-05-28", updated_by: "Emily Johnson" },
      { id: 5, outlet_id: 2, product_id: 2, quantity: 30, last_updated: "2023-05-28", updated_by: "Emily Johnson" },
      // Golden Screen stock
      { id: 6, outlet_id: 3, product_id: 1, quantity: 35, last_updated: "2023-05-30", updated_by: "Michael Brown" },
      { id: 7, outlet_id: 3, product_id: 2, quantity: 120, last_updated: "2023-05-30", updated_by: "Michael Brown" },
      { id: 8, outlet_id: 3, product_id: 3, quantity: 110, last_updated: "2023-05-30", updated_by: "Michael Brown" },
      // Silver Screen stock
      { id: 9, outlet_id: 4, product_id: 1, quantity: 65, last_updated: "2023-05-29", updated_by: "Sarah Davis" },
      { id: 10, outlet_id: 4, product_id: 3, quantity: 55, last_updated: "2023-05-29", updated_by: "Sarah Davis" },
      // Premiere Cineplex stock
      { id: 11, outlet_id: 5, product_id: 2, quantity: 20, last_updated: "2023-05-27", updated_by: "David Wilson" },
      { id: 12, outlet_id: 5, product_id: 3, quantity: 15, last_updated: "2023-05-27", updated_by: "David Wilson" },
    ]

    this.initialized = true
  }

  // Outlets
  getOutlets(): Outlet[] {
    return [...this.outlets]
  }

  getOutletById(id: number): Outlet | undefined {
    return this.outlets.find((outlet) => outlet.id === id)
  }

  updateOutlet(id: number, updates: Partial<Outlet>): Outlet | null {
    const index = this.outlets.findIndex((outlet) => outlet.id === id)
    if (index === -1) return null

    const now = new Date().toISOString()
    this.outlets[index] = {
      ...this.outlets[index],
      ...updates,
      updated_at: now,
      last_updated_at: now,
    }

    return this.outlets[index]
  }

  // Products
  getProducts(): Product[] {
    return [...this.products]
  }

  getProductById(id: number): Product | undefined {
    return this.products.find((product) => product.id === id)
  }

  updateProduct(id: number, updates: Partial<Product>): Product | null {
    const index = this.products.findIndex((product) => product.id === id)
    if (index === -1) return null

    const now = new Date().toISOString()
    this.products[index] = {
      ...this.products[index],
      ...updates,
      updated_at: now,
      last_updated: now,
    }

    return this.products[index]
  }

  // Stock Levels
  getStockLevels(): StockLevel[] {
    return [...this.stockLevels]
  }

  getStockLevelsByOutlet(outletId: number): StockLevel[] {
    return this.stockLevels.filter((stock) => stock.outlet_id === outletId)
  }

  updateStockLevel(outletId: number, productId: number, quantity: number, updatedBy: string): StockLevel | null {
    const now = new Date().toISOString()
    const index = this.stockLevels.findIndex((stock) => stock.outlet_id === outletId && stock.product_id === productId)

    if (index !== -1) {
      // Update existing
      this.stockLevels[index] = {
        ...this.stockLevels[index],
        quantity,
        last_updated: now,
        updated_by: updatedBy,
      }
      return this.stockLevels[index]
    } else {
      // Create new
      const newStock: StockLevel = {
        id: Math.max(...this.stockLevels.map((s) => s.id), 0) + 1,
        outlet_id: outletId,
        product_id: productId,
        quantity,
        last_updated: now,
        updated_by: updatedBy,
      }
      this.stockLevels.push(newStock)
      return newStock
    }
  }

  // Product Mappings
  getProductMappings(): ProductMapping[] {
    return [...this.productMappings]
  }

  getProductMappingsByOutlet(outletId: number): ProductMapping[] {
    return this.productMappings.filter((mapping) => mapping.outlet_id === outletId)
  }

  updateProductMapping(outletId: number, productId: number, isActive: boolean): ProductMapping | null {
    const now = new Date().toISOString()
    const index = this.productMappings.findIndex(
      (mapping) => mapping.outlet_id === outletId && mapping.product_id === productId,
    )

    if (index !== -1) {
      // Update existing
      this.productMappings[index] = {
        ...this.productMappings[index],
        is_active: isActive,
        updated_at: now,
      }
      return this.productMappings[index]
    } else {
      // Create new
      const newMapping: ProductMapping = {
        id: Math.max(...this.productMappings.map((m) => m.id), 0) + 1,
        outlet_id: outletId,
        product_id: productId,
        is_active: isActive,
        created_at: now,
        updated_at: now,
      }
      this.productMappings.push(newMapping)
      return newMapping
    }
  }

  // Categories
  getCategories(): Category[] {
    return [...this.categories]
  }

  // Regions
  getRegions(): Region[] {
    return [...this.regions]
  }

  // Audit Trail
  addAuditEntry(entry: Omit<AuditTrail, "id" | "timestamp">): AuditTrail {
    const newEntry: AuditTrail = {
      ...entry,
      id: Math.max(...this.auditTrail.map((a) => a.id), 0) + 1,
      timestamp: new Date().toISOString(),
    }
    this.auditTrail.push(newEntry)
    return newEntry
  }

  getAuditTrail(entityType?: string, entityId?: number): AuditTrail[] {
    let filtered = [...this.auditTrail]

    if (entityType) {
      filtered = filtered.filter((entry) => entry.entity_type === entityType)
    }

    if (entityId) {
      filtered = filtered.filter((entry) => entry.entity_id === entityId)
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }
}

export const memoryDb = MemoryDatabase.getInstance()
