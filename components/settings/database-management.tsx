"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Download, Upload, Database, AlertTriangle, Check, Loader2, RefreshCw, FileJson } from "lucide-react"

interface DatabaseStats {
  outlets: number
  products: number
  stockLevels: number
  mappings: number
  auditEntries: number
  categories: number
  regions: number
  users: number
}

interface ValidationResult {
  isValid: boolean
  issues: string[]
  warnings: string[]
}

export default function DatabaseManagement() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch database statistics and validation
  const fetchDatabaseInfo = async () => {
    setIsValidating(true)
    try {
      const response = await fetch("/api/sync", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setValidation(data.validation)
      } else {
        throw new Error(data.error || "Failed to fetch database info")
      }
    } catch (error) {
      console.error("Error fetching database info:", error)
      toast({
        title: "Error",
        description: "Failed to fetch database information.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  // Handle export to SQLite
  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Trigger the export
      const response = await fetch("/api/database/export")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Database exported successfully.",
        })

        // Trigger download
        window.location.href = "/api/database/export"
      } else {
        throw new Error(data.error || "Export failed")
      }
    } catch (error) {
      console.error("Error exporting database:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export the database.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Handle export to JSON
  const handleExportJSON = async () => {
    setIsExporting(true)

    try {
      const response = await fetch("/api/sync")
      const data = await response.json()

      if (data.success) {
        // Create and download JSON file
        const jsonData = JSON.stringify(data.data, null, 2)
        const blob = new Blob([jsonData], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `database-export-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Success",
          description: "Database exported to JSON successfully.",
        })
      } else {
        throw new Error(data.error || "Export failed")
      }
    } catch (error) {
      console.error("Error exporting to JSON:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export the database to JSON.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Handle import
  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a database file to import.",
        variant: "destructive",
      })
      return
    }

    if (!selectedFile.name.endsWith(".db")) {
      toast({
        title: "Invalid File",
        description: "Please select a valid SQLite database file (.db).",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/database/import", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Database imported successfully. The page will reload.",
        })

        // Reset the file input
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        throw new Error(data.error || "Import failed")
      }
    } catch (error) {
      console.error("Error importing database:", error)
      toast({
        title: "Import Failed",
        description: "Failed to import the database.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Database Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Overview
          </CardTitle>
          <CardDescription>Current database statistics and health status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Database Status</span>
            <Button variant="outline" size="sm" onClick={fetchDatabaseInfo} disabled={isValidating}>
              {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.outlets}</div>
                <div className="text-sm text-muted-foreground">Outlets</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.products}</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.stockLevels}</div>
                <div className="text-sm text-muted-foreground">Stock Levels</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.auditEntries}</div>
                <div className="text-sm text-muted-foreground">Audit Entries</div>
              </div>
            </div>
          )}

          {validation && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Database Health:</span>
                <Badge variant={validation.isValid ? "default" : "destructive"}>
                  {validation.isValid ? "Healthy" : "Issues Found"}
                </Badge>
              </div>

              {validation.issues.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Database Issues</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.issues.map((issue, index) => (
                        <li key={index} className="text-sm">
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validation.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warnings</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.warnings.map((warning, index) => (
                        <li key={index} className="text-sm">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Database
          </CardTitle>
          <CardDescription>Export the database for backup or migration purposes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              {isExporting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Database className="h-6 w-6" />}
              <div className="text-center">
                <div className="font-medium">Export SQLite</div>
                <div className="text-xs text-muted-foreground">Complete database file</div>
              </div>
            </Button>

            <Button
              onClick={handleExportJSON}
              disabled={isExporting}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              {isExporting ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileJson className="h-6 w-6" />}
              <div className="text-center">
                <div className="font-medium">Export JSON</div>
                <div className="text-xs text-muted-foreground">Data only format</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Database
          </CardTitle>
          <CardDescription>Import a database file to replace the current database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Importing a database will overwrite all existing data. This action cannot be undone. A backup of the
              current database will be created automatically before import.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="database-file">Select Database File</Label>
            <Input
              id="database-file"
              type="file"
              accept=".db"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>{selectedFile.name} selected</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleImport}
            disabled={isImporting || !selectedFile}
            variant="destructive"
            className="w-full sm:w-auto"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Database
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-start border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Database backups are stored locally and exports can be downloaded as SQLite (.db) or JSON files.
          </p>
        </CardFooter>
      </Card>

      <Toaster />
    </div>
  )
}
