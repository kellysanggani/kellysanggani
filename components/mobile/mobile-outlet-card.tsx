"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, User, Package, AlertTriangle, ChevronDown, ChevronUp, Edit } from "lucide-react"
import Link from "next/link"

interface MobileOutletCardProps {
  outlet: {
    id: number
    name: string
    category: string
    region: string
    salesPerson: string
    lastCheckDate: string
    address: string
    phone: string
    stockLevels: Array<{ product: string; quantity: number }>
  }
}

export default function MobileOutletCard({ outlet }: MobileOutletCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isOverdue = (dateString: string) => {
    const checkDate = new Date(dateString)
    const today = new Date()
    const diffTime = today.getTime() - checkDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 5
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getTotalStock = () => {
    return outlet.stockLevels.reduce((total, stock) => total + stock.quantity, 0)
  }

  const getLowStockCount = () => {
    return outlet.stockLevels.filter((stock) => stock.quantity < 50).length
  }

  return (
    <Card className={`w-full ${isOverdue(outlet.lastCheckDate) ? "border-red-500 bg-red-50" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{outlet.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={outlet.category === "Premium" ? "default" : "secondary"} className="text-xs">
                {outlet.category}
              </Badge>
              <span className="text-sm text-muted-foreground">{outlet.region}</span>
            </div>
          </div>
          {isOverdue(outlet.lastCheckDate) && <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-lg font-bold">{getTotalStock()}</div>
            <div className="text-xs text-muted-foreground">Total Stock</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-lg font-bold text-red-600">{getLowStockCount()}</div>
            <div className="text-xs text-muted-foreground">Low Stock</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className={`text-lg font-bold ${isOverdue(outlet.lastCheckDate) ? "text-red-600" : "text-green-600"}`}>
              {formatDate(outlet.lastCheckDate)}
            </div>
            <div className="text-xs text-muted-foreground">Last Check</div>
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{outlet.salesPerson}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{outlet.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{outlet.phone}</span>
            </div>

            {/* Stock Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Package className="h-4 w-4" />
                Stock Levels
              </div>
              {outlet.stockLevels.map((stock, index) => (
                <div key={index} className="flex justify-between items-center text-sm bg-muted/30 rounded p-2">
                  <span className="truncate">{stock.product}</span>
                  <span className={`font-medium ${stock.quantity < 50 ? "text-red-600" : "text-green-600"}`}>
                    {stock.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="flex-1">
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Details
              </>
            )}
          </Button>
          <Button asChild size="sm" className="flex-1">
            <Link href={`/detail/${outlet.id}/edit`}>
              <Edit className="h-4 w-4 mr-1" />
              Update
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
