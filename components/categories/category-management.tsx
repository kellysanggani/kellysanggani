"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Tag, Save, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useApi } from "@/lib/hooks/use-api"
import type { Category } from "@/lib/db/database-service"

export default function CategoryManagement() {
  const { data: dbCategories, loading, error, mutate } = useApi<Category[]>("/api/categories")

  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize categories from database
  useEffect(() => {
    if (dbCategories) {
      const categoryNames = dbCategories
        .filter((cat) => cat && cat.name) // Filter out invalid categories
        .map((cat) => cat.name)
      setCategories(categoryNames)
      setHasChanges(false)
    }
  }, [dbCategories])

  const handleAddCategory = () => {
    if (!newCategory.trim()) return

    if (categories.includes(newCategory.trim())) {
      toast({
        title: "Category exists",
        description: "This category already exists.",
        variant: "destructive",
      })
      return
    }

    setCategories([...categories, newCategory.trim()])
    setNewCategory("")
    setHasChanges(true)

    toast({
      title: "Category added",
      description: `Category "${newCategory}" has been added. Don't forget to save your changes.`,
    })
  }

  const handleRemoveCategory = (category: string) => {
    if (categories.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "At least one category must exist.",
        variant: "destructive",
      })
      return
    }

    setCategories(categories.filter((c) => c !== category))
    setHasChanges(true)

    toast({
      title: "Category removed",
      description: `Category "${category}" has been removed. Don't forget to save your changes.`,
    })
  }

  const handleSaveCategories = async () => {
    setIsSaving(true)

    try {
      const response = await fetch("/api/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categories }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save categories: ${response.statusText}`)
      }

      await mutate() // Refresh the data
      setHasChanges(false)

      toast({
        title: "Categories saved",
        description: "Your categories have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving categories:", error)
      toast({
        title: "Error saving categories",
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
          <span>Loading categories...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-500">
            <p className="mb-2 font-semibold">Error loading categories</p>
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
          <Tag className="h-5 w-5" />
          Categories
        </CardTitle>
        <CardDescription>Manage outlet categories</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center gap-1">
              <Badge variant="outline">{category}</Badge>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleRemoveCategory(category)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="new-category" className="sr-only">
              New Category
            </Label>
            <Input
              id="new-category"
              placeholder="Enter new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
            />
          </div>
          <Button onClick={handleAddCategory}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSaveCategories}
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
                Save Categories
              </>
            )}
          </Button>
        </div>
      </CardContent>
      <Toaster />
    </Card>
  )
}
