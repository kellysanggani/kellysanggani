"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  ClipboardList,
  LogOut,
  Menu,
  Settings,
  User,
  Building2,
  Package,
  Tag,
  LayoutGrid,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import HeaderNavigation from "./header-navigation"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  // Check if user is authenticated
  useEffect(() => {
    setIsMounted(true)
    const adminAuthenticated = sessionStorage.getItem("adminAuthenticated")

    if (!adminAuthenticated && isMounted) {
      router.push("/")
    }
  }, [router, isMounted])

  const handleSignOut = () => {
    sessionStorage.removeItem("adminAuthenticated")
    router.push("/")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Outlet Details", href: "/detail", icon: ClipboardList },
    { name: "Outlet Management", href: "/outlets", icon: Building2 },
    { name: "Categories & Regions", href: "/categories", icon: Tag },
    { name: "Product Mapping", href: "/product-mapping", icon: LayoutGrid },
    { name: "Product Settings", href: "/products", icon: Package },
    { name: "User Settings", href: "/settings", icon: Settings },
  ]

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header Navigation */}
      <HeaderNavigation />

      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b bg-background lg:hidden">
        <div className="flex h-16 items-center gap-4 px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 pt-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                        pathname === item.href ? "bg-muted" : "hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Cinema Stock Manager</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-muted/40 lg:flex">
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-lg font-semibold">Cinema Stock Manager</h1>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 h-5 w-5" />
                  <span>Admin User</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
