import { AppProviders } from "@/components/providers/app-providers"
import { AppLayout } from "@/components/layout/app-layout"
import { ProductMappingHeader } from "@/components/product-mapping/product-mapping-header"
import { ProductOutletMatrix } from "@/components/product-mapping/product-outlet-matrix"

export const dynamic = "force-dynamic"

export default function ProductMappingPage() {
  return (
    <AppProviders>
      <AppLayout>
        <div className="space-y-6">
          <ProductMappingHeader />
          <ProductOutletMatrix />
        </div>
      </AppLayout>
    </AppProviders>
  )
}
