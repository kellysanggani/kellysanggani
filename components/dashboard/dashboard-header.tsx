import { CalendarRange } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardHeader() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your cinema outlet stock management</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="hidden md:flex">
          <CalendarRange className="mr-2 h-4 w-4" />
          Last 30 days
        </Button>
      </div>
    </div>
  )
}
