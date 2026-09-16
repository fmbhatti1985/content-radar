"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Search, 
  Radar, 
  Users, 
  Lightbulb, 
  Library, 
  Bookmark, 
  History, 
  Briefcase, 
  Blocks, 
  Activity, 
  Settings 
} from "lucide-react"

const mainNavItems = [
  { title: "Overview", href: "/", icon: LayoutDashboard },
  { title: "Discovery", href: "/discovery", icon: Search },
  { title: "New Scan", href: "/scan/new", icon: Radar },
  { title: "Creator Explorer", href: "/creators", icon: Users },
  { title: "Content Opportunities", href: "/opportunities", icon: Lightbulb },
]

const libraryItems = [
  { title: "Saved Content", href: "/library/saved", icon: Bookmark },
  { title: "Scan History", href: "/library/history", icon: History },
]

const workspaceItems = [
  { title: "Integrations", href: "/settings/integrations", icon: Blocks },
  { title: "Usage", href: "/settings/usage", icon: Activity },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  const renderNavItems = (items: any[]) => {
    return items.map((item) => {
      const isActive = pathname === item.href
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive 
              ? "bg-violet-500/10 text-violet-500" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className={cn("h-4 w-4", isActive ? "text-violet-500" : "text-muted-foreground")} />
          {item.title}
        </Link>
      )
    })
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Radar className="h-5 w-5 text-violet-500" />
          <span>ContentRadar</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-4">
          {renderNavItems(mainNavItems)}
          
          <div className="mt-6 mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Library
          </div>
          {renderNavItems(libraryItems)}
          
          <div className="mt-6 mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </div>
          {renderNavItems(workspaceItems)}
        </nav>
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <div className="h-8 w-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-500 font-semibold">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Alex</span>
            <span className="text-xs text-muted-foreground">Pro Plan</span>
          </div>
        </div>
      </div>
    </div>
  )
}
