"use client"

import type React from "react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  ArrowLeft,
  Bell,
  BarChart3,
  ClipboardList,
  Building2,
  Tag,
  LayoutGrid,
  Package,
  Settings,
} from "lucide-react"

interface MobileLayoutProps {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
  onBackClick?: () => void
  alertCount?: number
}

export default function MobileLayout({
  children,
  title = "Cinema Stock Manager",
  showBackButton = false,
  onBackClick,
  alertCount = 0,
}: MobileLayoutProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Outlet Details", href: "/detail", icon: ClipboardList },
    { name: "Outlet Management", href: "/outlets", icon: Building2 },
    { name: "Categories & Regions", href: "/categories", icon: Tag },
    { name: "Product Mapping", href: "/product-mapping", icon: LayoutGrid },
    { name: "Product Settings", href: "/products", icon: Package },
    { name: "User Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button variant="ghost" size="icon" onClick={onBackClick}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4">
                  <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Navigation</h2>
                    <div className="space-y-1">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                            pathname === item.href ? "bg-accent" : ""
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <h1 className="text-lg font-semibold">{title}</h1>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {alertCount > 0 && (
                <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                  {alertCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
