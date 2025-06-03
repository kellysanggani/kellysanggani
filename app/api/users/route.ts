import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("API: Fetching users")

    // Mock users data with stock clerks
    const users = [
      {
        id: 1,
        name: "John Smith",
        email: "john.smith@cinema.com",
        role: "stock_clerk",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: 2,
        name: "Emily Johnson",
        email: "emily.johnson@cinema.com",
        role: "stock_clerk",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: 3,
        name: "Michael Brown",
        email: "michael.brown@cinema.com",
        role: "stock_clerk",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: 4,
        name: "Sarah Davis",
        email: "sarah.davis@cinema.com",
        role: "stock_clerk",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: 5,
        name: "David Wilson",
        email: "david.wilson@cinema.com",
        role: "stock_clerk",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: 6,
        name: "Admin User",
        email: "admin@cinema.com",
        role: "admin",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ]

    console.log(`API: Returning ${users.length} users`)
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
