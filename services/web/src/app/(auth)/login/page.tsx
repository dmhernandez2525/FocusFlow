'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, Users, Eye, Building2 } from 'lucide-react'

// Check if demo mode is enabled via environment variable
const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

// Demo role selector component
function DemoRoleSelector() {
  const router = useRouter()

  const handleDemoLogin = (role: 'photographer' | 'assistant' | 'admin') => {
    // Store the demo role and demo mode flag
    localStorage.setItem('focusflow-demo-role', role)
    localStorage.setItem('focusflow-demo-mode', 'true')
    // Navigate to the main dashboard (not demo-specific routes)
    router.push('/dashboard')
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mx-auto mb-4">
          <Eye className="h-4 w-4 text-primary" />
          <span className="text-xs text-primary font-medium">Demo Mode</span>
        </div>
        <CardTitle className="text-2xl">Welcome to FocusFlow</CardTitle>
        <CardDescription>
          Choose how you&apos;d like to explore the photography management platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <button
          onClick={() => handleDemoLogin('photographer')}
          className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="font-medium group-hover:text-primary transition-colors">
              Sign in as Photographer
            </div>
            <div className="text-sm text-muted-foreground">
              Full access to galleries, clients, sessions, and analytics
            </div>
          </div>
        </button>

        <button
          onClick={() => handleDemoLogin('assistant')}
          className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-blue-500 hover:bg-blue-500/5 transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <div className="font-medium group-hover:text-blue-500 transition-colors">
              Sign in as Assistant
            </div>
            <div className="text-sm text-muted-foreground">
              Manage bookings, client communications, and scheduling
            </div>
          </div>
        </button>

        <button
          onClick={() => handleDemoLogin('admin')}
          className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-amber-500 hover:bg-amber-500/5 transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <div className="font-medium group-hover:text-amber-500 transition-colors">
              Sign in as Studio Admin
            </div>
            <div className="text-sm text-muted-foreground">
              Manage team, view reports, and configure studio settings
            </div>
          </div>
        </button>
      </CardContent>
      <CardFooter>
        <p className="text-center text-xs text-muted-foreground w-full">
          This is a demo environment with sample data.
          <br />No real data will be modified.
        </p>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  // In demo mode, show role selection instead of real auth
  if (DEMO_MODE_ENABLED) {
    return <DemoRoleSelector />
  }

  // Normal mode - show standard login form
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
          <Button variant="outline" className="w-full">
            Login with Google
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
