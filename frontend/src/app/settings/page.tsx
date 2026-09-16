"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences and global application settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Details</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input defaultValue="Alex" />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input defaultValue="alex@contentradar.app" type="email" />
            </div>
            <Button className="mt-2 bg-violet-600 hover:bg-violet-700">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>Configure how you receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Scan Completions</Label>
                <p className="text-sm text-muted-foreground">Receive an email when a large scan finishes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Opportunities</Label>
                <p className="text-sm text-muted-foreground">Weekly digest of top content gaps</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>API Usage Limits</Label>
                <p className="text-sm text-muted-foreground">Alert when approaching monthly limits</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
