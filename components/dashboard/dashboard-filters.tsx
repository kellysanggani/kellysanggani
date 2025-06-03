"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

export default function DashboardFilters() {
  const [month, setMonth] = useState("june")
  const [week, setWeek] = useState("all")

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="grid gap-1">
          <p className="text-sm font-medium">Filter by</p>
        </div>
        <div className="flex flex-1 items-center gap-4">
          <div className="grid gap-1">
            <p className="text-sm text-muted-foreground">Month</p>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="january">January</SelectItem>
                <SelectItem value="february">February</SelectItem>
                <SelectItem value="march">March</SelectItem>
                <SelectItem value="april">April</SelectItem>
                <SelectItem value="may">May</SelectItem>
                <SelectItem value="june">June</SelectItem>
                <SelectItem value="july">July</SelectItem>
                <SelectItem value="august">August</SelectItem>
                <SelectItem value="september">September</SelectItem>
                <SelectItem value="october">October</SelectItem>
                <SelectItem value="november">November</SelectItem>
                <SelectItem value="december">December</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <p className="text-sm text-muted-foreground">Week</p>
            <Select value={week} onValueChange={setWeek}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                <SelectItem value="week1">Week 1</SelectItem>
                <SelectItem value="week2">Week 2</SelectItem>
                <SelectItem value="week3">Week 3</SelectItem>
                <SelectItem value="week4">Week 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  )
}
