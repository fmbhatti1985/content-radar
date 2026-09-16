"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Camera, Smartphone, Globe, Loader2, CheckCircle2 } from "lucide-react"

export default function IntegrationsPage() {
  const [connected, setConnected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch real connected integrations from the database
    fetch("http://localhost:8000/api/v1/integrations/")
      .then(res => res.json())
      .then(data => {
        setConnected(data.map((i: any) => i.platform.toLowerCase()))
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const handleConnect = (platform: string) => {
    const platformLower = platform.toLowerCase()
    
    // If already connected, call the backend to disconnect and delete tokens
    if (connected.includes(platformLower)) {
      fetch(`http://localhost:8000/api/v1/integrations/${platformLower}`, { method: "DELETE" })
        .then(() => setConnected(prev => prev.filter(p => p !== platformLower)))
      return
    }

    // If not connected, redirect the browser to the backend OAuth login route
    window.location.href = `http://localhost:8000/api/v1/integrations/${platformLower}/login?t=${Date.now()}`
  }

  const renderConnectButton = (platform: string) => {
    if (loading) {
      return (
        <Button variant="outline" className="w-full" disabled>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...
        </Button>
      )
    }

    const platformLower = platform.toLowerCase()
    const isConnected = connected.includes(platformLower)

    if (isConnected) {
      return (
        <Button 
          variant="outline" 
          className="w-full border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-600"
          onClick={() => handleConnect(platform)}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Connected
        </Button>
      )
    }

    return (
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => handleConnect(platform)}
      >
        Connect {platform}
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect your social accounts to automatically publish content and track real-time analytics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-md">
                <Video className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <CardTitle>YouTube</CardTitle>
                <CardDescription>Connect YouTube channel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Allows ContentRadar to fetch your latest Shorts and long-form videos automatically, and publish directly to YouTube.
            </p>
            {renderConnectButton("YouTube")}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/10 rounded-md">
                <Camera className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <CardTitle>Instagram</CardTitle>
                <CardDescription>Connect Instagram Business</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Automatically sync your Reels and posts. Enables one-click cross-posting from YouTube Shorts to Instagram Reels.
            </p>
            {renderConnectButton("Instagram")}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black rounded-md border border-muted">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>TikTok</CardTitle>
                <CardDescription>Connect TikTok Account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Import your TikTok videos and analytics. Detect trending content gaps to repurpose for YouTube and Instagram.
            </p>
            {renderConnectButton("TikTok")}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-md">
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <CardTitle>Facebook</CardTitle>
                <CardDescription>Connect Facebook Page</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Publish to your Facebook Pages and sync your Facebook Watch video metrics to analyze cross-platform performance.
            </p>
            {renderConnectButton("Facebook")}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
