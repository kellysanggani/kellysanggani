"use client"

import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"

interface OutletManagementHeaderProps {
  onAddOutlet?: () => void
  onBulkImport?: () => void
}

export default function OutletManagementHeader({ onAddOutlet, onBulkImport }: OutletManagementHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Outlet Management</h1>
        <p className="text-muted-foreground">Manage outlet information, categories, and regions</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onBulkImport} variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Import
        </Button>
        <Button onClick={onAddOutlet}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Outlet
        </Button>
      </div>
    </div>
  )
}
