'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  Shield,
  Settings,
  LogOut,
  User,
  BarChart3,
} from 'lucide-react'
import { DemoBanner } from '@/components/demo-banner'
import { DemoProvider } from '@/contexts/demo-context'
import { BottomNav } from '@/components/layout/BottomNav'

const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Focus', href: '/focus', icon: Timer },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Blocker', href: '/blocker', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface DashboardLayoutProps {
  readonly children: React.ReactNode
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const demoMode = localStorage.getItem('focusflow-demo-mode')
    if (demoMode === 'true') {
      setIsDemo(true)
    }
  }, [])

  const navigation = mainNavigation

  const handleLogout = () => {
    if (isDemo) {
      localStorage.removeItem('focusflow-demo-mode')
      localStorage.removeItem('focusflow-demo-role')
    }
    router.push('/')
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Demo Banner */}
      {isDemo && <DemoBanner />}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-card border-r">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link href="/dashboard" className="text-xl font-bold">
                FocusFlow
              </Link>
              {isDemo && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  Demo
                </span>
              )}
            </div>

            <div className="mt-6 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <item.icon
                        className="mr-3 h-5 w-5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top navbar */}
          <header className="bg-card border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:hidden">
                <h1 className="text-lg font-semibold">FocusFlow</h1>
                {isDemo && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    Demo
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4 ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src="/avatars/user.png"
                          alt="User"
                        />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {isDemo ? 'Demo User' : 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {isDemo ? 'demo@focusflow.app' : 'user@example.com'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{isDemo ? 'Exit Demo' : 'Log out'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>

          {/* Bottom Navigation */}
          <BottomNav
            navigation={navigation}
            onExit={handleLogout}
            exitLabel={isDemo ? 'Exit Demo' : 'Log out'}
            isDemo={isDemo}
          />
        </div>
      </div>
    </div>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const demoMode = localStorage.getItem('focusflow-demo-mode')
    setIsDemo(demoMode === 'true')
  }, [])

  // Wrap with DemoProvider if in demo mode
  if (isDemo) {
    return (
      <DemoProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </DemoProvider>
    )
  }

  return <DashboardLayoutContent>{children}</DashboardLayoutContent>
}
