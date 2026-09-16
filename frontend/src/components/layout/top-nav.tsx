"use client"

import { Bell, Search } from "lucide-react"

export function TopNav() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div className="flex w-full max-w-sm items-center space-x-2 rounded-md border bg-muted/50 px-3 py-1.5 focus-within:ring-1 focus-within:ring-violet-500">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search creators, scans, or content... (⌘K)" 
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-background"></span>
        </button>
      </div>
    </header>
  )
}
