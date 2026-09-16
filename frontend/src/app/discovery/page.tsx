"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink, Calendar, Eye, PlayCircle } from "lucide-react"

async function fetchWithBypass(url: any, options: any = {}) {
  options.headers = {
    ...options.headers,
    'Bypass-Tunnel-Reminder': 'true'
  };
  return fetch(url, options);
}

export default function Discovery() {
  const [contentItems, setContentItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchWithBypass(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/content/`)
      .then(res => res.json())
      .then(data => {
        setContentItems(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const filteredItems = contentItems.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.creator_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Discovery</h1>
        <p className="text-muted-foreground mt-1">Explore and search all indexed videos from your scans.</p>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by title or creator..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center p-12 text-muted-foreground">Loading indexed content...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden hover:border-violet-500/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base line-clamp-2" title={item.title}>
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-violet-400 font-medium truncate">
                      {item.creator_name}
                    </CardDescription>
                  </div>
                  <a href={item.url} target="_blank" rel="noreferrer" className="shrink-0 rounded bg-muted p-2 hover:bg-violet-500/10 hover:text-violet-500 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <PlayCircle className="h-3.5 w-3.5" />
                    <span className="capitalize">{item.platform}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{item.view_count ? item.view_count.toLocaleString() : 'N/A'}</span>
                  </div>
                  {item.published_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(item.published_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                {item.description && (
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-3">
                    {item.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="col-span-full p-12 text-center text-muted-foreground border rounded-lg border-dashed">
              No content found. Adjust your search or run a new scan.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
