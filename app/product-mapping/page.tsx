import type { Metadata } from "next"
import ProductMappingHeader from "@/components/product-mapping/product-mapping-header"
import ProductOutletMatrix from "@/components/product-mapping/product-outlet-matrix"
import QuickNavigation from "@/components/dashboard/quick-navigation"

export const metadata: Metadata = {
  title: "Product Mapping | Cinema Stock Manager",
  description: "Manage which products are supplied to which outlets",
}

export default function ProductMappingPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <ProductMappingHeader />
      <QuickNavigation />
      <ProductOutletMatrix />
    </div>
  )
}
