import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/db/database-service"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Instead of using request.url which causes dynamic server usage error,
    // we'll return all audit trail entries
    const auditTrail = DatabaseService.getAuditTrail()
    return NextResponse.json(auditTrail)
  } catch (error) {
    console.error("Error fetching audit trail:", error)
    return NextResponse.json({ error: "Failed to fetch audit trail" }, { status: 500 })
  }
}
