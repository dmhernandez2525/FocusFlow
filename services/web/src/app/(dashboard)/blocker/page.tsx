'use client'

import { DistractionBlocker } from '@/components/focus/DistractionBlocker'

export default function BlockerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Distraction Blocker</h1>
        <p className="text-muted-foreground">
          Manage your blocked sites list and blocker settings.
        </p>
      </div>
      <div className="max-w-2xl">
        <DistractionBlocker isActive={false} />
      </div>
    </div>
  )
}
