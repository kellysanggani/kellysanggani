// Validation schemas and utilities
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  data?: any
}

export class ValidationError extends Error {
  constructor(public errors: string[]) {
    super(`Validation failed: ${errors.join(", ")}`)
    this.name = "ValidationError"
  }
}

// Outlet validation
export interface OutletData {
  name: string
  address?: string
  pic_name?: string
  pic_contact?: string
  email?: string
  sales_person?: string
}

export function validateOutlet(data: any): ValidationResult {
  const errors: string[] = []

  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Invalid data format"] }
  }

  // Required fields
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("Outlet name is required and must be a non-empty string")
  } else if (data.name.length > 255) {
    errors.push("Outlet name must be less than 255 characters")
  }

  // Optional fields validation
  if (data.address && (typeof data.address !== "string" || data.address.length > 1000)) {
    errors.push("Address must be a string with less than 1000 characters")
  }

  if (data.pic_name && (typeof data.pic_name !== "string" || data.pic_name.length > 255)) {
    errors.push("PIC name must be a string with less than 255 characters")
  }

  if (data.pic_contact && (typeof data.pic_contact !== "string" || data.pic_contact.length > 50)) {
    errors.push("PIC contact must be a string with less than 50 characters")
  }

  if (data.email && (typeof data.email !== "string" || !isValidEmail(data.email))) {
    errors.push("Email must be a valid email address")
  }

  if (data.sales_person && (typeof data.sales_person !== "string" || data.sales_person.length > 255)) {
    errors.push("Sales person must be a string with less than 255 characters")
  }

  return {
    isValid: errors.length === 0,
    errors,
    data:
      errors.length === 0
        ? {
            name: data.name.trim(),
            address: data.address?.trim() || null,
            pic_name: data.pic_name?.trim() || null,
            pic_contact: data.pic_contact?.trim() || null,
            email: data.email?.trim() || null,
            sales_person: data.sales_person?.trim() || null,
          }
        : undefined,
  }
}

// Product validation
export interface ProductData {
  name: string
  supplier?: string
  low_threshold?: number
  critical_threshold?: number
  availability?: string
}

export function validateProduct(data: any): ValidationResult {
  const errors: string[] = []

  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Invalid data format"] }
  }

  // Required fields
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("Product name is required and must be a non-empty string")
  } else if (data.name.length > 255) {
    errors.push("Product name must be less than 255 characters")
  }

  // Optional fields validation
  if (data.supplier && (typeof data.supplier !== "string" || data.supplier.length > 255)) {
    errors.push("Supplier must be a string with less than 255 characters")
  }

  if (data.low_threshold !== undefined) {
    if (typeof data.low_threshold !== "number" || data.low_threshold < 0 || data.low_threshold > 10000) {
      errors.push("Low threshold must be a number between 0 and 10000")
    }
  }

  if (data.critical_threshold !== undefined) {
    if (typeof data.critical_threshold !== "number" || data.critical_threshold < 0 || data.critical_threshold > 10000) {
      errors.push("Critical threshold must be a number between 0 and 10000")
    }
  }

  if (data.low_threshold !== undefined && data.critical_threshold !== undefined) {
    if (data.critical_threshold >= data.low_threshold) {
      errors.push("Critical threshold must be less than low threshold")
    }
  }

  if (data.availability && !["In Stock", "Out of Stock", "Low Stock", "Discontinued"].includes(data.availability)) {
    errors.push("Availability must be one of: In Stock, Out of Stock, Low Stock, Discontinued")
  }

  return {
    isValid: errors.length === 0,
    errors,
    data:
      errors.length === 0
        ? {
            name: data.name.trim(),
            supplier: data.supplier?.trim() || null,
            low_threshold: data.low_threshold || 10,
            critical_threshold: data.critical_threshold || 5,
            availability: data.availability || "In Stock",
          }
        : undefined,
  }
}

