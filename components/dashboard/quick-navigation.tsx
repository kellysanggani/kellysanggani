"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart3, ClipboardList, Settings, Building2, Tag, Grid3X3, Package, Users, UserCheck } from "lucide-react"

export default function QuickNavigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/detail", label: "Outlet Details", icon: ClipboardList },
    { href: "/outlets", label: "Outlet Management", icon: Building2 },
    { href: "/categories", label: "Categories", icon: Tag },
    { href: "/products", label: "Products", icon: Package },
    { href: "/product-mapping", label: "Product Mapping", icon: Grid3X3 },
    { href: "/sales", label: "Sales Team", icon: Users },
    { href: "/sales-mapping", label: "Sales Mapping", icon: UserCheck },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Quick Navigation</h3>
        <div className="flex gap-2">
          {navItems.map((item) => (
            <Button key={item.href} asChild size="sm" variant={pathname === item.href ? "default" : "outline"}>
              <Link href={item.href} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}
