"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, MapPin, Save, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useApi } from "@/lib/hooks/use-api"
import type { Region } from "@/lib/db/database-service"

export default function RegionManagement() {
  const { data: dbRegions, loading, error, mutate } = useApi<Region[]>("/api/regions")

  const [regions, setRegions] = useState<string[]>([])
  const [newRegion, setNewRegion] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize regions from database
  useEffect(() => {
    if (dbRegions) {
      const regionNames = dbRegions
        .filter((reg) => reg && reg.name) // Filter out invalid regions
        .map((reg) => reg.name)
      setRegions(regionNames)
      setHasChanges(false)
    }
  }, [dbRegions])

  const handleAddRegion = () => {
    if (!newRegion.trim()) return

    if (regions.includes(newRegion.trim())) {
      toast({
        title: "Region exists",
        description: "This region already exists.",
        variant: "destructive",
      })
      return
    }

    setRegions([...regions, newRegion.trim()])
    setNewRegion("")
    setHasChanges(true)

    toast({
      title: "Region added",
      description: `Region "${newRegion}" has been added. Don't forget to save your changes.`,
    })
  }

  const handleRemoveRegion = (region: string) => {
    if (regions.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "At least one region must exist.",
        variant: "destructive",
      })
      return
    }

    setRegions(regions.filter((r) => r !== region))
    setHasChanges(true)

    toast({
      title: "Region removed",
      description: `Region "${region}" has been removed. Don't forget to save your changes.`,
    })
  }

  const handleSaveRegions = async () => {
    setIsSaving(true)

    try {
      const response = await fetch("/api/regions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ regions }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save regions: ${response.statusText}`)
      }

      await mutate() // Refresh the data
      setHasChanges(false)

      toast({
        title: "Regions saved",
        description: "Your regions have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving regions:", error)
      toast({
        title: "Error saving regions",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading regions...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-500">
            <p className="mb-2 font-semibold">Error loading regions</p>
            <p className="text-sm">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Regions
        </CardTitle>
        <CardDescription>Manage outlet regions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <div key={region} className="flex items-center gap-1">
              <Badge variant="outline">{region}</Badge>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleRemoveRegion(region)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="new-region" className="sr-only">
              New Region
            </Label>
            <Input
              id="new-region"
              placeholder="Enter new region"
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddRegion()}
            />
          </div>
          <Button onClick={handleAddRegion}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSaveRegions}
            disabled={isSaving || !hasChanges}
            variant={hasChanges ? "default" : "outline"}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Regions
              </>
            )}
          </Button>
        </div>
      </CardContent>
      <Toaster />
    </Card>
  )
}
