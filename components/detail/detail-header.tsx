import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function DetailHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Outlet Details</h1>
        <p className="text-muted-foreground">Manage and monitor stock levels across all cinema outlets</p>
      </div>
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search outlets..." className="w-full pl-8 sm:w-[200px] md:w-[300px]" />
        </div>
        <Button>Export</Button>
      </div>
    </div>
  )
}
