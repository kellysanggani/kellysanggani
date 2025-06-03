import type { Metadata } from "next"
import CategoryRegionHeader from "@/components/categories/category-region-header"
import CategoryManagement from "@/components/categories/category-management"
import RegionManagement from "@/components/categories/region-management"
import QuickNavigation from "@/components/dashboard/quick-navigation"

export const metadata: Metadata = {
  title: "Categories & Regions | Cinema Stock Manager",
  description: "Manage outlet categories and regions",
}

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <CategoryRegionHeader />
      <QuickNavigation />
      <div className="grid gap-6 md:grid-cols-2">
        <CategoryManagement />
        <RegionManagement />
      </div>
    </div>
  )
}
