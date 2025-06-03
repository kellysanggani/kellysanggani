import type { Metadata } from "next"
import { notFound } from "next/navigation"
import MobileLayout from "@/components/mobile/mobile-layout"
import MobileStockUpdate from "@/components/mobile/mobile-stock-update"

const outlets = [
  {
    id: 1,
    name: "Cinema City Central",
    stockLevels: [
      { product: "Fairprice Potato Chips", quantity: 150 },
      { product: "Reese Nutrageous", quantity: 75 },
      { product: "Reese Pieces", quantity: 25 },
    ],
  },
  {
    id: 2,
    name: "Starlight Cinemas",
    stockLevels: [
      { product: "Fairprice Potato Chips", quantity: 80 },
      { product: "Reese Nutrageous", quantity: 30 },
      { product: "Reese Pieces", quantity: 60 },
    ],
  },
]

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const outlet = outlets.find((o) => o.id === Number.parseInt(params.id))

  if (!outlet) {
    return {
      title: "Outlet Not Found | Cinema Stock Manager",
    }
  }

  return {
    title: `Update Stock - ${outlet.name} | Cinema Stock Manager`,
    description: `Mobile stock update for ${outlet.name}`,
  }
}

export default function MobileStockUpdatePage({ params }: { params: { id: string } }) {
  const outlet = outlets.find((o) => o.id === Number.parseInt(params.id))

  if (!outlet) {
    notFound()
  }

  return (
    <MobileLayout title={`Update - ${outlet.name}`}>
      <MobileStockUpdate outlet={outlet} />
    </MobileLayout>
  )
}
