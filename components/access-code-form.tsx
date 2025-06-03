"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AccessCodeForm() {
  const [accessCode, setAccessCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Updated access code to "primasari"
      if (accessCode === "primasari") {
        // Set a session cookie or token
        sessionStorage.setItem("accessGranted", "true")
        router.push("/dashboard")
      } else {
        setError("Invalid access code. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Enter Access Code</CardTitle>
        <CardDescription>Please enter your team access code to continue</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              type="password"
              placeholder="Access Code"
              className="pl-9"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Continue"}
          </Button>
        </CardFooter>
      </form>
      <CardFooter className="flex-col space-y-2 border-t pt-4">
        <div className="text-center text-sm text-slate-500">
          <p>Admin users can sign in with Google to manage access</p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => router.push("/auth/signin")}>
          Admin Sign In
        </Button>
      </CardFooter>
    </Card>
  )
}
