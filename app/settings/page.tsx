import { AppProviders } from "@/components/providers/app-providers"
import { AppLayout } from "@/components/layout/app-layout"
import { SettingsHeader } from "@/components/settings/settings-header"
import { UserManagement } from "@/components/settings/user-management"
import { DatabaseManagement } from "@/components/settings/database-management"

export const dynamic = "force-dynamic"

export default function SettingsPage() {
  return (
    <AppProviders>
      <AppLayout>
        <div className="space-y-6">
          <SettingsHeader />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserManagement />
            <DatabaseManagement />
          </div>
        </div>
      </AppLayout>
    </AppProviders>
  )
}