// Stock level validation
export interface StockUpdateData {
  outlet_id: number
  product_id: number
  quantity: number
  expiration_date?: string
  updated_by: string
}

export function validateStockUpdate(data: any): ValidationResult {
  const errors: string[] = []

  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Invalid data format"] }
  }

  // Required fields
  if (typeof data.outlet_id !== "number" || data.outlet_id <= 0) {
    errors.push("Outlet ID must be a positive number")
  }

  if (typeof data.product_id !== "number" || data.product_id <= 0) {
    errors.push("Product ID must be a positive number")
  }

  if (typeof data.quantity !== "number" || data.quantity < 0 || data.quantity > 100000) {
    errors.push("Quantity must be a number between 0 and 100000")
  }

  if (!data.updated_by || typeof data.updated_by !== "string" || data.updated_by.trim().length === 0) {
    errors.push("Updated by is required and must be a non-empty string")
  }

  // Optional expiration date validation
  if (data.expiration_date) {
    if (typeof data.expiration_date !== "string") {
      errors.push("Expiration date must be a string")
    } else {
      const date = new Date(data.expiration_date)
      if (isNaN(date.getTime())) {
        errors.push("Expiration date must be a valid date")
      } else if (date < new Date()) {
        errors.push("Expiration date cannot be in the past")
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data:
      errors.length === 0
        ? {
            outlet_id: data.outlet_id,
            product_id: data.product_id,
            quantity: Math.floor(data.quantity), // Ensure integer
            expiration_date: data.expiration_date || null,
            updated_by: data.updated_by.trim(),
          }
        : undefined,
  }
}

// Product mapping validation
export function validateProductMapping(data: any): ValidationResult {
  const errors: string[] = []

  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Invalid data format"] }
  }

  if (typeof data.outletId !== "number" || data.outletId <= 0) {
    errors.push("Outlet ID must be a positive number")
  }

  if (typeof data.productId !== "number" || data.productId <= 0) {
    errors.push("Product ID must be a positive number")
  }

  if (typeof data.isActive !== "boolean") {
    errors.push("isActive must be a boolean value")
  }

  return {
    isValid: errors.length === 0,
    errors,
    data:
      errors.length === 0
        ? {
            outletId: data.outletId,
            productId: data.productId,
            isActive: data.isActive,
          }
        : undefined,
  }
}

// Category/Region validation
export function validateStringArray(data: any, fieldName: string): ValidationResult {
  const errors: string[] = []

  if (!Array.isArray(data)) {
    return { isValid: false, errors: [`${fieldName} must be an array`] }
  }

  if (data.length === 0) {
    errors.push(`${fieldName} array cannot be empty`)
  }

  if (data.length > 100) {
    errors.push(`${fieldName} array cannot have more than 100 items`)
  }

  const validItems: string[] = []
  data.forEach((item, index) => {
    if (typeof item !== "string") {
      errors.push(`${fieldName}[${index}] must be a string`)
    } else if (item.trim().length === 0) {
      errors.push(`${fieldName}[${index}] cannot be empty`)
    } else if (item.length > 255) {
      errors.push(`${fieldName}[${index}] must be less than 255 characters`)
    } else {
      const trimmed = item.trim()
      if (validItems.includes(trimmed)) {
        errors.push(`${fieldName}[${index}] is a duplicate: "${trimmed}"`)
      } else {
        validItems.push(trimmed)
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? validItems : undefined,
  }
}

// Utility functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

export function isValidId(id: any): boolean {
  return typeof id === "number" && id > 0 && Number.isInteger(id)
}

export function sanitizeString(str: any, maxLength = 255): string | null {
  if (typeof str !== "string") return null
  const trimmed = str.trim()
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null
}

export function sanitizeNumber(num: any, min = 0, max: number = Number.MAX_SAFE_INTEGER): number | null {
  if (typeof num !== "number" || isNaN(num)) return null
  return num >= min && num <= max ? num : null
}
