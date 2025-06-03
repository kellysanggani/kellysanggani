"use client"

import type { ReactNode } from "react"
import { useSession } from "next-auth/react"
import { hasPermission, type UserRole } from "@/lib/auth/permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldX } from "lucide-react"

interface PermissionGuardProps {
  children: ReactNode
  permission: string
  fallback?: ReactNode
}

export default function PermissionGuard({ children, permission, fallback }: PermissionGuardProps) {
  const { data: session } = useSession()

  if (!session?.user) {
    return (
      <Alert variant="destructive">
        <ShieldX className="h-4 w-4" />
        <AlertDescription>You must be logged in to access this feature.</AlertDescription>
      </Alert>
    )
  }

  const userRole = (session.user as any)?.role as UserRole
  const hasAccess = hasPermission(userRole, permission as any)

  if (!hasAccess) {
    return (
      fallback || (
        <Alert variant="destructive">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>You don't have permission to access this feature.</AlertDescription>
        </Alert>
      )
    )
  }

  return <>{children}</>
}
