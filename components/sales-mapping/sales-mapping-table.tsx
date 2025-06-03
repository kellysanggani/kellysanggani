"use client"

import { CardContent } from "@/components/ui/card"

import { CardHeader } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Building2, Save, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
// Add these imports at the top with the other imports
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckSquare, Users } from "lucide-react"

interface Outlet {
  id: number
  name: string
  category_id: number | null
  region_id: number | null
  sales_person: string | null
  store_name: string | null
  category?: string
  region?: string
}

interface SalesPerson {
  id: number
  name: string
  email: string
  role: string
}

interface SalesMapping {
  outletId: number
  salesPersonId: number | null
  salesPersonName: string | null
}

export default function SalesMappingTable() {
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([])
  const [mappings, setMappings] = useState<Record<number, number | null>>({})
  const [originalMappings, setOriginalMappings] = useState<Record<number, number | null>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Add these state variables in the SalesMappingTable component after the other state declarations
  const [selectedOutlets, setSelectedOutlets] = useState<number[]>([])
  const [bulkDialogOpen, setBulkDialogOpen] = useState<boolean>(false)
  const [bulkSalesPerson, setBulkSalesPerson] = useState<string | null>(null)

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching outlets and sales persons...")

      // Fetch outlets and users in parallel
      const [outletsResponse, usersResponse] = await Promise.allSettled([fetch("/api/outlets"), fetch("/api/users")])

      // Process outlets
      let outletsData: any[] = []
      if (outletsResponse.status === "fulfilled" && outletsResponse.value.ok) {
        const data = await outletsResponse.value.json()
        outletsData = Array.isArray(data) ? data : []
        console.log("Fetched outlets:", outletsData)
      }

      // Process users (filter for stock clerks)
      let usersData: any[] = []
      if (usersResponse.status === "fulfilled" && usersResponse.value.ok) {
        const data = await usersResponse.value.json()
        usersData = Array.isArray(data) ? data.filter((user) => user.role === "stock_clerk") : []
        console.log("Fetched stock clerks:", usersData)
      }

      // Process outlets data
      const processedOutlets: Outlet[] = outletsData
        .filter((outlet) => outlet && outlet.id && outlet.name)
        .map((outlet) => ({
          id: outlet.id,
          name: outlet.name,
          category_id: outlet.category_id,
          region_id: outlet.region_id,
          sales_person: outlet.sales_person,
          store_name: outlet.store_name,
          category: getCategoryName(outlet.category_id),
          region: getRegionName(outlet.region_id),
        }))

      // Process sales persons
      const processedSalesPersons: SalesPerson[] = usersData
        .filter((user) => user && user.id && user.name)
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }))

      // Create mappings from current outlet assignments
      const currentMappings: Record<number, number | null> = {}
      processedOutlets.forEach((outlet) => {
        // Find sales person by name
        const salesPerson = processedSalesPersons.find((sp) => sp.name === outlet.sales_person)
        currentMappings[outlet.id] = salesPerson ? salesPerson.id : null
      })

      setOutlets(processedOutlets)
      setSalesPersons(processedSalesPersons)
      setMappings(currentMappings)
      setOriginalMappings({ ...currentMappings })

      console.log("Data processing complete:", {
        outlets: processedOutlets.length,
        salesPersons: processedSalesPersons.length,
        mappings: currentMappings,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(error instanceof Error ? error.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getCategoryName = (categoryId: number | null) => {
    if (categoryId === null) return "Not set"
    const categories: Record<number, string> = {
      1: "Premium",
      2: "Standard",
      3: "Budget",
      4: "VIP",
    }
    return categories[categoryId] || "Unknown"
  }

  const getRegionName = (regionId: number | null) => {
    if (regionId === null) return "Not set"
    const regions: Record<number, string> = {
      1: "Downtown",
      2: "Uptown",
      3: "Midtown",
      4: "Westside",
      5: "Eastside",
    }
    return regions[regionId] || "Unknown"
  }

  const handleMappingChange = (outletId: number, salesPersonId: string) => {
    const newMappings = { ...mappings }
    newMappings[outletId] = salesPersonId === "unassigned" ? null : Number.parseInt(salesPersonId)
    setMappings(newMappings)
  }

  const getSalesPersonName = (salesPersonId: number | null) => {
    if (!salesPersonId) return null
    const salesPerson = salesPersons.find((sp) => sp.id === salesPersonId)
    return salesPerson ? salesPerson.name : null
  }

  const hasChanges = () => {
    return Object.keys(mappings).some((outletId) => {
      const outletIdNum = Number.parseInt(outletId)
      return mappings[outletIdNum] !== originalMappings[outletIdNum]
    })
  }

  const getChangedMappings = () => {
    const changes: Array<{
      outletId: number
      outletName: string
      oldSalesPerson: string | null
      newSalesPerson: string | null
    }> = []

    Object.keys(mappings).forEach((outletId) => {
      const outletIdNum = Number.parseInt(outletId)
      if (mappings[outletIdNum] !== originalMappings[outletIdNum]) {
        const outlet = outlets.find((o) => o.id === outletIdNum)
        const oldSalesPerson = getSalesPersonName(originalMappings[outletIdNum])
        const newSalesPerson = getSalesPersonName(mappings[outletIdNum])

        if (outlet) {
          changes.push({
            outletId: outletIdNum,
            outletName: outlet.name,
            oldSalesPerson,
            newSalesPerson,
          })
        }
      }
    })

    return changes
  }

  const saveMappings = async () => {
    setSaving(true)
    try {
      const changes = getChangedMappings()
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (const change of changes) {
        try {
          const salesPersonName = change.newSalesPerson

          const response = await fetch(`/api/outlets/${change.outletId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sales_person: salesPersonName,
            }),
          })

          if (response.ok) {
            successCount++
          } else {
            const errorData = await response.json()
            errors.push(`${change.outletName}: ${errorData.error || "Update failed"}`)
            errorCount++
          }
        } catch (error) {
          errors.push(`${change.outletName}: ${error instanceof Error ? error.message : "Unknown error"}`)
          errorCount++
        }
      }

      if (successCount > 0) {
        toast({
          title: "✅ Sales Mappings Updated!",
          description: `Successfully updated ${successCount} outlet${successCount > 1 ? "s" : ""}`,
          duration: 4000,
        })

        // Update original mappings to reflect saved state
        setOriginalMappings({ ...mappings })

        // Notify other components about the updates
        changes.forEach((change) => {
          localStorage.setItem(`outlet_updated_${change.outletId}`, new Date().toISOString())
          window.dispatchEvent(
            new StorageEvent("storage", {
              key: `outlet_updated_${change.outletId}`,
              newValue: new Date().toISOString(),
            }),
          )
        })

        // Refresh data to get latest state
        await fetchData()
      }

      if (errorCount > 0) {
        toast({
          title: "⚠️ Some Updates Failed",
          description: (
            <div className="space-y-1">
              <p>{errorCount} update(s) failed:</p>
              <ul className="text-sm">
                {errors.slice(0, 3).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {errors.length > 3 && <li>• ... and {errors.length - 3} more</li>}
              </ul>
            </div>
          ),
          variant: "destructive",
          duration: 8000,
        })
      }
    } catch (error) {
      console.error("Error saving mappings:", error)
      toast({
        title: "❌ Save Failed",
        description: error instanceof Error ? error.message : "Failed to save sales mappings",
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setSaving(false)
    }
  }

  // Add these functions before the return statement
  const toggleOutletSelection = (outletId: number) => {
    setSelectedOutlets((prev) => (prev.includes(outletId) ? prev.filter((id) => id !== outletId) : [...prev, outletId]))
  }

  const toggleAllOutlets = () => {
    if (selectedOutlets.length === outlets.length) {
      setSelectedOutlets([])
    } else {
      setSelectedOutlets(outlets.map((outlet) => outlet.id))
    }
  }

  const handleBulkUpdate = () => {
    setBulkDialogOpen(true)
  }

  const applyBulkUpdate = () => {
    if (bulkSalesPerson === null) return

    const newMappings = { ...mappings }
    selectedOutlets.forEach((outletId) => {
      newMappings[outletId] = bulkSalesPerson === "unassigned" ? null : Number.parseInt(bulkSalesPerson)
    })

    setMappings(newMappings)
    setBulkDialogOpen(false)
    setBulkSalesPerson(null)

    toast({
      title: "✅ Bulk Update Applied",
      description: `Updated ${selectedOutlets.length} outlet${selectedOutlets.length > 1 ? "s" : ""}. Remember to save changes.`,
      duration: 3000,
    })
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading sales mapping data...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Error Loading Data</h3>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  const changes = getChangedMappings()

  // Replace the return statement with this updated version that includes bulk actions and checkboxes
  return (
    <div className="space-y-6">
      {/* Bulk Actions and Changes Summary */}
      <Card className={hasChanges() ? "border-amber-200 bg-amber-50" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {selectedOutlets.length > 0 ? (
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="text-lg font-semibold">Bulk Actions</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedOutlets.length} outlet{selectedOutlets.length > 1 ? "s" : ""} selected
                    </p>
                  </div>
                  <Button onClick={handleBulkUpdate} variant="secondary" className="ml-2">
                    <Users className="mr-2 h-4 w-4" />
                    Assign Sales Person
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedOutlets([])} className="border-gray-200">
                    Clear Selection
                  </Button>
                </div>
              ) : hasChanges() ? (
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">Pending Changes</h3>
                  <p className="text-sm text-amber-700">
                    You have {changes.length} unsaved change{changes.length > 1 ? "s" : ""}
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold">Sales Mapping</h3>
                  <p className="text-sm text-muted-foreground">Assign sales persons to outlets</p>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              {hasChanges() && (
                <Button onClick={saveMappings} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
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
              <Button variant="outline" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        {hasChanges() && (
          <CardContent>
            <div className="space-y-2">
              {changes.slice(0, 5).map((change, index) => (
                <div key={index} className="text-sm text-amber-800">
                  <strong>{change.outletName}:</strong> {change.oldSalesPerson || "Unassigned"} →{" "}
                  {change.newSalesPerson || "Unassigned"}
                </div>
              ))}
              {changes.length > 5 && (
                <div className="text-sm text-amber-800 font-medium">...and {changes.length - 5} more changes</div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Sales Mapping Table */}
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOutlets.length === outlets.length && outlets.length > 0}
                    onCheckedChange={toggleAllOutlets}
                    aria-label="Select all outlets"
                  />
                </TableHead>
                <TableHead>Outlet Name</TableHead>
                <TableHead>Store Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Current Sales Person</TableHead>
                <TableHead>Assign Sales Person</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outlets.map((outlet) => {
                const currentMapping = mappings[outlet.id]
                const originalMapping = originalMappings[outlet.id]
                const hasChanged = currentMapping !== originalMapping
                const currentSalesPerson = getSalesPersonName(currentMapping)
                const isSelected = selectedOutlets.includes(outlet.id)

                return (
                  <TableRow
                    key={outlet.id}
                    className={`${hasChanged ? "bg-amber-50" : ""} ${isSelected ? "bg-blue-50" : ""}`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOutletSelection(outlet.id)}
                        aria-label={`Select ${outlet.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {outlet.name}
                      </div>
                    </TableCell>
                    <TableCell>{outlet.store_name || <span className="text-muted-foreground">Not set</span>}</TableCell>
                    <TableCell>
                      <Badge variant={outlet.category === "Premium" ? "default" : "secondary"}>{outlet.category}</Badge>
                    </TableCell>
                    <TableCell>{outlet.region}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {currentSalesPerson || <span className="text-muted-foreground">Unassigned</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={currentMapping?.toString() || "unassigned"}
                        onValueChange={(value) => handleMappingChange(outlet.id, value)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select sales person" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">
                            <span className="text-muted-foreground">Unassigned</span>
                          </SelectItem>
                          {salesPersons.map((salesPerson) => (
                            <SelectItem key={salesPerson.id} value={salesPerson.id.toString()}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <div>
                                  <div className="font-medium">{salesPerson.name}</div>
                                  <div className="text-xs text-muted-foreground">{salesPerson.email}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {hasChanged ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          Modified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Saved
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Bulk Update Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Assign Sales Person</DialogTitle>
            <DialogDescription>
              Assign a sales person to {selectedOutlets.length} selected outlet{selectedOutlets.length > 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkSalesPerson || ""} onValueChange={setBulkSalesPerson}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select sales person" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">
                  <span className="text-muted-foreground">Unassigned</span>
                </SelectItem>
                {salesPersons.map((salesPerson) => (
                  <SelectItem key={salesPerson.id} value={salesPerson.id.toString()}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{salesPerson.name}</div>
                        <div className="text-xs text-muted-foreground">{salesPerson.email}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyBulkUpdate} disabled={bulkSalesPerson === null}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Apply to {selectedOutlets.length} outlet{selectedOutlets.length > 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
