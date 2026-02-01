'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Eye,
} from 'lucide-react'
import { DemoProvider, useDemo } from '@/contexts/demo-context'

const navigation = [
  { name: 'Dashboard', href: '/demo/dashboard', icon: LayoutDashboard },
  { name: 'Galleries', href: '/demo/galleries', icon: Images },
  { name: 'Clients', href: '/demo/clients', icon: Users },
  { name: 'Sessions', href: '/demo/sessions', icon: Calendar },
  { name: 'Booking', href: '/demo/booking', icon: CreditCard },
]

interface DemoLayoutProps {
  readonly children: React.ReactNode
}

function DemoLayoutContent({ children }: DemoLayoutProps) {
  const pathname = usePathname()
  const { user } = useDemo()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-card border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/demo/dashboard" className="text-xl font-bold">
              FocusFlow
            </Link>
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
              Demo
            </span>
          </div>

          {/* Demo Notice */}
          <div className="mx-4 mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                You&apos;re viewing demo mode. Data is simulated and actions won&apos;t be saved.
              </p>
            </div>
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

          {/* Exit Demo Button */}
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                Exit Demo
              </Link>
            </Button>
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
              <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                Demo
              </span>
            </div>

            <div className="flex items-center space-x-4 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>DP</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Exit Demo</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

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
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DemoLayout({ children }: DemoLayoutProps) {
  return (
    <DemoProvider>
      <DemoLayoutContent>{children}</DemoLayoutContent>
    </DemoProvider>
  )
}
