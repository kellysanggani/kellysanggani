import { notFound } from "next/navigation"
import OutletDetailHeader from "@/components/detail/outlet-detail-header"
import StockUpdateForm from "@/components/detail/stock-update-form"
import { DatabaseService } from "@/lib/db/database-service"

export default async function OutletEditPage({ params }: { params: { id: string } }) {
  try {
    const outletId = Number.parseInt(params.id)
    if (isNaN(outletId)) {
      notFound()
    }

    const outlet = await DatabaseService.getOutletById(outletId)

    if (!outlet) {
      notFound()
    }

    // Create a safe version of the outlet with all properties guaranteed to exist
    const safeOutlet = {
      id: outlet.id,
      name: outlet.name || "",
      category_id: outlet.category_id || null,
      region_id: outlet.region_id || null,
      sales_person: outlet.sales_person || null,
      last_check_date: outlet.last_check_date || null,
      last_order_date: outlet.last_order_date || null,
      address: outlet.address || null,
      phone: outlet.phone || null,
      email: outlet.email || null,
      store_name: outlet.store_name || null,
      pic_name: outlet.pic_name || null,
      pic_contact: outlet.pic_contact || null,
      last_updated_by: outlet.last_updated_by || null,
      last_updated_at: outlet.last_updated_at || null,
      created_at: outlet.created_at || new Date().toISOString(),
      updated_at: outlet.updated_at || new Date().toISOString(),
    }

    // Get stock levels for this outlet
    const stockLevels = await DatabaseService.getStockLevelsByOutlet(outletId)

    // Get products to map IDs to names
    const products = await DatabaseService.getProducts()

    // Create a map of product IDs to names
    const productMap = products.reduce(
      (acc, product) => {
        acc[product.id] = product.name
        return acc
      },
      {} as Record<number, string>,
    )

    // Create safe stock levels with product names
    const safeStockLevels = stockLevels.map((level) => ({
      id: level.id,
      product_id: level.product_id,
      product_name: productMap[level.product_id] || `Product ${level.product_id}`,
      quantity: level.quantity,
      last_updated: level.last_updated || null,
      updated_by: level.updated_by || null,
    }))

    return (
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <OutletDetailHeader outlet={safeOutlet} />
        <StockUpdateForm outlet={safeOutlet} stockLevels={safeStockLevels} />
      </div>
    )
  } catch (error) {
    console.error("Error loading outlet edit:", error)
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold mb-2">Error Loading Outlet</h2>
        <p className="text-muted-foreground mb-4">There was a problem loading this outlet. Please try again later.</p>
        <p className="text-sm text-red-500">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    )
  }
}
