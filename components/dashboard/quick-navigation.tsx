"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BarChart3, ClipboardList, Building2, Tag, LayoutGrid, Package, Settings } from "lucide-react"

export default function QuickNavigation() {
  const navigationItems = [
    {
      title: "Dashboard",
      description: "View overview and analytics",
      href: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Outlet Details",
      description: "Check outlet information",
      href: "/detail",
      icon: ClipboardList,
    },
    {
      title: "Outlet Management",
      description: "Manage outlet settings",
      href: "/outlets",
      icon: Building2,
    },
    {
      title: "Categories & Regions",
      description: "Organize products and locations",
      href: "/categories",
      icon: Tag,
    },
    {
      title: "Product Mapping",
      description: "Map products to outlets",
      href: "/product-mapping",
      icon: LayoutGrid,
    },
    {
      title: "Product Settings",
      description: "Configure product details",
      href: "/products",
      icon: Package,
    },
    {
      title: "User Settings",
      description: "Manage users and permissions",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Navigation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4 w-full">
                <item.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
