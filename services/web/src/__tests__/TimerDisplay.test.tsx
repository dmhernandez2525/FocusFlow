import { render, screen } from '@testing-library/react'
import { TimerDisplay } from '@/components/focus/TimerDisplay'

describe('TimerDisplay', () => {
  it('renders the formatted time', () => {
    render(
      <TimerDisplay formattedTime="25:00" progress={0} mode="work" status="idle" />
    )
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('shows "Focus Time" label for work mode', () => {
    render(
      <TimerDisplay formattedTime="25:00" progress={0} mode="work" status="idle" />
    )
    expect(screen.getByText('Focus Time')).toBeInTheDocument()
  })

  it('shows "Short Break" label for shortBreak mode', () => {
    render(
      <TimerDisplay formattedTime="05:00" progress={0} mode="shortBreak" status="idle" />
    )
    expect(screen.getByText('Short Break')).toBeInTheDocument()
  })

  it('shows "Long Break" label for longBreak mode', () => {
    render(
      <TimerDisplay formattedTime="15:00" progress={0} mode="longBreak" status="idle" />
    )
    expect(screen.getByText('Long Break')).toBeInTheDocument()
  })

  it('shows "Paused" text when paused', () => {
    render(
      <TimerDisplay formattedTime="20:00" progress={20} mode="work" status="paused" />
    )
    expect(screen.getByText('Paused')).toBeInTheDocument()
  })

  it('does not show "Paused" when running', () => {
    render(
      <TimerDisplay formattedTime="20:00" progress={20} mode="work" status="running" />
    )
    expect(screen.queryByText('Paused')).not.toBeInTheDocument()
  })

  it('renders SVG progress circle', () => {
    const { container } = render(
      <TimerDisplay formattedTime="25:00" progress={50} mode="work" status="running" />
    )
    const circles = container.querySelectorAll('circle')
    expect(circles).toHaveLength(2)
  })
})
