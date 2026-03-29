import { render, screen, fireEvent } from '@testing-library/react'
import { TimerControls } from '@/components/focus/TimerControls'

const defaultProps = {
  status: 'idle' as const,
  onStart: jest.fn(),
  onPause: jest.fn(),
  onResume: jest.fn(),
  onReset: jest.fn(),
  onSkip: jest.fn(),
}

describe('TimerControls', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows only Start button when idle', () => {
    render(<TimerControls {...defaultProps} status="idle" />)
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.queryByText('Pause')).not.toBeInTheDocument()
    expect(screen.queryByText('Resume')).not.toBeInTheDocument()
  })

  it('shows only Pause button when running', () => {
    render(<TimerControls {...defaultProps} status="running" />)
    expect(screen.getByText('Pause')).toBeInTheDocument()
    expect(screen.queryByText('Start')).not.toBeInTheDocument()
    expect(screen.queryByText('Resume')).not.toBeInTheDocument()
  })

  it('shows only Resume button when paused', () => {
    render(<TimerControls {...defaultProps} status="paused" />)
    expect(screen.getByText('Resume')).toBeInTheDocument()
    expect(screen.queryByText('Start')).not.toBeInTheDocument()
    expect(screen.queryByText('Pause')).not.toBeInTheDocument()
  })

  it('calls onStart when Start is clicked', () => {
    render(<TimerControls {...defaultProps} status="idle" />)
    fireEvent.click(screen.getByText('Start'))
    expect(defaultProps.onStart).toHaveBeenCalledTimes(1)
  })

  it('calls onPause when Pause is clicked', () => {
    render(<TimerControls {...defaultProps} status="running" />)
    fireEvent.click(screen.getByText('Pause'))
    expect(defaultProps.onPause).toHaveBeenCalledTimes(1)
  })

  it('calls onResume when Resume is clicked', () => {
    render(<TimerControls {...defaultProps} status="paused" />)
    fireEvent.click(screen.getByText('Resume'))
    expect(defaultProps.onResume).toHaveBeenCalledTimes(1)
  })

  it('calls onReset when Reset button is clicked', () => {
    render(<TimerControls {...defaultProps} />)
    fireEvent.click(screen.getByTitle('Reset'))
    expect(defaultProps.onReset).toHaveBeenCalledTimes(1)
  })

  it('calls onSkip when Skip button is clicked', () => {
    render(<TimerControls {...defaultProps} />)
    fireEvent.click(screen.getByTitle('Skip'))
    expect(defaultProps.onSkip).toHaveBeenCalledTimes(1)
  })

  it('always renders Reset and Skip buttons regardless of status', () => {
    const { rerender } = render(<TimerControls {...defaultProps} status="idle" />)
    expect(screen.getByTitle('Reset')).toBeInTheDocument()
    expect(screen.getByTitle('Skip')).toBeInTheDocument()

    rerender(<TimerControls {...defaultProps} status="running" />)
    expect(screen.getByTitle('Reset')).toBeInTheDocument()
    expect(screen.getByTitle('Skip')).toBeInTheDocument()

    rerender(<TimerControls {...defaultProps} status="paused" />)
    expect(screen.getByTitle('Reset')).toBeInTheDocument()
    expect(screen.getByTitle('Skip')).toBeInTheDocument()
  })
})
