import { render, screen, fireEvent } from '@testing-library/react'
import { TaskItem } from '@/components/tasks/TaskItem'
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

describe('TaskItem', () => {
  const onStatusChange = jest.fn()
  const onDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the task title', () => {
    render(
      <TaskItem task={createTask()} onStatusChange={onStatusChange} onDelete={onDelete} />
    )
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('renders the priority badge', () => {
    render(
      <TaskItem task={createTask({ priority: 'HIGH' })} onStatusChange={onStatusChange} onDelete={onDelete} />
    )
    expect(screen.getByText('HIGH')).toBeInTheDocument()
  })

  it('renders description when present', () => {
    render(
      <TaskItem
        task={createTask({ description: 'Some details' })}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    )
    expect(screen.getByText('Some details')).toBeInTheDocument()
  })

  it('renders due date when present', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-28T12:00:00Z'))
    render(
      <TaskItem
        task={createTask({ dueDate: '2026-03-29T12:00:00Z' })}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    )
    expect(screen.getByText('Due tomorrow')).toBeInTheDocument()
    jest.useRealTimers()
  })

  it('renders project name when present', () => {
    render(
      <TaskItem
        task={createTask({ project: { id: 'p1', name: 'My Project', color: null } })}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    )
    expect(screen.getByText('My Project')).toBeInTheDocument()
  })

  it('marks as complete when checkbox clicked on TODO task', () => {
    render(
      <TaskItem task={createTask({ status: 'TODO' })} onStatusChange={onStatusChange} onDelete={onDelete} />
    )
    fireEvent.click(screen.getByLabelText('Mark as complete'))
    expect(onStatusChange).toHaveBeenCalledWith('1', 'COMPLETED')
  })

  it('marks as incomplete when checkbox clicked on COMPLETED task', () => {
    render(
      <TaskItem task={createTask({ status: 'COMPLETED' })} onStatusChange={onStatusChange} onDelete={onDelete} />
    )
    fireEvent.click(screen.getByLabelText('Mark as incomplete'))
    expect(onStatusChange).toHaveBeenCalledWith('1', 'TODO')
  })

  it('calls onDelete when delete button clicked', () => {
    render(
      <TaskItem task={createTask()} onStatusChange={onStatusChange} onDelete={onDelete} />
    )
    // Get the last button (delete)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[buttons.length - 1])
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('applies line-through style to completed tasks', () => {
    render(
      <TaskItem task={createTask({ status: 'COMPLETED' })} onStatusChange={onStatusChange} onDelete={onDelete} />
    )
    const title = screen.getByText('Test Task')
    expect(title.className).toContain('line-through')
  })

  it('applies reduced opacity to cancelled tasks', () => {
    const { container } = render(
      <TaskItem task={createTask({ status: 'CANCELLED' })} onStatusChange={onStatusChange} onDelete={onDelete} />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('opacity-40')
  })

  it('marks in-progress task as complete when toggled', () => {
    render(
      <TaskItem task={createTask({ status: 'IN_PROGRESS' })} onStatusChange={onStatusChange} onDelete={onDelete} />
    )
    fireEvent.click(screen.getByLabelText('Mark as complete'))
    expect(onStatusChange).toHaveBeenCalledWith('1', 'COMPLETED')
  })
})
