"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, FileText, AlertCircle, CheckCircle, X, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BulkImportProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  categories: Array<{ id: number; name: string }>
  regions: Array<{ id: number; name: string }>
}

interface ParsedOutlet {
  name: string
  store_name?: string
  address?: string
  phone?: string
  email?: string
  pic_name?: string
  pic_contact?: string
  category?: string
  region?: string
  category_id?: number
  region_id?: number
  errors: string[]
  isValid: boolean
}

export default function OutletBulkImport({ isOpen, onClose, onSuccess, categories, regions }: BulkImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedOutlet[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [step, setStep] = useState<"upload" | "preview" | "complete">("upload")

  const downloadTemplate = () => {
    const csvContent = [
      "name,store_name,address,phone,email,pic_name,pic_contact,category,region",
      'Cinema Downtown,Downtown Store,"123 Main St, City",+1-555-0123,downtown@cinema.com,John Doe,+1-555-0124,Premium,North',
      'Cinema Mall,Mall Location,"456 Mall Ave, City",+1-555-0125,mall@cinema.com,Jane Smith,+1-555-0126,Standard,South',
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "outlet_import_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "📥 Template Downloaded",
      description: "CSV template has been downloaded to your computer.",
      duration: 3000,
    })
  }

  const parseCSV = (csvText: string): ParsedOutlet[] => {
    const lines = csvText.split("\n").filter((line) => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    const data: ParsedOutlet[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      if (values.length === 0) continue

      const outlet: ParsedOutlet = {
        name: "",
        errors: [],
        isValid: true,
      }

      headers.forEach((header, index) => {
        const value = values[index]?.trim().replace(/"/g, "") || ""

        switch (header.toLowerCase()) {
          case "name":
            outlet.name = value
            break
          case "store_name":
            outlet.store_name = value || undefined
            break
          case "address":
            outlet.address = value || undefined
            break
          case "phone":
            outlet.phone = value || undefined
            break
          case "email":
            outlet.email = value || undefined
            break
          case "pic_name":
            outlet.pic_name = value || undefined
            break
          case "pic_contact":
            outlet.pic_contact = value || undefined
            break
          case "category":
            outlet.category = value || undefined
            break
          case "region":
            outlet.region = value || undefined
            break
        }
      })

      // Validate required fields
      if (!outlet.name) {
        outlet.errors.push("Name is required")
        outlet.isValid = false
      }

      // Validate email format
      if (outlet.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(outlet.email)) {
        outlet.errors.push("Invalid email format")
        outlet.isValid = false
      }

      // Map category name to ID
      if (outlet.category) {
        const category = categories.find((c) => c.name.toLowerCase() === outlet.category?.toLowerCase())
        if (category) {
          outlet.category_id = category.id
        } else {
          outlet.errors.push(`Category "${outlet.category}" not found`)
          outlet.isValid = false
        }
      }

      // Map region name to ID
      if (outlet.region) {
        const region = regions.find((r) => r.name.toLowerCase() === outlet.region?.toLowerCase())
        if (region) {
          outlet.region_id = region.id
        } else {
          outlet.errors.push(`Region "${outlet.region}" not found`)
          outlet.isValid = false
        }
      }

      data.push(outlet)
    }

    return data
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current)
        current = ""
      } else {
        current += char
      }
    }

    result.push(current)
    return result
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith(".csv")) {
      toast({
        title: "❌ Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    setFile(selectedFile)
    setIsProcessing(true)

    try {
      const text = await selectedFile.text()
      const parsed = parseCSV(text)

      if (parsed.length === 0) {
        throw new Error("No valid data found in CSV file")
      }

      setParsedData(parsed)
      setStep("preview")

      toast({
        title: "📊 File Processed",
        description: `Found ${parsed.length} outlets to import.`,
        duration: 3000,
      })
    } catch (error) {
      console.error("Error parsing CSV:", error)
      toast({
        title: "❌ Parse Error",
        description: error instanceof Error ? error.message : "Failed to parse CSV file.",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async () => {
    const validOutlets = parsedData.filter((outlet) => outlet.isValid)

    if (validOutlets.length === 0) {
      toast({
        title: "❌ No Valid Data",
        description: "No valid outlets to import. Please fix the errors first.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    setIsImporting(true)

    try {
      let successCount = 0
      let errorCount = 0

      for (const outlet of validOutlets) {
        try {
          const response = await fetch("/api/outlets", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: outlet.name,
              store_name: outlet.store_name,
              address: outlet.address,
              phone: outlet.phone,
              email: outlet.email,
              pic_name: outlet.pic_name,
              pic_contact: outlet.pic_contact,
              category_id: outlet.category_id,
              region_id: outlet.region_id,
            }),
          })

          if (response.ok) {
            successCount++
          } else {
            errorCount++
            console.error(`Failed to import outlet: ${outlet.name}`)
          }
        } catch (error) {
          errorCount++
          console.error(`Error importing outlet ${outlet.name}:`, error)
        }
      }

      setStep("complete")

      if (successCount > 0) {
        toast({
          title: "✅ Import Complete",
          description: `Successfully imported ${successCount} outlets${errorCount > 0 ? `, ${errorCount} failed` : ""}.`,
          duration: 5000,
        })
        onSuccess()
      } else {
        toast({
          title: "❌ Import Failed",
          description: "No outlets were imported successfully.",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "❌ Import Error",
        description: "An error occurred during import.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsImporting(false)
    }
  }

  const resetImport = () => {
    setFile(null)
    setParsedData([])
    setStep("upload")
  }

  const validCount = parsedData.filter((outlet) => outlet.isValid).length
  const errorCount = parsedData.filter((outlet) => !outlet.isValid).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Outlets</DialogTitle>
          <DialogDescription>Import multiple outlets from a CSV file</DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Template
                </CardTitle>
                <CardDescription>Download the CSV template to see the required format</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={downloadTemplate} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload CSV File
                </CardTitle>
                <CardDescription>Select your CSV file containing outlet data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="csv-file">CSV File</Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={isProcessing}
                    />
                  </div>

                  {isProcessing && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing file...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>CSV Format Requirements:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>First row must contain headers</li>
                  <li>Required column: name</li>
                  <li>Optional columns: store_name, address, phone, email, pic_name, pic_contact, category, region</li>
                  <li>Category and region names must match existing ones</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {validCount} Valid
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="outline" className="text-red-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errorCount} Errors
                  </Badge>
                )}
              </div>
              <Button onClick={resetImport} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            </div>

            <div className="border rounded-lg max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Store Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((outlet, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {outlet.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{outlet.name}</TableCell>
                      <TableCell>{outlet.store_name || "-"}</TableCell>
                      <TableCell>{outlet.category || "-"}</TableCell>
                      <TableCell>{outlet.region || "-"}</TableCell>
                      <TableCell>
                        {outlet.errors.length > 0 && (
                          <div className="text-sm text-red-600">{outlet.errors.join(", ")}</div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {errorCount > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorCount} outlets have errors and will be skipped during import. Only {validCount} valid outlets
                  will be imported.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === "complete" && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Import Complete!</h3>
              <p className="text-muted-foreground">Your outlets have been imported successfully.</p>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          )}

          {step === "preview" && (
            <>
              <Button onClick={resetImport} variant="outline">
                Back
              </Button>
              <Button onClick={handleImport} disabled={validCount === 0 || isImporting}>
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${validCount} Outlets`
                )}
              </Button>
            </>
          )}

          {step === "complete" && <Button onClick={onClose}>Close</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
