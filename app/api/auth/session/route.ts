import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error("Session retrieval error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
