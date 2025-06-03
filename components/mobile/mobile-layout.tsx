"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Bell, Menu, Home, Store, Package, Settings, ChevronLeft } from "lucide-react"
import { usePathname } from "next/navigation"

interface MobileLayoutProps {
  children: React.ReactNode
  title: string
  backLink?: string
  alertCount?: number
}

export default function MobileLayout({ children, title, backLink, alertCount = 0 }: MobileLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/mobile/dashboard", icon: Home },
    { name: "Outlets", href: "/mobile/outlets", icon: Store },
    { name: "Stock Update", href: "/mobile/stock-update", icon: Package },
    { name: "Settings", href: "/mobile/settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-white px-4">
        <div className="flex items-center gap-3">
          {backLink ? (
            <Button variant="ghost" size="icon" asChild className="-ml-2">
              <Link href={backLink}>
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)} className="-ml-2">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <Button variant="ghost" size="icon" asChild className="-mr-2 relative">
          <Link href="/mobile/alerts">
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {alertCount}
              </span>
            )}
          </Link>
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">{children}</main>

      {/* Navigation Menu */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center border-b px-4">
            <h2 className="text-lg font-semibold">Cinema Stock Manager</h2>
          </div>
          <nav className="p-2">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const IconComponent = item.icon
                return (
                  <li key={item.name}>
                    <Button
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      asChild
                      onClick={() => setMenuOpen(false)}
                    >
                      <Link href={item.href}>
                        <IconComponent className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    </Button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
