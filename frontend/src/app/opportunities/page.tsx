"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink, TrendingUp, Loader2, ArrowUpRight } from "lucide-react"

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "bg-red-500/10 text-red-400",
  tiktok: "bg-pink-500/10 text-pink-400",
  instagram: "bg-purple-500/10 text-purple-400",
  facebook: "bg-blue-500/10 text-blue-400",
}

const POTENTIAL_COLORS: Record<string, string> = {
  high: "text-green-400",
  medium: "text-amber-400",
  low: "text-muted-foreground",
}

export default function Opportunities() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/opportunities/")
      .then(res => res.json())
      .then(data => {
        setItems(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const filtered = items.filter(item =>
    item.content?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.target_platform?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Opportunities</h1>
        <p className="text-muted-foreground mt-1">
          Real content gaps detected — videos that haven't been cross-posted to other platforms.
        </p>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by title, creator, or platform..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-lg text-muted-foreground text-center gap-2">
          <TrendingUp className="h-8 w-8" />
          <p>No opportunities found yet. Run a scan to detect content gaps.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground -mt-4">{filtered.length} opportunities found</p>
          <div className="flex flex-col gap-3">
            {filtered.map(item => (
              <Card key={item.id} className="hover:border-violet-500/50 transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* Creator avatar + info */}
                    <div className="flex items-center gap-3 min-w-0 sm:w-56 shrink-0">
                      <img
                        src={item.creator?.avatar}
                        alt={item.creator?.name}
                        className="w-10 h-10 rounded-full border border-muted object-cover bg-white shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.creator?.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.creator?.platform}</p>
                      </div>
                    </div>

                    {/* Content title + gap arrow */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${PLATFORM_COLORS[item.content?.platform] || "bg-muted text-muted-foreground"}`}>
                          {item.content?.platform}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-violet-400 shrink-0" />
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${PLATFORM_COLORS[item.target_platform] || "bg-muted text-muted-foreground"}`}>
                          {item.target_platform}
                        </span>
                      </div>
                      <p className="text-sm font-semibold mt-1.5 line-clamp-1" title={item.content?.title}>
                        {item.content?.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.content?.view_count > 0
                          ? `${item.content.view_count.toLocaleString()} views on source`
                          : "View count unavailable"}
                      </p>
                    </div>

                    {/* Gap score + potential */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Gap Score</p>
                        <p className={`text-xl font-bold mt-0.5 ${item.gap_score > 75 ? "text-violet-400" : item.gap_score > 50 ? "text-amber-400" : "text-muted-foreground"}`}>
                          {item.gap_score}
                        </p>
                      </div>
                      {item.potential && (
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground uppercase font-medium">Potential</p>
                          <p className={`text-sm font-semibold capitalize mt-0.5 ${POTENTIAL_COLORS[item.potential] || ""}`}>
                            {item.potential}
                          </p>
                        </div>
                      )}
                      {item.content?.url && (
                        <a
                          href={item.content.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded bg-muted p-2 hover:bg-violet-500/10 hover:text-violet-500 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
