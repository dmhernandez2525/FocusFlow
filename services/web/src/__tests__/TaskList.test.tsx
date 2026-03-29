import { render, screen, fireEvent } from '@testing-library/react'
import { TaskList } from '@/components/tasks/TaskList'
import type { Task } from '@/lib/task-utils'

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  title: 'Test Task',
  status: 'TODO',
  priority: 'MEDIUM',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

const defaultProps = {
  tasks: [
    createTask({ id: '1', title: 'Task One', status: 'TODO', priority: 'HIGH' }),
    createTask({ id: '2', title: 'Task Two', status: 'IN_PROGRESS', priority: 'MEDIUM' }),
    createTask({ id: '3', title: 'Task Three', status: 'COMPLETED', priority: 'LOW' }),
  ],
  onStatusChange: jest.fn(),
  onDelete: jest.fn(),
  onAdd: jest.fn(),
}

describe('TaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the title', () => {
    render(<TaskList {...defaultProps} />)
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  it('renders task stats', () => {
    render(<TaskList {...defaultProps} />)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('renders all tasks sorted by priority', () => {
    render(<TaskList {...defaultProps} />)
    expect(screen.getByText('Task One')).toBeInTheDocument()
    expect(screen.getByText('Task Two')).toBeInTheDocument()
    expect(screen.getByText('Task Three')).toBeInTheDocument()
  })

  it('shows empty message when no tasks', () => {
    render(<TaskList {...defaultProps} tasks={[]} />)
    expect(screen.getByText(/No tasks yet/)).toBeInTheDocument()
  })

  it('toggles add task form', () => {
    render(<TaskList {...defaultProps} />)
    fireEvent.click(screen.getByText('Add Task'))
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Add Task'))
    expect(screen.queryByPlaceholderText('What needs to be done?')).not.toBeInTheDocument()
  })

  it('adds a new task', () => {
    render(<TaskList {...defaultProps} />)
    fireEvent.click(screen.getByText('Add Task'))
    const input = screen.getByPlaceholderText('What needs to be done?')
    fireEvent.change(input, { target: { value: 'New task' } })
    fireEvent.click(screen.getByText('Add'))
    expect(defaultProps.onAdd).toHaveBeenCalledWith('New task', 'MEDIUM')
  })

  it('adds task via Enter key', () => {
    render(<TaskList {...defaultProps} />)
    fireEvent.click(screen.getByText('Add Task'))
    const input = screen.getByPlaceholderText('What needs to be done?')
    fireEvent.change(input, { target: { value: 'Enter task' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(defaultProps.onAdd).toHaveBeenCalledWith('Enter task', 'MEDIUM')
  })

  it('does not add empty task', () => {
    render(<TaskList {...defaultProps} />)
    fireEvent.click(screen.getByText('Add Task'))
    const input = screen.getByPlaceholderText('What needs to be done?')
    fireEvent.change(input, { target: { value: '  ' } })
    fireEvent.click(screen.getByText('Add'))
    expect(defaultProps.onAdd).not.toHaveBeenCalled()
  })

  it('toggles filter panel via data-testid', () => {
    render(<TaskList {...defaultProps} />)
    fireEvent.click(screen.getByTestId('filter-toggle'))
    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument()
  })

  it('filters tasks by search text', () => {
    render(<TaskList {...defaultProps} />)
    fireEvent.click(screen.getByTestId('filter-toggle'))
    const searchInput = screen.getByPlaceholderText('Search tasks...')
    fireEvent.change(searchInput, { target: { value: 'One' } })
    expect(screen.getByText('Task One')).toBeInTheDocument()
    expect(screen.queryByText('Task Two')).not.toBeInTheDocument()
  })

  it('filters tasks by status', () => {
    render(<TaskList {...defaultProps} />)
    fireEvent.click(screen.getByTestId('filter-toggle'))
    fireEvent.click(screen.getByText('COMPLETED'))
    expect(screen.getByText('Task Three')).toBeInTheDocument()
    expect(screen.queryByText('Task One')).not.toBeInTheDocument()
  })

  it('shows no-match message when search excludes all', () => {
    render(<TaskList {...defaultProps} />)
    fireEvent.click(screen.getByTestId('filter-toggle'))
    const searchInput = screen.getByPlaceholderText('Search tasks...')
    fireEvent.change(searchInput, { target: { value: 'zzz-no-match-zzz' } })
    expect(screen.getByText('No tasks match the current filters.')).toBeInTheDocument()
  })

  it('clears search filter when emptied', () => {
    render(<TaskList {...defaultProps} />)
    fireEvent.click(screen.getByTestId('filter-toggle'))
    const searchInput = screen.getByPlaceholderText('Search tasks...')
    fireEvent.change(searchInput, { target: { value: 'One' } })
    expect(screen.queryByText('Task Two')).not.toBeInTheDocument()
    fireEvent.change(searchInput, { target: { value: '' } })
    expect(screen.getByText('Task Two')).toBeInTheDocument()
  })

  it('resets status filter when All is clicked', () => {
    render(<TaskList {...defaultProps} />)
    fireEvent.click(screen.getByTestId('filter-toggle'))
    fireEvent.click(screen.getByText('COMPLETED'))
    expect(screen.queryByText('Task One')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('All'))
    expect(screen.getByText('Task One')).toBeInTheDocument()
  })
})
