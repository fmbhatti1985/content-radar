"use client"

import { useEffect, useState, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Download, Share, Loader2 } from "lucide-react"

export default function ScanResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/scans/${id}/results`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch scan results")
        return res.json()
      })
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Results</h2>
        <p className="text-muted-foreground">{error || "Could not find scan data"}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex items-center gap-4">
          <img 
            src={data.creator.avatar}
            alt="Creator avatar" 
            className="w-16 h-16 rounded-full border-2 border-muted object-cover bg-white"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{data.creator.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-muted-foreground">{data.creator.handle}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{data.creator.platform}</span>
              <span className="text-xs text-muted-foreground">• {data.creator.followers > 0 ? (data.creator.followers / 1000000).toFixed(1) + 'M' : 'N/A'} followers</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors">
            <Share className="w-4 h-4" />
            Share Report
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos Scanned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.videos_scanned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cross-Platform Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.matches}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-violet-500">Content Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-500">{data.stats.gaps}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cross-Post Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.cross_post_rate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Content Gap Matrix</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium">Source Content</th>
                    {data.matrix[0] && Object.keys(data.matrix[0].targets).map(target => (
                      <th key={target} className="px-4 py-3 text-center font-medium capitalize">{target}</th>
                    ))}
                    <th className="px-4 py-3 text-right font-medium">Gap Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.matrix.map((row: any, i: number) => (
                    <MatrixRow 
                      key={i}
                      title={row.title} 
                      views={row.views > 1000000 ? (row.views / 1000000).toFixed(1) + 'M' : row.views > 1000 ? (row.views / 1000).toFixed(1) + 'K' : row.views}
                      targets={row.targets}
                      score={row.score}
                      platform={data.creator.platform}
                    />
                  ))}
                  {data.matrix.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                        No matrix data generated.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MatrixRow({ title, views, targets, score, platform }: any) {
  const getStatusColor = (status: string) => {
    if (status.startsWith("Found")) return "text-green-500"
    if (status === "Not detected") return "text-amber-500"
    return "text-muted-foreground"
  }

  const getStatusIcon = (status: string) => {
    if (status.startsWith("Found")) return <CheckCircle2 className="w-4 h-4 text-green-500 inline-block mr-1" />
    if (status === "Not detected") return <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-2" />
    return <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block mr-2" />
  }

  return (
    <tr className="border-b hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 max-w-[300px]">
        <div className="flex flex-col">
          <span className="font-medium truncate" title={title}>{title}</span>
          <span className="text-xs text-muted-foreground capitalize">{platform} • {views} views</span>
        </div>
      </td>
      {Object.entries(targets).map(([key, val]: any) => (
        <td key={key} className="px-4 py-3 text-center text-xs">
          <div className={`font-medium ${getStatusColor(val)}`}>
            {getStatusIcon(val)} {val}
          </div>
        </td>
      ))}
      <td className="px-4 py-3 text-right">
        <span className={`font-bold ${score > 80 ? "text-violet-500" : score > 50 ? "text-foreground" : "text-muted-foreground"}`}>
          {score}/100
        </span>
      </td>
    </tr>
  )
}
