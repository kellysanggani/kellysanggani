import type { Metadata } from "next"
import { notFound } from "next/navigation"
import OutletViewDetails from "@/components/detail/outlet-view-details"
import { DatabaseService } from "@/lib/db/database-service"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const outletId = Number.parseInt(params.id)
    if (isNaN(outletId)) {
      return {
        title: "Invalid Outlet ID | Cinema Stock Manager",
      }
    }

    const outlet = await DatabaseService.getOutletById(outletId)

    if (!outlet) {
      return {
        title: "Outlet Not Found | Cinema Stock Manager",
      }
    }

    return {
      title: `${outlet.name} - View Details | Cinema Stock Manager`,
      description: `Detailed view for ${outlet.name}`,
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Outlet Details | Cinema Stock Manager",
    }
  }
}

export default async function OutletViewPage({ params }: { params: { id: string } }) {
  try {
    const outletId = Number.parseInt(params.id)
    if (isNaN(outletId)) {
      notFound()
    }

    console.log(`Loading view details for outlet ID: ${outletId}`)

    // Force fresh data fetch
    const outlet = await DatabaseService.getOutletById(outletId)

    if (!outlet) {
      console.log(`Outlet with ID ${outletId} not found`)
      notFound()
    }

    console.log(`Loaded outlet for view: ${outlet.name} (ID: ${outlet.id})`)

    // Create a safe version of the outlet
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

    // Get audit trail for this outlet
    const auditTrail = await DatabaseService.getAuditTrail("outlet", outletId)

    // Create safe stock levels
    const safeStockLevels = stockLevels.map((level) => ({
      id: level.id,
      product_id: level.product_id,
      product_name: level.product_name || `Product ${level.product_id}`,
      quantity: level.quantity,
      last_updated: level.last_updated || null,
      updated_by: level.updated_by || null,
      expiration_date: level.expiration_date || null,
    }))

    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-7xl">
        <OutletViewDetails outlet={safeOutlet} stockLevels={safeStockLevels} auditTrail={auditTrail} />
      </div>
    )
  } catch (error) {
    console.error("Error loading outlet view:", error)
    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Error Loading Outlet Details</h2>
          <p className="text-muted-foreground mb-4 max-w-md">
            There was a problem loading the details for this outlet. Please try again later.
          </p>
          <p className="text-sm text-red-500 break-words max-w-md">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    )
  }
}
