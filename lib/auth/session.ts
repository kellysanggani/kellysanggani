"use server"

import { cookies } from "next/headers"

interface User {
  id: string
  email: string
  name?: string
  role: "admin" | "sales_manager" | "stock_clerk"
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // In a real app, this would validate a JWT token or session
    // For now, we'll simulate getting user from cookies/session
    const cookieStore = cookies()
    const userCookie = cookieStore.get("user")

    if (!userCookie) {
      return null
    }

    // Parse user data from cookie
    const userData = JSON.parse(userCookie.value)

    return {
      id: userData.id || "1",
      email: userData.email || "user@example.com",
      name: userData.name || "Current User",
      role: userData.role || "stock_clerk",
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function setCurrentUser(user: User) {
  try {
    const cookieStore = cookies()
    cookieStore.set("user", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  } catch (error) {
    console.error("Error setting current user:", error)
  }
}

export async function clearCurrentUser() {
  try {
    const cookieStore = cookies()
    cookieStore.delete("user")
  } catch (error) {
    console.error("Error clearing current user:", error)
  }
}
