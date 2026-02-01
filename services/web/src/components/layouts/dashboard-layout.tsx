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
  Images,
  Users,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  User,
  BarChart3,
  MessageSquare,
  Camera,
  Building2,
} from 'lucide-react'
import { DemoBanner } from '@/components/demo-banner'
import { DemoProvider } from '@/contexts/demo-context'
import type { DemoRole } from '@/lib/demo-data'
import { getDemoUserByRole } from '@/lib/demo-data'

// Role-specific navigation configurations
const photographerNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Galleries', href: '/galleries', icon: Images },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Sessions', href: '/sessions', icon: Calendar },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const assistantNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Sessions', href: '/sessions', icon: Calendar },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
]

const adminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Galleries', href: '/galleries', icon: Images },
  { name: 'Sessions', href: '/sessions', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const getNavigationForRole = (role: DemoRole) => {
  const navigationMap = {
    photographer: photographerNavigation,
    assistant: assistantNavigation,
    admin: adminNavigation,
  }
  return navigationMap[role] || photographerNavigation
}

const getRoleIcon = (role: DemoRole) => {
  const iconMap = {
    photographer: Camera,
    assistant: Users,
    admin: Building2,
  }
  return iconMap[role] || Camera
}

const getRoleBadgeColor = (role: DemoRole) => {
  const colorMap = {
    photographer: 'bg-primary/10 text-primary',
    assistant: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    admin: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  }
  return colorMap[role] || colorMap.photographer
}

interface DashboardLayoutProps {
  readonly children: React.ReactNode
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isDemo, setIsDemo] = useState(false)
  const [currentRole, setCurrentRole] = useState<DemoRole>('photographer')

  useEffect(() => {
    const demoMode = localStorage.getItem('focusflow-demo-mode')
    const storedRole = localStorage.getItem('focusflow-demo-role') as DemoRole | null

    if (demoMode === 'true') {
      setIsDemo(true)
      if (storedRole && ['photographer', 'assistant', 'admin'].includes(storedRole)) {
        setCurrentRole(storedRole)
      }
    }
  }, [])

  const navigation = isDemo
    ? getNavigationForRole(currentRole)
    : photographerNavigation

  const user = isDemo ? getDemoUserByRole(currentRole) : null
  const RoleIcon = getRoleIcon(currentRole)

  const handleLogout = () => {
    if (isDemo) {
      localStorage.removeItem('focusflow-demo-mode')
      localStorage.removeItem('focusflow-demo-role')
    }
    router.push('/')
  }

  const handleSwitchRole = (role: DemoRole) => {
    localStorage.setItem('focusflow-demo-role', role)
    setCurrentRole(role)
    router.refresh()
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

            {/* Role Badge for Demo Mode */}
            {isDemo && (
              <div className="mx-4 mt-4">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getRoleBadgeColor(currentRole)}`}>
                  <RoleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium capitalize">{currentRole}</span>
                </div>
              </div>
            )}

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

            {/* Role Switcher for Demo Mode */}
            {isDemo && (
              <div className="px-4 py-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Switch Role</p>
                <div className="flex gap-1">
                  {(['photographer', 'assistant', 'admin'] as const).map((role) => (
                    <Button
                      key={role}
                      variant={currentRole === role ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 text-xs px-2"
                      onClick={() => handleSwitchRole(role)}
                    >
                      {role.charAt(0).toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            )}
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
                          src={user?.avatarUrl || '/avatars/user.png'}
                          alt={user?.name || 'User'}
                        />
                        <AvatarFallback>
                          {user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name || 'User Name'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || 'user@example.com'}
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

          {/* Mobile role indicator */}
          {isDemo && (
            <div className="md:hidden px-4 py-2 border-b bg-muted/50">
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(currentRole)}`}>
                <RoleIcon className="h-3 w-3" />
                <span className="capitalize">{currentRole}</span>
              </div>
            </div>
          )}

          {/* Mobile navigation */}
          <nav className="md:hidden border-b bg-card overflow-x-auto">
            <div className="flex px-2 py-2 gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <item.icon className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
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
