'use client'

import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import type { TimerStatus } from '@/hooks/use-focus-timer'

interface TimerControlsProps {
  status: TimerStatus
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onSkip: () => void
}

export function TimerControls({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
}: TimerControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon" onClick={onReset} title="Reset">
        <RotateCcw className="h-4 w-4" />
      </Button>

      {status === 'idle' && (
        <Button size="lg" onClick={onStart} className="px-8">
          <Play className="h-5 w-5 mr-2" />
          Start
        </Button>
      )}

      {status === 'running' && (
        <Button size="lg" onClick={onPause} variant="secondary" className="px-8">
          <Pause className="h-5 w-5 mr-2" />
          Pause
        </Button>
      )}

      {status === 'paused' && (
        <Button size="lg" onClick={onResume} className="px-8">
          <Play className="h-5 w-5 mr-2" />
          Resume
        </Button>
      )}

      <Button variant="outline" size="icon" onClick={onSkip} title="Skip">
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  )
}
