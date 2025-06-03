"use client"
import { useSession as useNextAuthSession } from "next-auth/react"

// Re-export useSession from next-auth for compatibility
export function useSession() {
  return useNextAuthSession()
}

// Keep the custom SessionProvider as backup
export { SessionProvider } from "next-auth/react"
