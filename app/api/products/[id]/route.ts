import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const result = await sql`
      SELECT * FROM products WHERE id = ${id}
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const body = await request.json()
    const { expiration_date, availability, barcode } = body

    const result = await sql`
      UPDATE products 
      SET 
        expiration_date = ${expiration_date},
        availability = ${availability},
        barcode = ${barcode},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}
