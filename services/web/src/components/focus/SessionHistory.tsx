'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTime, type FocusSession } from '@/hooks/use-focus-timer'
import { CheckCircle2, XCircle } from 'lucide-react'

interface SessionHistoryProps {
  sessions: FocusSession[]
  sessionsCompleted: number
  totalSessions: number
}

const MODE_LABELS: Record<string, string> = {
  work: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
}

export function SessionHistory({ sessions, sessionsCompleted, totalSessions }: SessionHistoryProps) {
  const workSessions = sessions.filter((s) => s.mode === 'work')
  const totalFocusTime = workSessions.reduce((acc, s) => acc + s.duration, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Session History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{sessionsCompleted}</p>
            <p className="text-xs text-muted-foreground">of {totalSessions} sessions</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{formatTime(totalFocusTime)}</p>
            <p className="text-xs text-muted-foreground">Focus time</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{workSessions.filter((s) => s.completed).length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>

        {sessions.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {[...sessions].reverse().map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
              >
                <div className="flex items-center gap-2">
                  {session.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{MODE_LABELS[session.mode] || session.mode}</span>
                </div>
                <span className="text-muted-foreground font-mono">
                  {formatTime(session.duration)}
                </span>
              </div>
            ))}
          </div>
        )}

        {sessions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No sessions yet. Start your first focus session!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
