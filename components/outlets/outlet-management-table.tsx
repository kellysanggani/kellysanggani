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
import { Edit, Loader2, AlertCircle, RefreshCw, Upload, Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import OutletBulkImport from "./outlet-bulk-import"

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

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Outlet name must be at least 2 characters.",
  }),
  category_id: z.number(),
  region_id: z.number(),
  store_name: z.string().nullable(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  pic_name: z.string().nullable(),
  pic_contact: z.string().nullable(),
})

export default function OutletManagementTable() {
  const [outlets, setOutlets] = useState<SafeOutlet[]>([])
  const [categories, setCategories] = useState<SafeCategory[]>([])
  const [regions, setRegions] = useState<SafeRegion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editingOutlet, setEditingOutlet] = useState<SafeOutlet | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category_id: 0,
      region_id: 0,
      store_name: null,
      address: null,
      phone: null,
      email: null,
      pic_name: null,
      pic_contact: null,
    },
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
  }, [])

  const handleEdit = (outlet: SafeOutlet) => {
    setEditingOutlet(outlet)
    form.reset({
      name: outlet.name || "",
      category_id: outlet.category_id || 0,
      region_id: outlet.region_id || 0,
      store_name: outlet.store_name || null,
      address: outlet.address || null,
      phone: outlet.phone || null,
      email: outlet.email || null,
      pic_name: outlet.pic_name || null,
      pic_contact: outlet.pic_contact || null,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingOutlet) return

    // Validate required fields
    if (!form.getValues("name").trim()) {
      toast({
        title: "❌ Validation Error",
        description: "Outlet name is required.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    setIsSaving(true)
    try {
      // Prepare data for API call
      const updateData = {
        name: form.getValues("name").trim(),
        category_id: form.getValues("category_id") === 0 ? null : form.getValues("category_id"),
        region_id: form.getValues("region_id") === 0 ? null : form.getValues("region_id"),
        store_name: form.getValues("store_name")?.trim() || null,
        address: form.getValues("address")?.trim() || null,
        phone: form.getValues("phone")?.trim() || null,
        email: form.getValues("email")?.trim() || null,
        pic_name: form.getValues("pic_name")?.trim() || null,
        pic_contact: form.getValues("pic_contact")?.trim() || null,
      }

      console.log("Sending update data:", updateData)

      const response = await fetch(`/api/outlets/${editingOutlet.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const responseData = await response.json()
      console.log("API Response:", responseData)

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details?.[0] || "Failed to update outlet")
      }

      toast({
        title: "✅ Success!",
        description: "Outlet has been updated successfully.",
        duration: 4000,
      })

      // After the successful toast message, add:
      // Notify other components about the update
      localStorage.setItem(`outlet_updated_${editingOutlet.id}`, new Date().toISOString())
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: `outlet_updated_${editingOutlet.id}`,
          newValue: new Date().toISOString(),
        }),
      )

      // Also trigger a custom event for same-page components
      window.dispatchEvent(
        new CustomEvent("outletUpdated", {
          detail: { outletId: editingOutlet.id },
        }),
      )

      // Refresh the data
      await fetchData()
      setIsDialogOpen(false)
      setEditingOutlet(null)
    } catch (error) {
      console.error("Error updating outlet:", error)
      toast({
        title: "❌ Update Failed",
        description: error instanceof Error ? error.message : "Failed to update outlet information.",
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreate = () => {
    // TODO: Implement create outlet functionality
    console.log("Create outlet clicked")
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

  if (!outlets || outlets.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p>No outlets found.</p>
          <Button onClick={fetchData} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Outlets ({outlets.length})</h3>
        <div className="flex gap-2">
          <Button onClick={() => setIsBulkImportOpen(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Outlet
          </Button>
        </div>
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
              {outlets.map((outlet) => (
                <TableRow key={outlet.id}>
                  <TableCell className="font-medium">{outlet.name}</TableCell>
                  <TableCell>{outlet.store_name || <span className="text-muted-foreground">Not set</span>}</TableCell>
                  <TableCell>
                    <Badge variant={outlet.category === "Premium" ? "default" : "secondary"}>{outlet.category}</Badge>
                  </TableCell>
                  <TableCell>{outlet.region}</TableCell>
                  <TableCell>{outlet.pic_name || <span className="text-muted-foreground">Not set</span>}</TableCell>
                  <TableCell>{outlet.pic_contact || <span className="text-muted-foreground">Not set</span>}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(outlet)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Outlet</DialogTitle>
            <DialogDescription>Update outlet information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Outlet Name</Label>
              <Input id="name" {...form.register("name")} placeholder="Outlet Name" />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input id="storeName" {...form.register("store_name")} placeholder="Optional store name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...form.register("address")} placeholder="Full address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...form.register("phone")} placeholder="+1 (555) 123-4567" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register("email")} placeholder="outlet@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="picName">PIC Name</Label>
                <Input id="picName" {...form.register("pic_name")} placeholder="Person in charge name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="picContact">PIC Contact</Label>
                <Input id="picContact" {...form.register("pic_contact")} placeholder="+1 (555) 123-4567" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={(value) => form.setValue("category_id", Number.parseInt(value))}
                  defaultValue={form.getValues("category_id").toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
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
                  onValueChange={(value) => form.setValue("region_id", Number.parseInt(value))}
                  defaultValue={form.getValues("region_id").toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
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
            <Button type="submit" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OutletBulkImport
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={fetchData}
        categories={categories}
        regions={regions}
      />

      <Toaster />
    </div>
  )
}
