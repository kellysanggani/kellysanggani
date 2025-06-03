"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Loader2, Database, AlertTriangle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function DataManagement() {
  const [isClearing, setIsClearing] = useState(false)

  const handleClearAllData = async () => {
    setIsClearing(true)

    try {
      const response = await fetch("/api/database/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to clear data")
      }

      toast({
        title: "✅ Data Cleared Successfully",
        description: "All data has been removed from the database. You can now start fresh.",
        duration: 5000,
      })

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Error clearing data:", error)
      toast({
        title: "❌ Failed to Clear Data",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Management
        </CardTitle>
        <CardDescription>Manage your application data and perform maintenance operations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 mb-2">Clear All Data</h4>
              <p className="text-sm text-red-700 mb-4">
                This will permanently delete all outlets, products, stock levels, categories, regions, and audit trails.
                This action cannot be undone and is useful for testing with fresh data.
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isClearing}>
                    {isClearing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Clearing Data...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All Data
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>All outlets and their information</li>
                        <li>All products and stock levels</li>
                        <li>All categories and regions</li>
                        <li>All audit trail records</li>
                        <li>All product mappings</li>
                      </ul>
                      <br />
                      <strong>Only the admin user account will be preserved.</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAllData} className="bg-red-600 hover:bg-red-700">
                      Yes, clear all data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-800 mb-2">Getting Started</h4>
              <p className="text-sm text-blue-700">After clearing data, you can start fresh by:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-blue-700">
                <li>Creating categories and regions in the Categories & Regions page</li>
                <li>Adding outlets in the Outlet Management page</li>
                <li>Setting up products in the Product Settings page</li>
                <li>Managing stock levels for each outlet</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
      <Toaster />
    </Card>
  )
}
