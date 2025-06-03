"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, BarChart3, TrendingUp, Users, Settings } from "lucide-react"

export default function HeaderNavigation() {
  const pathname = usePathname()

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Analytics", href: "/analytics", icon: TrendingUp },
    { name: "Users", href: "/users", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <nav className="flex items-center space-x-4 lg:space-x-6">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                size="sm"
                className="flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
