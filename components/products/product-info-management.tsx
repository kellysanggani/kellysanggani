"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Edit, Loader2, Package, RefreshCw, ScanLine } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Product {
  id: number
  name: string
  category_id?: number
  supplier?: string
  barcode?: string
  box_unit?: string
  expiration_details?: string
  low_threshold?: number
  critical_threshold?: number
  created_at: string
  updated_at: string
}

interface Category {
  id: number
  name: string
}

export default function ProductInfoManagement() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    supplier: "",
    barcode: "",
    box_unit: "",
    expiration_details: "",
    low_threshold: "",
    critical_threshold: "",
  })

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([fetch("/api/products"), fetch("/api/categories")])

        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData)
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || "",
      category_id: product.category_id?.toString() || "0",
      supplier: product.supplier || "",
      barcode: product.barcode || "",
      box_unit: product.box_unit || "",
      expiration_details: product.expiration_details || "",
      low_threshold: product.low_threshold?.toString() || "",
      critical_threshold: product.critical_threshold?.toString() || "",
    })
  }

  const handleSave = async () => {
    if (!editingProduct) return

    setSaving(true)
    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          category_id: formData.category_id ? Number.parseInt(formData.category_id) : null,
          low_threshold: formData.low_threshold ? Number.parseInt(formData.low_threshold) : null,
          critical_threshold: formData.critical_threshold ? Number.parseInt(formData.critical_threshold) : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      const updatedProduct = await response.json()
      setProducts(products.map((p) => (p.id === editingProduct.id ? updatedProduct : p)))
      setEditingProduct(null)

      toast({
        title: "Success",
        description: "Product updated successfully.",
      })
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      category_id: "0",
      supplier: "",
      barcode: "",
      box_unit: "",
      expiration_details: "",
      low_threshold: "",
      critical_threshold: "",
    })
  }

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return "Uncategorized"
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || "Unknown"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading products...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Information Management
          </CardTitle>
          <CardDescription>Manage product details, categories, and inventory thresholds</CardDescription>
        </CardHeader>
        <CardContent>
          {editingProduct ? (
            <div className="space-y-4">
              <Alert>
                <Edit className="h-4 w-4" />
                <AlertTitle>Editing Product</AlertTitle>
                <AlertDescription>You are currently editing: {editingProduct.name}</AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Enter supplier name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="Enter or scan barcode"
                    />
                    <Button type="button" variant="outline" size="icon">
                      <ScanLine className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="box_unit">Box Unit</Label>
                  <Input
                    id="box_unit"
                    value={formData.box_unit}
                    onChange={(e) => setFormData({ ...formData, box_unit: e.target.value })}
                    placeholder="e.g., 24 pcs/box"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="low_threshold">Low Stock Threshold</Label>
                  <Input
                    id="low_threshold"
                    type="number"
                    value={formData.low_threshold}
                    onChange={(e) => setFormData({ ...formData, low_threshold: e.target.value })}
                    placeholder="Enter minimum stock level"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="critical_threshold">Critical Stock Threshold</Label>
                  <Input
                    id="critical_threshold"
                    type="number"
                    value={formData.critical_threshold}
                    onChange={(e) => setFormData({ ...formData, critical_threshold: e.target.value })}
                    placeholder="Enter critical stock level"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiration_details">Expiration Details</Label>
                <Textarea
                  id="expiration_details"
                  value={formData.expiration_details}
                  onChange={(e) => setFormData({ ...formData, expiration_details: e.target.value })}
                  placeholder="Enter expiration information, storage requirements, etc."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Click on a product to edit its information</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>

              <div className="grid gap-4">
                {products.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Products Found</AlertTitle>
                    <AlertDescription>
                      No products are available. Add products through the Product Settings page.
                    </AlertDescription>
                  </Alert>
                ) : (
                  products.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEdit(product)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-medium">{product.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary">{getCategoryName(product.category_id)}</Badge>
                              {product.supplier && <span>Supplier: {product.supplier}</span>}
                              {product.barcode && <span>Barcode: {product.barcode}</span>}
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div>Box Unit: {product.box_unit || "Not set"}</div>
                            <div className="flex gap-2">
                              {product.low_threshold && <Badge variant="outline">Low: {product.low_threshold}</Badge>}
                              {product.critical_threshold && (
                                <Badge variant="destructive">Critical: {product.critical_threshold}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
