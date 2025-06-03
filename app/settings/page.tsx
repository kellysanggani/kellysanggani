import type { Metadata } from "next"
import SettingsHeader from "@/components/settings/settings-header"
import DatabaseManagement from "@/components/settings/database-management"
import UserManagement from "@/components/settings/user-management"
import UserRolesManagement from "@/components/settings/user-roles-management"
import DataManagement from "@/components/settings/data-management"
import QuickNavigation from "@/components/dashboard/quick-navigation"

export const metadata: Metadata = {
  title: "Settings | Cinema Stock Manager",
  description: "Manage system settings, users, and database operations",
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <SettingsHeader />
      <QuickNavigation />
      <div className="grid gap-6">
        <DataManagement />
        <div className="grid gap-6 md:grid-cols-2">
          <UserManagement />
          <UserRolesManagement />
        </div>
        <DatabaseManagement />
      </div>
    </div>
  )
}
