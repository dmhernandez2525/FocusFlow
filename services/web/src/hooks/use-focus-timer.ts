'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'break' | 'completed'
export type TimerMode = 'work' | 'shortBreak' | 'longBreak'

export interface TimerSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsBeforeLongBreak: number
  autoStartBreaks: boolean
  autoStartWork: boolean
}

export interface FocusSession {
  id: string
  startedAt: Date
  endedAt: Date | null
  mode: TimerMode
  duration: number
  completed: boolean
}

export interface TimerState {
  status: TimerStatus
  mode: TimerMode
  timeRemaining: number
  totalTime: number
  sessionsCompleted: number
  currentSession: FocusSession | null
  history: FocusSession[]
}

export const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
}

function generateId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getDurationForMode(mode: TimerMode, settings: TimerSettings): number {
  switch (mode) {
    case 'work':
      return settings.workDuration
    case 'shortBreak':
      return settings.shortBreakDuration
    case 'longBreak':
      return settings.longBreakDuration
  }
}

export function getNextMode(
  currentMode: TimerMode,
  sessionsCompleted: number,
  settings: TimerSettings
): TimerMode {
  if (currentMode === 'work') {
    return (sessionsCompleted + 1) % settings.sessionsBeforeLongBreak === 0
      ? 'longBreak'
      : 'shortBreak'
  }
  return 'work'
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function getProgressPercentage(timeRemaining: number, totalTime: number): number {
  if (totalTime === 0) return 0
  return ((totalTime - timeRemaining) / totalTime) * 100
}

export function useFocusTimer(initialSettings?: Partial<TimerSettings>) {
  const settings = { ...DEFAULT_SETTINGS, ...initialSettings }

  const [state, setState] = useState<TimerState>({
    status: 'idle',
    mode: 'work',
    timeRemaining: settings.workDuration,
    totalTime: settings.workDuration,
    sessionsCompleted: 0,
    currentSession: null,
    history: [],
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const completeSession = useCallback(() => {
    setState((prev) => {
      const completedSession: FocusSession = {
        id: prev.currentSession?.id || generateId(),
        startedAt: prev.currentSession?.startedAt || new Date(),
        endedAt: new Date(),
        mode: prev.mode,
        duration: prev.totalTime - prev.timeRemaining,
        completed: true,
      }

      const newSessionsCompleted =
        prev.mode === 'work' ? prev.sessionsCompleted + 1 : prev.sessionsCompleted
      const nextMode = getNextMode(prev.mode, prev.sessionsCompleted, settingsRef.current)
      const nextDuration = getDurationForMode(nextMode, settingsRef.current)

      const shouldAutoStart =
        (prev.mode === 'work' && settingsRef.current.autoStartBreaks) ||
        (prev.mode !== 'work' && settingsRef.current.autoStartWork)

      return {
        ...prev,
        status: shouldAutoStart ? 'running' : 'idle',
        mode: nextMode,
        timeRemaining: nextDuration,
        totalTime: nextDuration,
        sessionsCompleted: newSessionsCompleted,
        currentSession: shouldAutoStart
          ? { id: generateId(), startedAt: new Date(), endedAt: null, mode: nextMode, duration: 0, completed: false }
          : null,
        history: [...prev.history, completedSession],
      }
    })
  }, [])

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.timeRemaining <= 1) {
        clearTimer()
        return { ...prev, timeRemaining: 0 }
      }
      return { ...prev, timeRemaining: prev.timeRemaining - 1 }
    })
  }, [clearTimer])

  useEffect(() => {
    if (state.timeRemaining === 0 && state.status === 'running') {
      completeSession()
    }
  }, [state.timeRemaining, state.status, completeSession])

  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  const start = useCallback(() => {
    clearTimer()
    setState((prev) => {
      const session = prev.currentSession || {
        id: generateId(),
        startedAt: new Date(),
        endedAt: null,
        mode: prev.mode,
        duration: 0,
        completed: false,
      }
      return { ...prev, status: 'running', currentSession: session }
    })
    intervalRef.current = setInterval(tick, 1000)
  }, [clearTimer, tick])

  const pause = useCallback(() => {
    clearTimer()
    setState((prev) => ({ ...prev, status: 'paused' }))
  }, [clearTimer])

  const resume = useCallback(() => {
    clearTimer()
    setState((prev) => ({ ...prev, status: 'running' }))
    intervalRef.current = setInterval(tick, 1000)
  }, [clearTimer, tick])

  const reset = useCallback(() => {
    clearTimer()
    const duration = getDurationForMode(state.mode, settingsRef.current)
    setState((prev) => ({
      ...prev,
      status: 'idle',
      timeRemaining: duration,
      totalTime: duration,
      currentSession: null,
    }))
  }, [clearTimer, state.mode])

  const skip = useCallback(() => {
    clearTimer()
    setState((prev) => {
      const newSessionsCompleted =
        prev.mode === 'work' ? prev.sessionsCompleted + 1 : prev.sessionsCompleted
      const nextMode = getNextMode(prev.mode, prev.sessionsCompleted, settingsRef.current)
      const nextDuration = getDurationForMode(nextMode, settingsRef.current)

      const skippedSession: FocusSession | null = prev.currentSession
        ? {
            ...prev.currentSession,
            endedAt: new Date(),
            duration: prev.totalTime - prev.timeRemaining,
            completed: false,
          }
        : null

      return {
        ...prev,
        status: 'idle',
        mode: nextMode,
        timeRemaining: nextDuration,
        totalTime: nextDuration,
        sessionsCompleted: newSessionsCompleted,
        currentSession: null,
        history: skippedSession ? [...prev.history, skippedSession] : prev.history,
      }
    })
  }, [clearTimer])

  const updateSettings = useCallback(
    (newSettings: Partial<TimerSettings>) => {
      const merged = { ...settingsRef.current, ...newSettings }
      settingsRef.current = merged

      if (state.status === 'idle') {
        const duration = getDurationForMode(state.mode, merged)
        setState((prev) => ({
          ...prev,
          timeRemaining: duration,
          totalTime: duration,
        }))
      }
    },
    [state.status, state.mode]
  )

  return {
    ...state,
    settings,
    start,
    pause,
    resume,
    reset,
    skip,
    updateSettings,
    formattedTime: formatTime(state.timeRemaining),
    progress: getProgressPercentage(state.timeRemaining, state.totalTime),
  }
}
