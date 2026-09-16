"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Search, Loader2, History, CheckCircle2, XCircle, Clock, AlertTriangle, ExternalLink
} from "lucide-react"
import Link from "next/link"

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  completed: { icon: CheckCircle2, color: "text-green-400", label: "Completed" },
  failed:    { icon: XCircle,      color: "text-red-400",   label: "Failed" },
  running:   { icon: Loader2,      color: "text-blue-400",  label: "Running" },
  pending:   { icon: Clock,        color: "text-amber-400", label: "Pending" },
  partial:   { icon: AlertTriangle, color: "text-amber-400", label: "Partial" },
}

export default function ScanHistoryPage() {
  const [scans, setScans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/history/`)
      .then(res => res.json())
      .then(data => {
        setScans(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const filtered = scans.filter(s =>
    s.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.creator?.handle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.source_platform?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (iso: string | null) => {
    if (!iso) return "—"
    return new Date(iso).toLocaleString()
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scan History</h1>
        <p className="text-muted-foreground mt-1">
          All past and active scans with their status and results.
        </p>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by creator or platform..."
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
          <History className="h-8 w-8" />
          <p>No scan history yet. Start a new scan to see it here.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground -mt-4">{filtered.length} scans</p>
          <div className="flex flex-col gap-3">
            {filtered.map(scan => {
              const statusCfg = STATUS_CONFIG[scan.status] || STATUS_CONFIG.pending
              const StatusIcon = statusCfg.icon

              return (
                <Card key={scan.id} className="hover:border-violet-500/50 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                      {/* Creator */}
                      <div className="flex items-center gap-3 min-w-0 sm:w-52 shrink-0">
                        <img
                          src={scan.creator?.avatar}
                          alt={scan.creator?.name}
                          className="w-10 h-10 rounded-full border border-muted object-cover bg-white shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{scan.creator?.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{scan.creator?.platform}</p>
                        </div>
                      </div>

                      {/* Scan details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted capitalize">
                            {scan.source_platform}
                          </span>
                          <span className="text-xs text-muted-foreground">→</span>
                          {scan.target_platforms?.map((tp: string) => (
                            <span key={tp} className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted capitalize">
                              {tp}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span>{scan.content_limit} videos</span>
                          <span>•</span>
                          <span>{formatDate(scan.created_at)}</span>
                          {scan.gaps_found > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-violet-400 font-medium">{scan.gaps_found} gaps found</span>
                            </>
                          )}
                        </div>
                        {scan.error_message && (
                          <p className="mt-1 text-xs text-red-400 truncate" title={scan.error_message}>
                            Error: {scan.error_message}
                          </p>
                        )}
                      </div>

                      {/* Status + action */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon className={`h-4 w-4 ${statusCfg.color} ${scan.status === 'running' ? 'animate-spin' : ''}`} />
                          <span className={`text-sm font-medium ${statusCfg.color}`}>{statusCfg.label}</span>
                        </div>
                        {scan.status === "completed" && (
                          <Link
                            href={`/scan/${scan.id}`}
                            className="rounded bg-muted p-2 hover:bg-violet-500/10 hover:text-violet-500 transition-colors"
                            title="View results"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
