"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Loader2, AlertCircle, RefreshCw, Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Define safe interfaces
interface SafeOutlet {
  id: number
  name: string
  category_id: number | null
  region_id: number | null
  store_name: string | null
  address: string | null
  phone: string | null
  email: string | null
  pic_name: string | null
  pic_contact: string | null
  category?: string
  region?: string
}

interface SafeCategory {
  id: number
  name: string
}

interface SafeRegion {
  id: number
  name: string
}

export default function OutletManagementTable() {
  const [outlets, setOutlets] = useState<SafeOutlet[]>([])
  const [categories, setCategories] = useState<SafeCategory[]>([])
  const [regions, setRegions] = useState<SafeRegion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editingOutlet, setEditingOutlet] = useState<SafeOutlet | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    category_id: 0,
    region_id: 0,
    store_name: "",
    address: "",
    phone: "",
    email: "",
    pic_name: "",
    pic_contact: "",
  })

  // Fetch data with comprehensive error handling
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching outlets, categories, and regions...")

      // Fetch all data in parallel with individual error handling
      const [outletsResponse, categoriesResponse, regionsResponse] = await Promise.allSettled([
        fetch("/api/outlets"),
        fetch("/api/categories"),
        fetch("/api/regions"),
      ])

      // Process outlets
      let outletsData: any[] = []
      if (outletsResponse.status === "fulfilled" && outletsResponse.value.ok) {
        const data = await outletsResponse.value.json()
        outletsData = Array.isArray(data) ? data : []
        console.log("Fetched outlets:", outletsData)
      } else {
        console.error("Failed to fetch outlets:", outletsResponse)
      }

      // Process categories
      let categoriesData: any[] = []
      if (categoriesResponse.status === "fulfilled" && categoriesResponse.value.ok) {
        const data = await categoriesResponse.value.json()
        categoriesData = Array.isArray(data) ? data : []
        console.log("Fetched categories:", categoriesData)
      } else {
        console.error("Failed to fetch categories:", categoriesResponse)
      }

      // Process regions
      let regionsData: any[] = []
      if (regionsResponse.status === "fulfilled" && regionsResponse.value.ok) {
        const data = await regionsResponse.value.json()
        regionsData = Array.isArray(data) ? data : []
        console.log("Fetched regions:", regionsData)
      } else {
        console.error("Failed to fetch regions:", regionsResponse)
      }

      // Create lookup maps safely
      const categoryMap: Record<number, string> = {}
      if (Array.isArray(categoriesData)) {
        categoriesData.forEach((cat) => {
          if (cat && typeof cat.id === "number" && typeof cat.name === "string") {
            categoryMap[cat.id] = cat.name
          }
        })
      }

      const regionMap: Record<number, string> = {}
      if (Array.isArray(regionsData)) {
        regionsData.forEach((reg) => {
          if (reg && typeof reg.id === "number" && typeof reg.name === "string") {
            regionMap[reg.id] = reg.name
          }
        })
      }

      // Process and enrich outlets data safely
      const safeOutlets: SafeOutlet[] = []
      if (Array.isArray(outletsData)) {
        outletsData.forEach((outlet) => {
          try {
            if (outlet && typeof outlet.id === "number" && typeof outlet.name === "string") {
              safeOutlets.push({
                id: outlet.id,
                name: outlet.name || "Unknown Outlet",
                category_id: typeof outlet.category_id === "number" ? outlet.category_id : null,
                region_id: typeof outlet.region_id === "number" ? outlet.region_id : null,
                store_name: outlet.store_name || null,
                address: outlet.address || null,
                phone: outlet.phone || null,
                email: outlet.email || null,
                pic_name: outlet.pic_name || null,
                pic_contact: outlet.pic_contact || null,
                category: outlet.category_id ? categoryMap[outlet.category_id] || "Unknown" : "Not set",
                region: outlet.region_id ? regionMap[outlet.region_id] || "Unknown" : "Not set",
              })
            }
          } catch (outletError) {
            console.error("Error processing outlet:", outlet, outletError)
          }
        })
      }

      const safeCategories: SafeCategory[] = []
      if (Array.isArray(categoriesData)) {
        categoriesData.forEach((cat) => {
          try {
            if (cat && typeof cat.id === "number" && typeof cat.name === "string") {
              safeCategories.push({
                id: cat.id,
                name: cat.name,
              })
            }
          } catch (catError) {
            console.error("Error processing category:", cat, catError)
          }
        })
      }

      const safeRegions: SafeRegion[] = []
      if (Array.isArray(regionsData)) {
        regionsData.forEach((reg) => {
          try {
            if (reg && typeof reg.id === "number" && typeof reg.name === "string") {
              safeRegions.push({
                id: reg.id,
                name: reg.name,
              })
            }
          } catch (regError) {
            console.error("Error processing region:", reg, regError)
          }
        })
      }

      setOutlets(safeOutlets)
      setCategories(safeCategories)
      setRegions(safeRegions)

      console.log("Data processing complete:", {
        outlets: safeOutlets.length,
        categories: safeCategories.length,
        regions: safeRegions.length,
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

    // Listen for category/region updates
    const handleCategoriesUpdated = () => {
      console.log("Categories updated, refreshing data...")
      fetchData()
    }

    const handleRegionsUpdated = () => {
      console.log("Regions updated, refreshing data...")
      fetchData()
    }

    window.addEventListener("categoriesUpdated", handleCategoriesUpdated)
    window.addEventListener("regionsUpdated", handleRegionsUpdated)

    return () => {
      window.removeEventListener("categoriesUpdated", handleCategoriesUpdated)
      window.removeEventListener("regionsUpdated", handleRegionsUpdated)
    }
  }, [])

  const handleEdit = (outlet: SafeOutlet) => {
    setEditingOutlet(outlet)
    setIsCreateMode(false)
    setFormData({
      name: outlet.name || "",
      category_id: outlet.category_id || 0,
      region_id: outlet.region_id || 0,
      store_name: outlet.store_name || "",
      address: outlet.address || "",
      phone: outlet.phone || "",
      email: outlet.email || "",
      pic_name: outlet.pic_name || "",
      pic_contact: outlet.pic_contact || "",
    })
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingOutlet(null)
    setIsCreateMode(true)
    setFormData({
      name: "",
      category_id: 0,
      region_id: 0,
      store_name: "",
      address: "",
      phone: "",
      email: "",
      pic_name: "",
      pic_contact: "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const url = isCreateMode ? "/api/outlets" : `/api/outlets/${editingOutlet?.id}`
      const method = isCreateMode ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isCreateMode ? "create" : "update"} outlet`)
      }

      toast({
        title: `✅ Outlet ${isCreateMode ? "Created" : "Updated"} Successfully!`,
        description: `Outlet information has been successfully ${isCreateMode ? "created" : "updated"}.`,
        duration: 4000,
      })

      // Refresh the data
      await fetchData()
      setIsDialogOpen(false)
      setEditingOutlet(null)
    } catch (error) {
      console.error(`Error ${isCreateMode ? "creating" : "updating"} outlet:`, error)
      toast({
        title: `❌ ${isCreateMode ? "Creation" : "Update"} Failed`,
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isCreateMode ? "create" : "update"} outlet information.`,
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading outlets...</span>
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
            <h3 className="text-lg font-semibold">Error Loading Outlets</h3>
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Outlets ({outlets.length})</h3>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Outlet
        </Button>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Outlet Name</TableHead>
                <TableHead>Store Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>PIC Name</TableHead>
                <TableHead>PIC Contact</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outlets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No outlets found. Click "Add Outlet" to create your first outlet.
                  </TableCell>
                </TableRow>
              ) : (
                outlets.map((outlet) => (
                  <TableRow key={outlet.id}>
                    <TableCell className="font-medium">{outlet.name}</TableCell>
                    <TableCell>{outlet.store_name || <span className="text-muted-foreground">Not set</span>}</TableCell>
                    <TableCell>
                      <Badge variant={outlet.category === "Premium" ? "default" : "secondary"}>{outlet.category}</Badge>
                    </TableCell>
                    <TableCell>{outlet.region}</TableCell>
                    <TableCell>{outlet.pic_name || <span className="text-muted-foreground">Not set</span>}</TableCell>
                    <TableCell>
                      {outlet.pic_contact || <span className="text-muted-foreground">Not set</span>}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(outlet)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreateMode ? "Create New Outlet" : "Edit Outlet"}</DialogTitle>
            <DialogDescription>
              {isCreateMode ? "Enter outlet information to create a new outlet." : "Update outlet information."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Outlet Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter outlet name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                placeholder="Optional store name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="outlet@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="picName">PIC Name</Label>
                <Input
                  id="picName"
                  value={formData.pic_name}
                  onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                  placeholder="Person in charge name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="picContact">PIC Contact</Label>
                <Input
                  id="picContact"
                  value={formData.pic_contact}
                  onChange={(e) => setFormData({ ...formData, pic_contact: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id.toString()}
                  onValueChange={(value) => setFormData({ ...formData, category_id: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No category</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={formData.region_id.toString()}
                  onValueChange={(value) => setFormData({ ...formData, region_id: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No region</SelectItem>
                    {regions?.map((region) => (
                      <SelectItem key={region.id} value={region.id.toString()}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSave} disabled={isSaving || !formData.name.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreateMode ? "Creating..." : "Saving..."}
                </>
              ) : isCreateMode ? (
                "Create Outlet"
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
