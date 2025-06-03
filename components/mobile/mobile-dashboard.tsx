import { Home, BarChart, TrendingUp, Settings, Users, ShoppingCart } from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: any
}

const navigation: NavItem[] = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart,
  },
  {
    name: "Trending",
    href: "/trending",
    icon: TrendingUp,
  },
  {
    name: "Sales Team",
    href: "/sales",
    icon: Users,
  },
  {
    name: "Products",
    href: "/products",
    icon: ShoppingCart,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export default function HeaderNavigation() {
  return (
    <div className="flex flex-col gap-4">
      {navigation.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
        >
          <item.icon className="h-4 w-4" />
          {item.name}
        </a>
      ))}
    </div>
  )
}
