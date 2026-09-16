"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink, Bookmark, Loader2, Trash2, BookmarkX } from "lucide-react"

export default function SavedContentPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchSaved = () => {
    setLoading(true)
    fetch("http://localhost:8000/api/v1/saved/")
      .then(res => res.json())
      .then(data => {
        setItems(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchSaved()
  }, [])

  const handleUnsave = async (savedId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/saved/${savedId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== savedId))
      }
    } catch (err) {
      console.error("Failed to unsave", err)
    }
  }

  const filtered = items.filter(item =>
    item.content?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Saved Content</h1>
        <p className="text-muted-foreground mt-1">
          Your bookmarked videos and content items from scans and discovery.
        </p>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search saved content..."
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
          <Bookmark className="h-8 w-8" />
          <p>No saved content yet.</p>
          <p className="text-sm">Save content from the Discovery or Opportunities pages to see it here.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground -mt-4">{filtered.length} saved items</p>
          <div className="flex flex-col gap-3">
            {filtered.map(item => (
              <Card key={item.id} className="hover:border-violet-500/50 transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Creator */}
                    <div className="flex items-center gap-3 min-w-0 sm:w-48 shrink-0">
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

                    {/* Content info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-1" title={item.content?.title}>
                        {item.content?.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="capitalize">{item.content?.platform}</span>
                        <span>•</span>
                        <span>{item.content?.view_count > 0 ? item.content.view_count.toLocaleString() + ' views' : 'N/A views'}</span>
                        {item.saved_at && (
                          <>
                            <span>•</span>
                            <span>Saved {new Date(item.saved_at).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                      {item.note && (
                        <p className="mt-1.5 text-xs text-violet-400 italic">&quot;{item.note}&quot;</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.content?.url && (
                        <a
                          href={item.content.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded bg-muted p-2 hover:bg-violet-500/10 hover:text-violet-500 transition-colors"
                          title="Open original"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleUnsave(item.id)}
                        className="rounded bg-muted p-2 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
