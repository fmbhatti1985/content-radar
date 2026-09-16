"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Radar, Settings2, Play, CheckCircle2 } from "lucide-react"

export default function NewScanPage() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState("Fetching creator profile...")
  const [creatorUrl, setCreatorUrl] = useState("")
  const [sourcePlatform, setSourcePlatform] = useState("youtube")
  const [contentLimit, setContentLimit] = useState(20)
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>(["youtube", "facebook", "instagram"])

  const handleTargetToggle = (platform: string) => {
    setTargetPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const handleScan = async () => {
    if (!creatorUrl) {
      alert("Please enter a creator URL or username.");
      return;
    }
    
    setIsScanning(true)
    setProgress(0)
    setStatusText("Initializing scan on server...")
    
    try {
      // 1. Create scan on backend
      const res = await fetch("http://localhost:8000/api/v1/scans/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creator_identifier: creatorUrl,
          source_platform: sourcePlatform,
          target_platforms: targetPlatforms,
          content_limit: contentLimit
        })
      });
      
      if (!res.ok) {
        throw new Error("Failed to start scan");
      }
      
      const data = await res.json();
      const scanId = data.scan_id;
      
      // 2. Poll for progress
      const interval = setInterval(async () => {
        try {
          const pollRes = await fetch(`http://localhost:8000/api/v1/scans/${scanId}`);
          if (pollRes.ok) {
            const pollData = await pollRes.json();
            setProgress(pollData.progress || 5);
            
            if (pollData.progress < 20) setStatusText("Fetching creator profile and public videos...");
            else if (pollData.progress < 40) setStatusText("Generating fingerprints and extracting metadata...");
            else if (pollData.progress < 80) setStatusText("Searching target platforms for candidate matches...");
            else if (pollData.progress < 100) setStatusText("Calculating similarity scores and detecting gaps...");
            else setStatusText("Report generated successfully.");
            
            if (pollData.status === "completed" || pollData.status === "failed") {
              clearInterval(interval);
              setProgress(100);
              
              if (pollData.status === "completed") {
                // Navigate to results after a short delay
                setTimeout(() => {
                  router.push(`/scan/${scanId}`);
                }, 1000);
              } else {
                setStatusText(`Scan failed: ${pollData.error_message || "Unknown error"}`);
                setIsScanning(false);
              }
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 1000);
      
    } catch (error) {
      console.error(error);
      setIsScanning(false);
      alert("Error starting scan");
    }
  }

  return (
    <div className="flex flex-col max-w-4xl mx-auto gap-8 pb-8 mt-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-violet-500/10 mb-6">
          <Radar className="h-8 w-8 text-violet-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Find Cross-Platform Content Gaps</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Enter a creator or content URL and see where their content is — and isn't — being distributed.
        </p>
      </div>
      
      {!isScanning ? (
        <Card className="border-2 mt-4">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Creator URL or Username</label>
                <input 
                  type="text" 
                  value={creatorUrl}
                  onChange={(e) => setCreatorUrl(e.target.value)}
                  className="w-full bg-muted/50 border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Paste TikTok, YouTube, Facebook or Instagram creator URL..."
                />
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Example: https://youtube.com/@creator</span>
                  <span>Example: @username</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Source Platform</label>
                  <select 
                    value={sourcePlatform}
                    onChange={(e) => setSourcePlatform(e.target.value)}
                    className="w-full bg-muted/50 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Recent Posts to Analyze</label>
                  <select 
                    value={contentLimit}
                    onChange={(e) => setContentLimit(Number(e.target.value))}
                    className="w-full bg-muted/50 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="10">10 videos</option>
                    <option value="20">20 videos</option>
                    <option value="50">50 videos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Target Platforms to Search</label>
                <div className="flex flex-wrap gap-3">
                  {['youtube', 'facebook', 'instagram', 'tiktok'].map(platform => (
                    <label key={platform} className="flex items-center gap-2 bg-muted/50 border rounded-lg px-4 py-2 cursor-pointer hover:bg-muted">
                      <input 
                        type="checkbox" 
                        checked={targetPlatforms.includes(platform)}
                        onChange={() => handleTargetToggle(platform)}
                        className="accent-violet-500 w-4 h-4" 
                      />
                      <span className="capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <Settings2 className="h-4 w-4" />
                  Advanced Options
                </button>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Estimated workload: <strong>{contentLimit} source videos × {targetPlatforms.length} target platforms</strong>
                </div>
                <button 
                  onClick={handleScan}
                  className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-medium px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  Start Analysis
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 mt-4 overflow-hidden">
          <div className="h-2 w-full bg-muted relative">
            <div 
              className="absolute left-0 top-0 h-full bg-violet-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center py-8 text-center gap-6">
              <div className="relative">
                {progress < 100 ? (
                  <div className="h-16 w-16 rounded-full border-4 border-muted border-t-violet-500 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium">{Math.floor(progress)}%</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold">
                  {progress < 100 ? "Analyzing Content..." : "Analysis Complete!"}
                </h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  {statusText}
                </p>
              </div>

              {progress >= 100 && (
                <button className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-8 py-3 rounded-lg mt-4 transition-colors">
                  View Results
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
