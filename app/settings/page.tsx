import type { Metadata } from "next"
import SettingsHeader from "@/components/settings/settings-header"
import AccessCodeSettings from "@/components/settings/access-code-settings"
import UserManagement from "@/components/settings/user-management"
import UserRolesManagement from "@/components/settings/user-roles-management"
import DatabaseManagement from "@/components/settings/database-management"
import QuickNavigation from "@/components/dashboard/quick-navigation"

export const metadata: Metadata = {
  title: "User Settings | Cinema Stock Manager",
  description: "Manage users and their roles",
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <SettingsHeader />
      <QuickNavigation />
      <div className="space-y-6">
        <UserRolesManagement />
        <div className="grid gap-6 md:grid-cols-2">
          <AccessCodeSettings />
          <UserManagement />
        </div>
        <DatabaseManagement />
      </div>
    </div>
  )
}
