"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Shield } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

const availablePermissions = [
  { id: "view_dashboard", name: "View Dashboard", description: "Access to dashboard and analytics" },
  { id: "update_stock_quantity", name: "Update Stock Quantity", description: "Modify stock quantities" },
  { id: "update_check_date", name: "Update Last Check Date", description: "Modify last check dates" },
  { id: "update_order_date", name: "Update Last Order Date", description: "Modify last order dates" },
  { id: "update_outlet_details", name: "Update Outlet Details", description: "Modify outlet information" },
  { id: "add_outlet", name: "Add Outlet", description: "Create new outlets" },
  { id: "delete_outlet", name: "Delete Outlet", description: "Remove outlets" },
  { id: "view_audit_trail", name: "View Audit Trail", description: "Access change history" },
  { id: "manage_users", name: "Manage Users", description: "Add/remove users and assign roles" },
  { id: "manage_products", name: "Manage Products", description: "Configure products and mappings" },
  { id: "manage_categories", name: "Manage Categories & Regions", description: "Configure categories and regions" },
  { id: "export_data", name: "Export Data", description: "Export reports and data" },
]

const initialRoles = [
  {
    id: 1,
    name: "Admin",
    description: "Full system access",
    permissions: availablePermissions.map((p) => p.id),
    isSystem: true,
  },
  {
    id: 2,
    name: "Manager",
    description: "Outlet management and reporting",
    permissions: [
      "view_dashboard",
      "update_stock_quantity",
      "update_check_date",
      "update_order_date",
      "update_outlet_details",
      "view_audit_trail",
      "export_data",
    ],
    isSystem: false,
  },
  {
    id: 3,
    name: "Stock Clerk",
    description: "Stock updates only",
    permissions: ["view_dashboard", "update_stock_quantity", "update_check_date"],
    isSystem: false,
  },
  {
    id: 4,
    name: "Viewer",
    description: "Read-only access",
    permissions: ["view_dashboard", "view_audit_trail"],
    isSystem: false,
  },
]

export default function UserRolesManagement() {
  const [roles, setRoles] = useState(initialRoles)
  const [editingRole, setEditingRole] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  })

  const handleCreate = () => {
    setIsCreating(true)
    setEditingRole(null)
    setFormData({ name: "", description: "", permissions: [] })
    setIsDialogOpen(true)
  }

  const handleEdit = (role: any) => {
    setIsCreating(false)
    setEditingRole(role)
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId)
    if (role?.isSystem) {
      toast({
        title: "Cannot delete system role",
        description: "System roles cannot be deleted.",
        variant: "destructive",
      })
      return
    }

    setRoles(roles.filter((r) => r.id !== roleId))
    toast({
      title: "Role deleted",
      description: "User role has been deleted successfully.",
    })
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Role name required",
        description: "Please enter a role name.",
        variant: "destructive",
      })
      return
    }

    if (isCreating) {
      const newRole = {
        id: Math.max(...roles.map((r) => r.id)) + 1,
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        isSystem: false,
      }
      setRoles([...roles, newRole])
      toast({
        title: "Role created",
        description: "New user role has been created successfully.",
      })
    } else if (editingRole) {
      setRoles(roles.map((role) => (role.id === editingRole.id ? { ...role, ...formData } : role)))
      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      })
    }

    setIsDialogOpen(false)
    setEditingRole(null)
    setFormData({ name: "", description: "", permissions: [] })
  }

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  const getPermissionName = (permissionId: string) => {
    return availablePermissions.find((p) => p.id === permissionId)?.name || permissionId
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Roles & Permissions
            </CardTitle>
            <CardDescription>Manage user roles and their permissions</CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {role.name}
                      {role.isSystem && <Badge variant="outline">System</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permissionId) => (
                        <Badge key={permissionId} variant="secondary" className="text-xs">
                          {getPermissionName(permissionId)}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(role)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!role.isSystem && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(role.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isCreating ? "Create New Role" : "Edit Role"}</DialogTitle>
              <DialogDescription>
                {isCreating
                  ? "Create a new user role with specific permissions."
                  : "Update role information and permissions."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter role name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role-description">Description</Label>
                <Input
                  id="role-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter role description"
                />
              </div>
              <div className="grid gap-2">
                <Label>Permissions</Label>
                <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-3">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={formData.permissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSave}>
                {isCreating ? "Create Role" : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
