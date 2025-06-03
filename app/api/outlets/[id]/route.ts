import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid outlet ID" }, { status: 400 })
    }

    const result = await sql`
      SELECT * FROM outlets WHERE id = ${id}
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Outlet not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching outlet:", error)
    return NextResponse.json({ error: "Failed to fetch outlet" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid outlet ID" }, { status: 400 })
    }

    const body = await request.json()
    const { last_check_date, last_updated_by, pic_name, pic_contact } = body

    const result = await sql`
      UPDATE outlets 
      SET 
        last_check_date = ${last_check_date},
        last_updated_by = ${last_updated_by},
        pic_name = ${pic_name},
        pic_contact = ${pic_contact},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Outlet not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error updating outlet:", error)
    return NextResponse.json({ error: "Failed to update outlet" }, { status: 500 })
  }
}
