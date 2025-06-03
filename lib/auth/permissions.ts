export type UserRole = "admin" | "sales_manager" | "stock_clerk"

export interface Permission {
  canViewOutlets: boolean
  canEditOutlets: boolean
  canViewProducts: boolean
  canEditProducts: boolean
  canViewStock: boolean
  canEditStock: boolean
  canViewUsers: boolean
  canEditUsers: boolean
  canViewSettings: boolean
  canEditSettings: boolean
  canViewAuditTrail: boolean
  canViewDashboard: boolean
  canViewCategories: boolean
  canEditCategories: boolean
  canViewProductMapping: boolean
  canEditProductMapping: boolean
}

export const rolePermissions: Record<UserRole, Permission> = {
  admin: {
    canViewOutlets: true,
    canEditOutlets: true,
    canViewProducts: true,
    canEditProducts: true,
    canViewStock: true,
    canEditStock: true,
    canViewUsers: true,
    canEditUsers: true,
    canViewSettings: true,
    canEditSettings: true,
    canViewAuditTrail: true,
    canViewDashboard: true,
    canViewCategories: true,
    canEditCategories: true,
    canViewProductMapping: true,
    canEditProductMapping: true,
  },
  sales_manager: {
    canViewOutlets: true,
    canEditOutlets: true,
    canViewProducts: true,
    canEditProducts: true,
    canViewStock: true,
    canEditStock: true,
    canViewUsers: true,
    canEditUsers: false,
    canViewSettings: false,
    canEditSettings: false,
    canViewAuditTrail: true,
    canViewDashboard: true,
    canViewCategories: true,
    canEditCategories: false,
    canViewProductMapping: true,
    canEditProductMapping: true,
  },
  stock_clerk: {
    canViewOutlets: true,
    canEditOutlets: false,
    canViewProducts: false,
    canEditProducts: false,
    canViewStock: true,
    canEditStock: true, // Can only update stock quantity and last check date
    canViewUsers: false,
    canEditUsers: false,
    canViewSettings: false,
    canEditSettings: false,
    canViewAuditTrail: true,
    canViewDashboard: false,
    canViewCategories: false,
    canEditCategories: false,
    canViewProductMapping: false,
    canEditProductMapping: false,
  },
}

export function getUserPermissions(role: UserRole): Permission {
  return rolePermissions[role] || rolePermissions.stock_clerk
}

export function hasPermission(userRole: UserRole, permission: keyof Permission): boolean {
  const permissions = getUserPermissions(userRole)
  return permissions[permission]
}
