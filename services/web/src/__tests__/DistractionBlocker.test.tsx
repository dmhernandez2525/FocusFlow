import { render, screen, fireEvent } from '@testing-library/react'
import { DistractionBlocker } from '@/components/focus/DistractionBlocker'

describe('DistractionBlocker', () => {
  it('renders the title', () => {
    render(<DistractionBlocker isActive={false} />)
    expect(screen.getByText('Distraction Blocker')).toBeInTheDocument()
  })

  it('shows enabled state by default', () => {
    render(<DistractionBlocker isActive={false} />)
    expect(screen.getByText('Enabled')).toBeInTheDocument()
  })

  it('toggles between enabled and disabled', () => {
    render(<DistractionBlocker isActive={false} />)
    fireEvent.click(screen.getByText('Enabled'))
    expect(screen.getByText('Disabled')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Disabled'))
    expect(screen.getByText('Enabled')).toBeInTheDocument()
  })

  it('shows active blocking message when active and enabled', () => {
    render(<DistractionBlocker isActive={true} />)
    expect(screen.getByText(/Blocking \d+ distracting sites/)).toBeInTheDocument()
  })

  it('does not show blocking message when not active', () => {
    render(<DistractionBlocker isActive={false} />)
    expect(screen.queryByText(/Blocking \d+ distracting sites/)).not.toBeInTheDocument()
  })

  it('does not show blocking message when disabled even if active', () => {
    render(<DistractionBlocker isActive={true} />)
    fireEvent.click(screen.getByText('Enabled'))
    expect(screen.queryByText(/Blocking \d+ distracting sites/)).not.toBeInTheDocument()
  })

  it('renders default blocked sites', () => {
    render(<DistractionBlocker isActive={false} />)
    expect(screen.getByText('youtube.com')).toBeInTheDocument()
    expect(screen.getByText('twitter.com')).toBeInTheDocument()
    expect(screen.getByText('facebook.com')).toBeInTheDocument()
  })

  it('shows category labels', () => {
    render(<DistractionBlocker isActive={false} />)
    expect(screen.getByText('social')).toBeInTheDocument()
    expect(screen.getByText('video')).toBeInTheDocument()
  })

  it('adds a new site via add button', () => {
    render(<DistractionBlocker isActive={false} />)
    const input = screen.getByPlaceholderText('Add site (e.g., example.com)')
    fireEvent.change(input, { target: { value: 'pinterest.com' } })
    fireEvent.click(screen.getByTestId('add-site-btn'))
    expect(screen.getByText('pinterest.com')).toBeInTheDocument()
  })

  it('adds a new site via Enter key', () => {
    render(<DistractionBlocker isActive={false} />)
    const input = screen.getByPlaceholderText('Add site (e.g., example.com)')
    fireEvent.change(input, { target: { value: 'linkedin.com' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('linkedin.com')).toBeInTheDocument()
  })

  it('does not add empty sites', () => {
    render(<DistractionBlocker isActive={false} />)
    const input = screen.getByPlaceholderText('Add site (e.g., example.com)')
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    // Should not crash or add anything
  })

  it('clears input after adding', () => {
    render(<DistractionBlocker isActive={false} />)
    const input = screen.getByPlaceholderText('Add site (e.g., example.com)') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'pinterest.com' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(input.value).toBe('')
  })

  it('removes a site when remove button is clicked', () => {
    render(<DistractionBlocker isActive={false} />)
    expect(screen.getByText('youtube.com')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('remove-site-yt'))
    expect(screen.queryByText('youtube.com')).not.toBeInTheDocument()
  })

  it('ignores non-Enter key presses', () => {
    render(<DistractionBlocker isActive={false} />)
    const input = screen.getByPlaceholderText('Add site (e.g., example.com)')
    fireEvent.change(input, { target: { value: 'test.com' } })
    fireEvent.keyDown(input, { key: 'Tab' })
    expect(screen.queryByText('test.com')).not.toBeInTheDocument()
  })
})
