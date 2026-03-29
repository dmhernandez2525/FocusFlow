import { renderHook, act } from '@testing-library/react'
import {
  useFocusTimer,
  formatTime,
  getProgressPercentage,
  getNextMode,
  DEFAULT_SETTINGS,
} from '@/hooks/use-focus-timer'

// Pure function tests
describe('formatTime', () => {
  it('formats zero seconds', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('formats seconds only', () => {
    expect(formatTime(45)).toBe('00:45')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('02:05')
  })

  it('formats full 25 minutes', () => {
    expect(formatTime(1500)).toBe('25:00')
  })

  it('pads single digits', () => {
    expect(formatTime(61)).toBe('01:01')
  })

  it('formats large values', () => {
    expect(formatTime(3600)).toBe('60:00')
  })
})

describe('getProgressPercentage', () => {
  it('returns 0 when no time has passed', () => {
    expect(getProgressPercentage(1500, 1500)).toBe(0)
  })

  it('returns 100 when all time has passed', () => {
    expect(getProgressPercentage(0, 1500)).toBe(100)
  })

  it('returns 50 at halfway', () => {
    expect(getProgressPercentage(750, 1500)).toBe(50)
  })

  it('returns 0 when totalTime is 0', () => {
    expect(getProgressPercentage(0, 0)).toBe(0)
  })

  it('calculates fractional progress', () => {
    expect(getProgressPercentage(900, 1500)).toBeCloseTo(40)
  })
})

describe('getNextMode', () => {
  it('returns shortBreak after work when not at long break threshold', () => {
    expect(getNextMode('work', 0, DEFAULT_SETTINGS)).toBe('shortBreak')
    expect(getNextMode('work', 1, DEFAULT_SETTINGS)).toBe('shortBreak')
    expect(getNextMode('work', 2, DEFAULT_SETTINGS)).toBe('shortBreak')
  })

  it('returns longBreak after work at threshold', () => {
    expect(getNextMode('work', 3, DEFAULT_SETTINGS)).toBe('longBreak')
  })

  it('returns work after shortBreak', () => {
    expect(getNextMode('shortBreak', 1, DEFAULT_SETTINGS)).toBe('work')
  })

  it('returns work after longBreak', () => {
    expect(getNextMode('longBreak', 4, DEFAULT_SETTINGS)).toBe('work')
  })

  it('respects custom sessionsBeforeLongBreak', () => {
    const customSettings = { ...DEFAULT_SETTINGS, sessionsBeforeLongBreak: 2 }
    expect(getNextMode('work', 1, customSettings)).toBe('longBreak')
    expect(getNextMode('work', 0, customSettings)).toBe('shortBreak')
  })
})

// Hook tests
describe('useFocusTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useFocusTimer())

    expect(result.current.status).toBe('idle')
    expect(result.current.mode).toBe('work')
    expect(result.current.timeRemaining).toBe(25 * 60)
    expect(result.current.sessionsCompleted).toBe(0)
    expect(result.current.history).toEqual([])
    expect(result.current.formattedTime).toBe('25:00')
    expect(result.current.progress).toBe(0)
  })

  it('initializes with custom settings', () => {
    const { result } = renderHook(() =>
      useFocusTimer({ workDuration: 50 * 60 })
    )
    expect(result.current.timeRemaining).toBe(50 * 60)
    expect(result.current.formattedTime).toBe('50:00')
  })

  it('starts the timer', () => {
    const { result } = renderHook(() => useFocusTimer())

    act(() => {
      result.current.start()
    })

    expect(result.current.status).toBe('running')
    expect(result.current.currentSession).not.toBeNull()
  })

  it('ticks down when running', () => {
    const { result } = renderHook(() => useFocusTimer())

    act(() => {
      result.current.start()
    })

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(result.current.timeRemaining).toBe(25 * 60 - 3)
  })

  it('pauses the timer', () => {
    const { result } = renderHook(() => useFocusTimer())

    act(() => {
      result.current.start()
    })

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    act(() => {
      result.current.pause()
    })

    expect(result.current.status).toBe('paused')
    const timeAfterPause = result.current.timeRemaining

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(result.current.timeRemaining).toBe(timeAfterPause)
  })

  it('resumes the timer', () => {
    const { result } = renderHook(() => useFocusTimer())

    act(() => {
      result.current.start()
    })

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    act(() => {
      result.current.pause()
    })

    const pausedTime = result.current.timeRemaining

    act(() => {
      result.current.resume()
    })

    expect(result.current.status).toBe('running')

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    expect(result.current.timeRemaining).toBe(pausedTime - 2)
  })

  it('resets the timer', () => {
    const { result } = renderHook(() => useFocusTimer())

    act(() => {
      result.current.start()
    })

    act(() => {
      jest.advanceTimersByTime(10000)
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.timeRemaining).toBe(25 * 60)
    expect(result.current.currentSession).toBeNull()
  })

  it('skips to next mode', () => {
    const { result } = renderHook(() => useFocusTimer())

    act(() => {
      result.current.start()
    })

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    act(() => {
      result.current.skip()
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.mode).toBe('shortBreak')
    expect(result.current.timeRemaining).toBe(5 * 60)
    expect(result.current.sessionsCompleted).toBe(1)
    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].completed).toBe(false)
  })

  it('completes a full work session and transitions to break', () => {
    const { result } = renderHook(() =>
      useFocusTimer({ workDuration: 3 })
    )

    act(() => {
      result.current.start()
    })

    act(() => {
      jest.advanceTimersByTime(4000)
    })

    expect(result.current.mode).toBe('shortBreak')
    expect(result.current.sessionsCompleted).toBe(1)
    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].completed).toBe(true)
  })

  it('auto-starts breaks when enabled', () => {
    const { result } = renderHook(() =>
      useFocusTimer({ workDuration: 2, autoStartBreaks: true })
    )

    act(() => {
      result.current.start()
    })

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(result.current.mode).toBe('shortBreak')
    expect(result.current.status).toBe('running')
  })

  it('updates settings when idle', () => {
    const { result } = renderHook(() => useFocusTimer())

    act(() => {
      result.current.updateSettings({ workDuration: 50 * 60 })
    })

    expect(result.current.timeRemaining).toBe(50 * 60)
  })

  it('does not update time when running', () => {
    const { result } = renderHook(() => useFocusTimer())

    act(() => {
      result.current.start()
    })

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    act(() => {
      result.current.updateSettings({ workDuration: 50 * 60 })
    })

    // Time should not jump to new duration while running
    expect(result.current.timeRemaining).toBeLessThan(50 * 60)
  })

  it('skips from paused state', () => {
    const { result } = renderHook(() => useFocusTimer())

    act(() => {
      result.current.start()
    })

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    act(() => {
      result.current.pause()
    })

    expect(result.current.status).toBe('paused')

    act(() => {
      result.current.skip()
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.mode).toBe('shortBreak')
    expect(result.current.sessionsCompleted).toBe(1)
    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].completed).toBe(false)
  })

  it('cycles through full Pomodoro with long break', () => {
    const { result } = renderHook(() =>
      useFocusTimer({ workDuration: 2, shortBreakDuration: 1, longBreakDuration: 3, sessionsBeforeLongBreak: 2 })
    )

    // Session 1: work
    act(() => { result.current.start() })
    act(() => { jest.advanceTimersByTime(3000) })
    expect(result.current.mode).toBe('shortBreak')
    expect(result.current.sessionsCompleted).toBe(1)

    // Short break
    act(() => { result.current.start() })
    act(() => { jest.advanceTimersByTime(2000) })
    expect(result.current.mode).toBe('work')

    // Session 2: work
    act(() => { result.current.start() })
    act(() => { jest.advanceTimersByTime(3000) })
    // 2nd session triggers long break (sessionsBeforeLongBreak = 2)
    expect(result.current.mode).toBe('longBreak')
    expect(result.current.sessionsCompleted).toBe(2)
    expect(result.current.timeRemaining).toBe(3) // longBreakDuration

    // Long break
    act(() => { result.current.start() })
    act(() => { jest.advanceTimersByTime(4000) })
    expect(result.current.mode).toBe('work')
  })
})
