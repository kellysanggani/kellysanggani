import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db/database-service"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get("entityType") || undefined
    const entityId = searchParams.get("entityId") ? Number.parseInt(searchParams.get("entityId")!) : undefined

    const auditTrail = DatabaseService.getAuditTrail(entityType, entityId)
    return NextResponse.json(auditTrail)
  } catch (error) {
    console.error("Error fetching audit trail:", error)
    return NextResponse.json({ error: "Failed to fetch audit trail" }, { status: 500 })
  }
}
