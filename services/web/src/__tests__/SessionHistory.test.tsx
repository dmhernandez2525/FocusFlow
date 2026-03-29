import { render, screen } from '@testing-library/react'
import { SessionHistory } from '@/components/focus/SessionHistory'
import type { FocusSession } from '@/hooks/use-focus-timer'

const createSession = (overrides: Partial<FocusSession> = {}): FocusSession => ({
  id: 'test-session',
  startedAt: new Date(),
  endedAt: new Date(),
  mode: 'work',
  duration: 1500,
  completed: true,
  ...overrides,
})

describe('SessionHistory', () => {
  it('shows empty message when no sessions', () => {
    render(
      <SessionHistory sessions={[]} sessionsCompleted={0} totalSessions={4} />
    )
    expect(screen.getByText(/No sessions yet/)).toBeInTheDocument()
  })

  it('shows session count', () => {
    render(
      <SessionHistory sessions={[]} sessionsCompleted={2} totalSessions={4} />
    )
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('of 4 sessions')).toBeInTheDocument()
  })

  it('renders session entries', () => {
    const sessions = [
      createSession({ id: '1', mode: 'work', duration: 1500, completed: true }),
      createSession({ id: '2', mode: 'shortBreak', duration: 300, completed: true }),
    ]
    render(
      <SessionHistory sessions={sessions} sessionsCompleted={1} totalSessions={4} />
    )
    expect(screen.getByText('Focus')).toBeInTheDocument()
    expect(screen.getByText('Short Break')).toBeInTheDocument()
  })

  it('calculates total focus time from work sessions only', () => {
    const sessions = [
      createSession({ id: '1', mode: 'work', duration: 1500 }),
      createSession({ id: '2', mode: 'shortBreak', duration: 300 }),
      createSession({ id: '3', mode: 'work', duration: 1500 }),
    ]
    render(
      <SessionHistory sessions={sessions} sessionsCompleted={2} totalSessions={4} />
    )
    // 3000 seconds = 50:00
    expect(screen.getByText('50:00')).toBeInTheDocument()
  })

  it('counts completed work sessions', () => {
    const sessions = [
      createSession({ id: '1', mode: 'work', completed: true }),
      createSession({ id: '2', mode: 'work', completed: false }),
      createSession({ id: '3', mode: 'shortBreak', completed: true }),
    ]
    render(
      <SessionHistory sessions={sessions} sessionsCompleted={1} totalSessions={4} />
    )
    // Only 1 completed work session - find by proximity to "Completed" label
    expect(screen.getByText('Completed')).toBeInTheDocument()
    const completedLabel = screen.getByText('Completed')
    const completedStat = completedLabel.parentElement?.querySelector('.text-2xl')
    expect(completedStat?.textContent).toBe('1')
  })
})
