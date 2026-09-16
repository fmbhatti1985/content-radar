"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Activity, Radar, Video, Users } from "lucide-react"

export default function UsagePage() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usage & Billing</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your API limits, active scans, and subscription tier.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pro Plan</CardTitle>
            <CardDescription>$29/month • Renews Oct 1st, 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Radar className="w-4 h-4 text-violet-500" />
                    <span className="font-medium">Scans Completed</span>
                  </div>
                  <span className="text-muted-foreground">42 / 100</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-violet-500" />
                    <span className="font-medium">Videos Indexed</span>
                  </div>
                  <span className="text-muted-foreground">1,240 / 5,000</span>
                </div>
                <Progress value={24.8} className="h-2" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-500" />
                    <span className="font-medium">Creators Tracked</span>
                  </div>
                  <span className="text-muted-foreground">8 / 20</span>
                </div>
                <Progress value={40} className="h-2" />
              </div>

            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Billing History</CardTitle>
            <CardDescription>Recent invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {[
                { date: "Sep 1, 2026", amount: "$29.00", status: "Paid" },
                { date: "Aug 1, 2026", amount: "$29.00", status: "Paid" },
                { date: "Jul 1, 2026", amount: "$29.00", status: "Paid" },
              ].map((invoice, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b last:border-0 pb-3 last:pb-0">
                  <span className="font-medium">{invoice.date}</span>
                  <div className="flex items-center gap-4">
                    <span>{invoice.amount}</span>
                    <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-medium">
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
