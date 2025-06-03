"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardCharts() {
  return (
    <Tabs defaultValue="stores" className="space-y-4">
      <TabsList>
        <TabsTrigger value="stores">Store Checks</TabsTrigger>
        <TabsTrigger value="orders">PO Issues</TabsTrigger>
      </TabsList>
      <TabsContent value="stores" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Store Checks</CardTitle>
            <CardDescription>Number of stores checked per week in the current month</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <WeeklyStoreChecksChart />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="orders" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Weekly PO Issues</CardTitle>
            <CardDescription>Number of purchase orders issued per week in the current month</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <WeeklyPOChart />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

function WeeklyStoreChecksChart() {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-1 items-end gap-2">
        <div className="relative flex h-full w-1/4 flex-col justify-end">
          <div className="absolute bottom-0 w-full">
            <div className="bg-primary h-[40%] w-full rounded-t-md"></div>
            <div className="mt-2 text-center text-xs">Week 1</div>
          </div>
        </div>
        <div className="relative flex h-full w-1/4 flex-col justify-end">
          <div className="absolute bottom-0 w-full">
            <div className="bg-primary h-[60%] w-full rounded-t-md"></div>
            <div className="mt-2 text-center text-xs">Week 2</div>
          </div>
        </div>
        <div className="relative flex h-full w-1/4 flex-col justify-end">
          <div className="absolute bottom-0 w-full">
            <div className="bg-primary h-[75%] w-full rounded-t-md"></div>
            <div className="mt-2 text-center text-xs">Week 3</div>
          </div>
        </div>
        <div className="relative flex h-full w-1/4 flex-col justify-end">
          <div className="absolute bottom-0 w-full">
            <div className="bg-primary h-[90%] w-full rounded-t-md"></div>
            <div className="mt-2 text-center text-xs">Week 4</div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-between">
        <div className="text-sm text-muted-foreground">15 stores</div>
        <div className="text-sm text-muted-foreground">78 stores total</div>
      </div>
    </div>
  )
}

function WeeklyPOChart() {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-1 items-end gap-2">
        <div className="relative flex h-full w-1/4 flex-col justify-end">
          <div className="absolute bottom-0 w-full">
            <div className="bg-primary h-[30%] w-full rounded-t-md"></div>
            <div className="mt-2 text-center text-xs">Week 1</div>
          </div>
        </div>
        <div className="relative flex h-full w-1/4 flex-col justify-end">
          <div className="absolute bottom-0 w-full">
            <div className="bg-primary h-[45%] w-full rounded-t-md"></div>
            <div className="mt-2 text-center text-xs">Week 2</div>
          </div>
        </div>
        <div className="relative flex h-full w-1/4 flex-col justify-end">
          <div className="absolute bottom-0 w-full">
            <div className="bg-primary h-[55%] w-full rounded-t-md"></div>
            <div className="mt-2 text-center text-xs">Week 3</div>
          </div>
        </div>
        <div className="relative flex h-full w-1/4 flex-col justify-end">
          <div className="absolute bottom-0 w-full">
            <div className="bg-primary h-[70%] w-full rounded-t-md"></div>
            <div className="mt-2 text-center text-xs">Week 4</div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-between">
        <div className="text-sm text-muted-foreground">8 POs</div>
        <div className="text-sm text-muted-foreground">42 POs total</div>
      </div>
    </div>
  )
}
