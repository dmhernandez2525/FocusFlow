'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Camera,
  Users,
  Building2,
  LogOut,
  X,
  Menu,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { DemoRole } from '@/lib/demo-data'

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface BottomNavProps {
  navigation: NavItem[]
  currentRole?: DemoRole
  onSwitchRole?: (role: DemoRole) => void
  onExit?: () => void
  exitLabel?: string
  exitHref?: string
  isDemo?: boolean
  allNavItems?: NavItem[]
}

const getRoleBadgeColor = (role: DemoRole) => {
  const colorMap = {
    photographer: 'bg-primary/10 text-primary',
    assistant: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    admin: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  }
  return colorMap[role] || colorMap.photographer
}

const getRoleIcon = (role: DemoRole): LucideIcon => {
  const iconMap = {
    photographer: Camera,
    assistant: Users,
    admin: Building2,
  }
  return iconMap[role] || Camera
}

export function BottomNav({
  navigation,
  currentRole,
  onSwitchRole,
  onExit,
  exitLabel = 'Exit',
  exitHref = '/',
  isDemo = false,
  allNavItems,
}: BottomNavProps) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Pick tabs: first 2 + last 2, FAB in center
  const tabItems = navigation.length <= 4
    ? navigation
    : [...navigation.slice(0, 2), ...navigation.slice(-2)]

  const firstTwo = tabItems.slice(0, 2)
  const lastTwo = tabItems.slice(tabItems.length >= 4 ? 2 : tabItems.length)

  const menuItems = allNavItems || navigation

  return (
    <>
      {/* Bottom Sheet Overlay */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Bottom Sheet Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t rounded-t-3xl animate-slide-up max-h-[70vh] overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Menu</h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Role indicator */}
            {isDemo && currentRole && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4 ${getRoleBadgeColor(currentRole)}`}>
                {(() => {
                  const RoleIcon = getRoleIcon(currentRole)
                  return <RoleIcon className="h-3 w-3" />
                })()}
                <span className="capitalize">{currentRole}</span>
              </div>
            )}

            {/* Navigation Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Role Switcher */}
            {isDemo && onSwitchRole && (
              <div className="border-t pt-4 mb-4">
                <p className="text-xs text-muted-foreground mb-2">Switch Role</p>
                <div className="flex gap-2">
                  {(['photographer', 'assistant', 'admin'] as const).map((role) => (
                    <Button
                      key={role}
                      variant={currentRole === role ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        onSwitchRole(role)
                        setIsMenuOpen(false)
                      }}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Exit */}
            <div className="border-t pt-4">
              {onExit ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    onExit()
                    setIsMenuOpen(false)
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {exitLabel}
                </Button>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={exitHref} onClick={() => setIsMenuOpen(false)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {exitLabel}
                  </Link>
                </Button>
              )}
            </div>
          </div>
          {/* Safe area padding */}
          <div className="pb-[env(safe-area-inset-bottom)]" />
        </div>
      )}

      {/* Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t">
        <div className="flex items-center justify-around h-16 px-2">
          {/* First tabs */}
          {firstTwo.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 min-w-[3.5rem] py-1 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
          })}

          {/* Center FAB */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center justify-center w-14 h-14 -mt-6 rounded-full bg-primary text-primary-foreground shadow-lg"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Last tabs */}
          {lastTwo.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 min-w-[3.5rem] py-1 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
        {/* Safe area padding */}
        <div className="pb-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  )
}
