import type { Metadata } from "next"
import { AppProviders } from "@/components/providers/app-providers"
import MobileLayout from "@/components/mobile/mobile-layout"
import MobileOutletCard from "@/components/mobile/mobile-outlet-card"

export const metadata: Metadata = {
  title: "Mobile Outlets | Cinema Stock Manager",
  description: "Mobile-optimized outlet management",
}

export const dynamic = "force-dynamic"

export default function MobileOutletsPage() {
  const outlets = [
    {
      id: 1,
      name: "Cinema City Central",
      category: "Premium",
      region: "Downtown",
      salesPerson: "John Smith",
      lastCheckDate: "2023-05-20", // More than 5 days ago
      address: "123 Main Street, Downtown",
      phone: "+1 (555) 123-4567",
      stockLevels: [
        { product: "Fairprice Potato Chips", quantity: 150 },
        { product: "Reese Nutrageous", quantity: 75 },
        { product: "Reese Pieces", quantity: 25 },
      ],
    },
    {
      id: 2,
      name: "Starlight Cinemas",
      category: "Standard",
      region: "Uptown",
      salesPerson: "Emily Johnson",
      lastCheckDate: "2023-06-01",
      address: "456 Cinema Boulevard, Uptown",
      phone: "+1 (555) 234-5678",
      stockLevels: [
        { product: "Fairprice Potato Chips", quantity: 80 },
        { product: "Reese Nutrageous", quantity: 30 },
        { product: "Reese Pieces", quantity: 60 },
      ],
    },
    {
      id: 3,
      name: "Golden Screen Theatres",
      category: "Premium",
      region: "Midtown",
      salesPerson: "Michael Brown",
      lastCheckDate: "2023-05-18", // More than 5 days ago
      address: "789 Theater Lane, Midtown",
      phone: "+1 (555) 345-6789",
      stockLevels: [
        { product: "Fairprice Potato Chips", quantity: 35 },
        { product: "Reese Nutrageous", quantity: 120 },
        { product: "Reese Pieces", quantity: 110 },
      ],
    },
  ]

  return (
    <AppProviders>
      <MobileLayout title="Outlets" showSearch alertCount={8}>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Outlets</h1>
          {outlets.map((outlet) => (
            <MobileOutletCard key={outlet.id} outlet={outlet} />
          ))}
        </div>
      </MobileLayout>
    </AppProviders>
  )
}
