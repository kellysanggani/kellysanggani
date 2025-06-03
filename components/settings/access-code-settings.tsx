"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function AccessCodeSettings() {
  const [currentCode, setCurrentCode] = useState("")
  const [newCode, setNewCode] = useState("")
  const [confirmCode, setConfirmCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newCode !== confirmCode) {
      toast({
        title: "Codes don't match",
        description: "New code and confirmation code must match.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Access code updated",
        description: "The access code has been successfully updated.",
      })
      setCurrentCode("")
      setNewCode("")
      setConfirmCode("")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Code</CardTitle>
        <CardDescription>Update the access code required to enter the application</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-code">Current Access Code</Label>
            <Input
              id="current-code"
              type="password"
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-code">New Access Code</Label>
            <Input
              id="new-code"
              type="password"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-code">Confirm New Access Code</Label>
            <Input
              id="confirm-code"
              type="password"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Access Code"}
          </Button>
        </CardFooter>
      </form>
      <Toaster />
    </Card>
  )
}
