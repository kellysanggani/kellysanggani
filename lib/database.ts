// Database schema and connection utilities
export interface Outlet {
  id: number
  name: string
  category: string
  region: string
  salesPerson: string
  lastCheckDate: string
  lastOrderDate: string
  address: string
  phone: string
  email: string
  storeName?: string
  picName?: string
  picContact?: string
  lastUpdatedBy?: string
  lastUpdatedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: number
  name: string
  supplier: string
  expirationDate: string
  availability: "In Stock" | "Low Stock" | "Out of Stock"
  lowThreshold: number
  criticalThreshold: number
  lastUpdated: string
  createdAt: string
  updatedAt: string
}

export interface StockLevel {
  id: number
  outletId: number
  productId: number
  quantity: number
  lastUpdated: string
  updatedBy: string
}

export interface ProductMapping {
  id: number
  outletId: number
  productId: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuditTrail {
  id: number
  entityType: "outlet" | "product" | "stock" | "mapping"
  entityId: number
  action: string
  details: string
  field: string
  oldValue?: string
  newValue?: string
  userId: string
  userEmail: string
  ipAddress: string
  timestamp: string
}

export interface User {
  id: number
  email: string
  name: string
  role: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

// Database connection class
export class Database {
  private static instance: Database
  private outlets: Outlet[] = []
  private products: Product[] = []
  private stockLevels: StockLevel[] = []
  private productMappings: ProductMapping[] = []
  private auditTrail: AuditTrail[] = []
  private users: User[] = []

  private constructor() {
    this.initializeData()
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  private initializeData() {
    // Initialize with sample data
    this.outlets = [
      {
        id: 1,
        name: "Cinema City Central",
        category: "Premium",
        region: "Downtown",
        salesPerson: "John Smith",
        lastCheckDate: "2023-06-01",
        lastOrderDate: "2023-05-25",
        address: "123 Main Street, Downtown",
        phone: "+1 (555) 123-4567",
        email: "manager@cinemacentral.com",
        storeName: "Central Plaza Store",
        picName: "Alice Johnson",
        picContact: "+1 (555) 123-4568",
        lastUpdatedBy: "John Smith",
        lastUpdatedAt: "2023-06-01T10:30:00Z",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-06-01T10:30:00Z",
      },
      {
        id: 2,
        name: "Starlight Cinemas",
        category: "Standard",
        region: "Uptown",
        salesPerson: "Emily Johnson",
        lastCheckDate: "2023-05-28",
        lastOrderDate: "2023-05-20",
        address: "456 Cinema Boulevard, Uptown",
        phone: "+1 (555) 234-5678",
        email: "info@starlightcinemas.com",
        storeName: "Starlight Mall Store",
        picName: "Bob Wilson",
        picContact: "+1 (555) 234-5679",
        lastUpdatedBy: "Emily Johnson",
        lastUpdatedAt: "2023-05-28T14:15:00Z",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-05-28T14:15:00Z",
      },
    ]

    this.products = [
      {
        id: 1,
        name: "Fairprice Potato Chips",
        supplier: "Fairprice",
        expirationDate: "2024-08-15",
        availability: "In Stock",
        lowThreshold: 30,
        criticalThreshold: 10,
        lastUpdated: "2023-06-01",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-06-01T00:00:00Z",
      },
      {
        id: 2,
        name: "Reese Nutrageous",
        supplier: "Hershey's",
        expirationDate: "2024-12-31",
        availability: "Low Stock",
        lowThreshold: 25,
        criticalThreshold: 8,
        lastUpdated: "2023-05-28",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-05-28T00:00:00Z",
      },
    ]

    this.stockLevels = [
      { id: 1, outletId: 1, productId: 1, quantity: 150, lastUpdated: "2023-06-01", updatedBy: "John Smith" },
      { id: 2, outletId: 1, productId: 2, quantity: 75, lastUpdated: "2023-06-01", updatedBy: "John Smith" },
      { id: 3, outletId: 2, productId: 1, quantity: 80, lastUpdated: "2023-05-28", updatedBy: "Emily Johnson" },
    ]

    this.productMappings = [
      {
        id: 1,
        outletId: 1,
        productId: 1,
        isActive: true,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
      {
        id: 2,
        outletId: 1,
        productId: 2,
        isActive: true,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
      {
        id: 3,
        outletId: 2,
        productId: 1,
        isActive: true,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    ]
  }

  // CRUD operations
  public getOutlets(): Outlet[] {
    return this.outlets
  }

  public getOutletById(id: number): Outlet | undefined {
    return this.outlets.find((outlet) => outlet.id === id)
  }

  public updateOutlet(id: number, updates: Partial<Outlet>): Outlet | null {
    const index = this.outlets.findIndex((outlet) => outlet.id === id)
    if (index === -1) return null

    this.outlets[index] = { ...this.outlets[index], ...updates, updatedAt: new Date().toISOString() }
    return this.outlets[index]
  }

  public getProducts(): Product[] {
    return this.products
  }

  public getStockLevels(): StockLevel[] {
    return this.stockLevels
  }

  public updateStockLevel(outletId: number, productId: number, quantity: number, updatedBy: string): StockLevel | null {
    const index = this.stockLevels.findIndex((stock) => stock.outletId === outletId && stock.productId === productId)

    if (index === -1) {
      // Create new stock level
      const newStock: StockLevel = {
        id: this.stockLevels.length + 1,
        outletId,
        productId,
        quantity,
        lastUpdated: new Date().toISOString(),
        updatedBy,
      }
      this.stockLevels.push(newStock)
      return newStock
    } else {
      // Update existing stock level
      this.stockLevels[index] = {
        ...this.stockLevels[index],
        quantity,
        lastUpdated: new Date().toISOString(),
        updatedBy,
      }
      return this.stockLevels[index]
    }
  }

  public addAuditEntry(entry: Omit<AuditTrail, "id" | "timestamp">): AuditTrail {
    const newEntry: AuditTrail = {
      ...entry,
      id: this.auditTrail.length + 1,
      timestamp: new Date().toISOString(),
    }
    this.auditTrail.push(newEntry)
    return newEntry
  }

  public getAuditTrail(entityType?: string, entityId?: number): AuditTrail[] {
    let filtered = this.auditTrail

    if (entityType) {
      filtered = filtered.filter((entry) => entry.entityType === entityType)
    }

    if (entityId) {
      filtered = filtered.filter((entry) => entry.entityId === entityId)
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }
}
