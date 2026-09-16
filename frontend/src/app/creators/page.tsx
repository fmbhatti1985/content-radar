"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink, Users, Video } from "lucide-react"
import Link from "next/link"

export default function Creators() {
  const [creators, setCreators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/creators/")
      .then(res => res.json())
      .then(data => {
        setCreators(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const filteredCreators = creators.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Creator Explorer</h1>
        <p className="text-muted-foreground mt-1">Browse all creators that have been analyzed in your workspace.</p>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search creators by name or handle..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center p-12 text-muted-foreground">Loading creators...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCreators.map(creator => (
            <Card key={creator.id} className="overflow-hidden hover:border-violet-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img 
                    src={creator.avatar} 
                    alt={creator.name} 
                    className="w-16 h-16 rounded-full border border-muted object-cover bg-white"
                  />
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <h3 className="font-bold truncate text-lg" title={creator.name}>{creator.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="truncate">{creator.username}</span>
                      <span>•</span>
                      <span className="capitalize">{creator.platform}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-medium">Followers</span>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Users className="w-4 h-4 text-violet-500" />
                      {creator.followers > 1000000 
                        ? (creator.followers / 1000000).toFixed(1) + 'M' 
                        : creator.followers > 1000 
                          ? (creator.followers / 1000).toFixed(1) + 'K' 
                          : creator.followers || 'N/A'
                      }
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-medium">Videos Scanned</span>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Video className="w-4 h-4 text-violet-500" />
                      {creator.video_count}
                    </div>
                  </div>
                </div>
                
                {creator.bio && (
                  <p className="mt-4 text-xs text-muted-foreground line-clamp-2">
                    {creator.bio}
                  </p>
                )}
                
                <div className="mt-6 flex gap-2">
                  <Link 
                    href="/scan/new" 
                    className="flex-1 text-center bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 rounded-md transition-colors"
                  >
                    Run New Scan
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredCreators.length === 0 && (
            <div className="col-span-full p-12 text-center text-muted-foreground border rounded-lg border-dashed">
              No creators found. Adjust your search or run a scan to add creators.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
