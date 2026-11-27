'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  FileText,
  GitBranch,
  Columns,
  Target,
  Brain,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const navigation = [
  { name: 'Today', href: '/', icon: Home },
  { name: 'Briefings', href: '/briefings', icon: FileText },
  { name: 'Storylines', href: '/storylines', icon: GitBranch },
  { name: 'Perspectives', href: '/perspectives', icon: Columns },
  { name: 'Predictions', href: '/predictions', icon: Target },
  { name: 'Knowledge', href: '/knowledge', icon: Brain },
  { name: 'AI Assistant', href: '/assistant', icon: Bot },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const NavigationLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navigation.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            aria-current={active ? 'page' : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{item.name}</span>
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        className="md:hidden h-10 w-10 touch-manipulation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'flex flex-col border-r bg-card transition-all duration-200',
          'fixed inset-y-0 left-0 z-50 -translate-x-full md:relative md:-translate-x-0 md:flex',
          mobileOpen ? 'translate-x-0' : 'md:translate-x-0',
          collapsed ? 'w-16' : 'w-64',
          'md:w-64 md:min-w-[160px]',
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!collapsed && (
            <h1 className="text-xl font-serif font-bold text-foreground">SIGNAL</h1>
          )}
          <div className="flex items-center gap-1">
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="md:hidden h-8 w-8 touch-manipulation"
            >
              <X className="h-4 w-4" />
            </Button>
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="h-8 w-8 touch-manipulation"
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <nav className="p-3 space-y-1" aria-label="Main navigation">
            <NavigationLinks onClick={() => setMobileOpen(false)} />
          </nav>
        </ScrollArea>

        <Separator className="mx-3" />
        <div className="p-3">
          {!collapsed && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Version 0.1.0</p>
              <p className="truncate">Phase 1 — Foundation</p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}