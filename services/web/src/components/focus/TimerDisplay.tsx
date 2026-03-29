'use client'

import { cn } from '@/lib/utils'
import type { TimerMode, TimerStatus } from '@/hooks/use-focus-timer'

interface TimerDisplayProps {
  formattedTime: string
  progress: number
  mode: TimerMode
  status: TimerStatus
}

const MODE_COLORS: Record<TimerMode, string> = {
  work: 'text-primary',
  shortBreak: 'text-green-500',
  longBreak: 'text-blue-500',
}

const MODE_TRACK_COLORS: Record<TimerMode, string> = {
  work: 'stroke-primary',
  shortBreak: 'stroke-green-500',
  longBreak: 'stroke-blue-500',
}

const MODE_LABELS: Record<TimerMode, string> = {
  work: 'Focus Time',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
}

export function TimerDisplay({ formattedTime, progress, mode, status }: TimerDisplayProps) {
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-4">
      <p className={cn('text-sm font-medium uppercase tracking-wider', MODE_COLORS[mode])}>
        {MODE_LABELS[mode]}
      </p>

      <div className="relative w-72 h-72 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90 w-full h-full" viewBox="0 0 280 280">
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/30"
          />
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              MODE_TRACK_COLORS[mode],
              'transition-[stroke-dashoffset] duration-1000 ease-linear'
            )}
          />
        </svg>

        <div className="flex flex-col items-center z-10">
          <span
            className={cn(
              'text-6xl font-mono font-bold tabular-nums',
              status === 'paused' && 'animate-pulse'
            )}
          >
            {formattedTime}
          </span>
          {status === 'paused' && (
            <span className="text-sm text-muted-foreground mt-1">Paused</span>
          )}
        </div>
      </div>
    </div>
  )
}
