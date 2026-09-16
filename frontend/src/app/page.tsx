"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Video, BarChart2, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"

async function fetchWithBypass(url: any, options: any = {}) {
  options.headers = {
    ...options.headers,
    'Bypass-Tunnel-Reminder': 'true'
  };
  return fetch(url, options);
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchWithBypass(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/dashboard/`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div className="p-8">Loading real dashboard data...</div>;

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Good evening, Alex</h1>
        <p className="text-muted-foreground mt-1">Here's what your content radar is seeing from real data.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Creators Scanned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.creators}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos Analyzed</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.videos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Gaps</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.gaps}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Match Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.avg_match_rate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <h2 className="text-xl font-semibold tracking-tight">Top Content Opportunities</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Content</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Target Gap</th>
                    <th className="px-4 py-3 font-medium">Gap Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.opportunities.map((opp: any, idx: number) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium truncate max-w-[300px]">{opp.title}</span>
                          <span className="text-xs text-muted-foreground">{opp.creator}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium capitalize">{opp.source}</span>
                          <span className="text-xs text-muted-foreground">{opp.views || 0} views</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize">{opp.target}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 flex items-center justify-center rounded-full border-2 border-violet-500 text-xs font-bold text-violet-500">
                            {opp.score}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.opportunities.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        No opportunities found yet. Try running a scan!
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
