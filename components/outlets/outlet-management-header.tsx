import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function OutletManagementHeader() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Outlet Management</h1>
        <p className="text-muted-foreground">Manage outlet information, categories, and regions</p>
      </div>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add New Outlet
      </Button>
    </div>
  )
}
