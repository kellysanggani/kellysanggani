"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, ClipboardList, Building2, Tag, LayoutGrid, Package, Settings } from "lucide-react"

interface MainNavProps {
  className?: string
}

export default function MainNav({ className }: MainNavProps) {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: BarChart3,
      active: pathname === "/dashboard",
    },
    {
      href: "/detail",
      label: "Outlet Details",
      icon: ClipboardList,
      active: pathname === "/detail",
    },
    {
      href: "/outlets",
      label: "Outlet Management",
      icon: Building2,
      active: pathname === "/outlets",
    },
    {
      href: "/categories",
      label: "Categories & Regions",
      icon: Tag,
      active: pathname === "/categories",
    },
    {
      href: "/product-mapping",
      label: "Product Mapping",
      icon: LayoutGrid,
      active: pathname === "/product-mapping",
    },
    {
      href: "/products",
      label: "Product Settings",
      icon: Package,
      active: pathname === "/products",
    },
    {
      href: "/settings",
      label: "User Settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  return (
    <nav className={cn("flex flex-col space-y-2", className)}>
      {routes.map((route) => (
        <Link key={route.href} href={route.href}>
          <Button variant={route.active ? "default" : "ghost"} className="w-full justify-start">
            <route.icon className="mr-2 h-4 w-4" />
            {route.label}
          </Button>
        </Link>
      ))}
    </nav>
  )
}
