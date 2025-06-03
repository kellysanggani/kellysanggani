"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Trash2 } from "lucide-react"

// Mock data for authorized users with roles
const initialUsers = [
  { id: 1, email: "admin@example.com", role: "Admin" },
  { id: 2, email: "manager@example.com", role: "Manager" },
  { id: 3, email: "staff@example.com", role: "Stock Clerk" },
  { id: 4, email: "viewer@example.com", role: "Viewer" },
]

const availableRoles = ["Admin", "Manager", "Stock Clerk", "Viewer"]

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers)
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newUserEmail || !newUserRole) {
      toast({
        title: "Missing information",
        description: "Please provide both email and role for the new user.",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate email
    if (users.some((user) => user.email === newUserEmail)) {
      toast({
        title: "User already exists",
        description: "A user with this email already exists.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newUser = {
        id: users.length + 1,
        email: newUserEmail,
        role: newUserRole,
      }

      setUsers([...users, newUser])
      setNewUserEmail("")
      setNewUserRole("")
      toast({
        title: "User added",
        description: `${newUserEmail} has been added with ${newUserRole} role.`,
      })
      setIsLoading(false)
    }, 1000)
  }

  const handleRemoveUser = (id: number) => {
    const userToRemove = users.find((user) => user.id === id)

    if (!userToRemove) return

    // Prevent removing the last admin
    if (userToRemove.role === "Admin" && users.filter((u) => u.role === "Admin").length === 1) {
      toast({
        title: "Cannot remove last admin",
        description: "At least one admin user must exist.",
        variant: "destructive",
      })
      return
    }

    setUsers(users.filter((user) => user.id !== id))
    toast({
      title: "User removed",
      description: `${userToRemove.email} has been removed from authorized users.`,
    })
  }

  const handleRoleChange = (userId: number, newRole: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    // Prevent changing the last admin's role
    if (user.role === "Admin" && newRole !== "Admin" && users.filter((u) => u.role === "Admin").length === 1) {
      toast({
        title: "Cannot change last admin",
        description: "At least one admin user must exist.",
        variant: "destructive",
      })
      return
    }

    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    toast({
      title: "Role updated",
      description: `${user.email}'s role has been changed to ${newRole}.`,
    })
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin":
        return "default"
      case "Manager":
        return "secondary"
      case "Stock Clerk":
        return "outline"
      case "Viewer":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authorized Users</CardTitle>
        <CardDescription>Manage users who can access the application and assign their roles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-md border p-3">
              <div className="flex flex-col space-y-2">
                <span className="font-medium">{user.email}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveUser(user.id)}
                disabled={user.role === "Admin" && users.filter((u) => u.role === "Admin").length === 1}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove user</span>
              </Button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddUser} className="space-y-4 border-t pt-4">
          <div className="space-y-2">
            <Label htmlFor="new-user">Add New User</Label>
            <div className="flex gap-2">
              <Input
                id="new-user"
                type="email"
                placeholder="Email address"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Select value={newUserRole} onValueChange={setNewUserRole} required>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground border-t pt-4">
        <div className="space-y-1">
          <p>• Admin: Full system access including user management</p>
          <p>• Manager: Outlet management and reporting capabilities</p>
          <p>• Stock Clerk: Stock updates and basic dashboard access</p>
          <p>• Viewer: Read-only access to dashboard and reports</p>
        </div>
      </CardFooter>
    </Card>
  )
}
