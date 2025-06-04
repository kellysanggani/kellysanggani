import { AppProviders } from "@/components/providers/app-providers"
import { AppLayout } from "@/components/layout/app-layout"
import { ProductSettingsHeader } from "@/components/products/product-settings-header"
import { ProductInfoManagement } from "@/components/products/product-info-management"
import { ProductThresholdSettings } from "@/components/products/product-threshold-settings"

export const dynamic = "force-dynamic"

export default function ProductsPage() {
  return (
    <AppProviders>
      <AppLayout>
        <div className="space-y-6">
          <ProductSettingsHeader />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductInfoManagement />
            <ProductThresholdSettings />
          </div>
        </div>
      </AppLayout>
    </AppProviders>
  )
}
