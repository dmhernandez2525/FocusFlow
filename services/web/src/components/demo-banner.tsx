'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Eye, X, Camera, Users, Building2 } from 'lucide-react'
import type { DemoRole } from '@/lib/demo-data'

const getRoleIcon = (role: DemoRole) => {
  const iconMap = {
    photographer: Camera,
    assistant: Users,
    admin: Building2,
  }
  return iconMap[role] || Camera
}

const getRoleLabel = (role: DemoRole) => {
  const labelMap = {
    photographer: 'Photographer',
    assistant: 'Assistant',
    admin: 'Studio Admin',
  }
  return labelMap[role] || 'User'
}

export function DemoBanner() {
  const router = useRouter()
  const [isDemo, setIsDemo] = useState(false)
  const [role, setRole] = useState<DemoRole>('photographer')
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const demoMode = localStorage.getItem('focusflow-demo-mode')
    const storedRole = localStorage.getItem('focusflow-demo-role') as DemoRole | null

    if (demoMode === 'true') {
      setIsDemo(true)
      if (storedRole && ['photographer', 'assistant', 'admin'].includes(storedRole)) {
        setRole(storedRole)
      }
    }
  }, [])

  const handleExit = () => {
    localStorage.removeItem('focusflow-demo-mode')
    localStorage.removeItem('focusflow-demo-role')
    router.push('/')
  }

  const handleSwitchRole = (newRole: DemoRole) => {
    localStorage.setItem('focusflow-demo-role', newRole)
    setRole(newRole)
    // Refresh the page to update demo data
    router.refresh()
  }

  if (!isDemo || !isVisible) {
    return null
  }

  const RoleIcon = getRoleIcon(role)

  return (
    <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700">
              <Eye className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Demo Mode
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-300">
              <RoleIcon className="h-4 w-4" />
              <span>Viewing as {getRoleLabel(role)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Role Switcher */}
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <span className="text-xs text-amber-600 dark:text-amber-400 mr-1">
                Switch:
              </span>
              {(['photographer', 'assistant', 'admin'] as const).map((r) => (
                <Button
                  key={r}
                  variant={role === r ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-7 text-xs px-2 ${
                    role === r
                      ? ''
                      : 'text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100'
                  }`}
                  onClick={() => handleSwitchRole(r)}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1, 3)}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              onClick={handleExit}
            >
              Exit Demo
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
