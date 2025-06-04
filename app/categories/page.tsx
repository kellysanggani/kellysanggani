import { AppProviders } from "@/components/providers/app-providers"
import { AppLayout } from "@/components/layout/app-layout"
import { CategoryRegionHeader } from "@/components/categories/category-region-header"
import { CategoryManagement } from "@/components/categories/category-management"
import { RegionManagement } from "@/components/categories/region-management"

export const dynamic = "force-dynamic"

export default function CategoriesPage() {
  return (
    <AppProviders>
      <AppLayout>
        <div className="space-y-6">
          <CategoryRegionHeader />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryManagement />
            <RegionManagement />
          </div>
        </div>
      </AppLayout>
    </AppProviders>
  )
}
