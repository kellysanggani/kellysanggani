"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, MapPin, Save, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function RegionManagement() {
  const [regions, setRegions] = useState<string[]>([])
  const [newRegion, setNewRegion] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch regions from API
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/regions")
        if (response.ok) {
          const data = await response.json()
          const regionNames = Array.isArray(data) ? data.map((r: any) => r.name).filter(Boolean) : []
          setRegions(regionNames)
        } else {
          console.error("Failed to fetch regions")
          // Use default regions if API fails
          setRegions(["Downtown", "Uptown", "Midtown", "Westside", "Eastside", "Suburbs"])
        }
      } catch (error) {
        console.error("Error fetching regions:", error)
        // Use default regions if API fails
        setRegions(["Downtown", "Uptown", "Midtown", "Westside", "Eastside", "Suburbs"])
      } finally {
        setLoading(false)
      }
    }

    fetchRegions()
  }, [])

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
    setSaving(true)
    try {
      const response = await fetch("/api/regions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ regions }),
      })

      if (response.ok) {
        setHasChanges(false)
        toast({
          title: "✅ Regions Saved Successfully!",
          description: "All region changes have been saved to the database.",
          duration: 4000,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save regions")
      }
    } catch (error) {
      console.error("Error saving regions:", error)
      toast({
        title: "❌ Save Failed",
        description: error instanceof Error ? error.message : "Failed to save regions. Please try again.",
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading regions...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Regions
            </CardTitle>
            <CardDescription>Manage outlet regions</CardDescription>
          </div>
          {hasChanges && (
            <Button onClick={handleSaveRegions} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ You have unsaved changes. Click "Save Changes" to persist your modifications.
            </p>
          </div>
        )}

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
      </CardContent>
    </Card>
  )
}
