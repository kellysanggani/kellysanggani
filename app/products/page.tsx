import type { Metadata } from "next"
import ProductSettingsHeader from "@/components/products/product-settings-header"
import ProductThresholdSettings from "@/components/products/product-threshold-settings"
import ProductInfoManagement from "@/components/products/product-info-management"
import QuickNavigation from "@/components/dashboard/quick-navigation"

export const metadata: Metadata = {
  title: "Product Settings | Cinema Stock Manager",
  description: "Manage product stock thresholds and settings",
}

export default function ProductSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <ProductSettingsHeader />
      <QuickNavigation />
      <ProductInfoManagement />
      <ProductThresholdSettings />
    </div>
  )
}
