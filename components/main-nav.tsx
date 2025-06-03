"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface MainNavProps {
  items: {
    name: string
    href: string
    icon: LucideIcon
  }[]
  className?: string
}

export function MainNav({ items, className }: MainNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col space-y-2", className)}>
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Button key={item.href} asChild variant={isActive ? "default" : "ghost"} className="justify-start">
            <Link href={item.href} className="flex items-center gap-2">
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}
