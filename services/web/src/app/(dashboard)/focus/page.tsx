'use client'

import { useFocusTimer } from '@/hooks/use-focus-timer'
import { TimerDisplay } from '@/components/focus/TimerDisplay'
import { TimerControls } from '@/components/focus/TimerControls'
import { SessionHistory } from '@/components/focus/SessionHistory'
import { DistractionBlocker } from '@/components/focus/DistractionBlocker'
import { Card, CardContent } from '@/components/ui/card'

export default function FocusPage() {
  const timer = useFocusTimer()

  const isFocusActive = timer.status === 'running' && timer.mode === 'work'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Focus Timer</h1>
        <p className="text-muted-foreground">
          Stay focused with Pomodoro technique. Work in intervals, take breaks.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timer */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="flex flex-col items-center py-8 space-y-6">
              <TimerDisplay
                formattedTime={timer.formattedTime}
                progress={timer.progress}
                mode={timer.mode}
                status={timer.status}
              />

              <TimerControls
                status={timer.status}
                onStart={timer.start}
                onPause={timer.pause}
                onResume={timer.resume}
                onReset={timer.reset}
                onSkip={timer.skip}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SessionHistory
            sessions={timer.history}
            sessionsCompleted={timer.sessionsCompleted}
            totalSessions={timer.settings.sessionsBeforeLongBreak}
          />
          <DistractionBlocker isActive={isFocusActive} />
        </div>
      </div>
    </div>
  )
}
