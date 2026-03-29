export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  projectId?: string
  project?: { id: string; name: string; color: string | null }
  createdAt: string
  updatedAt: string
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  projectId?: string
  search?: string
}

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
  )
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false
    if (filters.priority && task.priority !== filters.priority) return false
    if (filters.projectId && task.projectId !== filters.projectId) return false
    if (filters.search) {
      const query = filters.search.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(query)
      const matchesDescription = task.description?.toLowerCase().includes(query)
      if (!matchesTitle && !matchesDescription) return false
    }
    return true
  })
}

export function getTaskStats(tasks: Task[]) {
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const todo = tasks.filter((t) => t.status === 'TODO').length
  const urgent = tasks.filter((t) => t.priority === 'URGENT').length
  const overdue = tasks.filter((t) => {
    if (!t.dueDate || t.status === 'COMPLETED' || t.status === 'CANCELLED') return false
    return new Date(t.dueDate) < new Date()
  }).length

  return { total, completed, inProgress, todo, urgent, overdue }
}

export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'URGENT':
      return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800'
    case 'HIGH':
      return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800'
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800'
    case 'LOW':
      return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800'
  }
}

export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'TODO':
      return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900'
    case 'IN_PROGRESS':
      return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900'
    case 'COMPLETED':
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900'
    case 'CANCELLED':
      return 'text-gray-400 bg-gray-50 dark:text-gray-500 dark:bg-gray-900'
  }
}

export function formatDueDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  if (diffDays <= 7) return `Due in ${diffDays}d`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
