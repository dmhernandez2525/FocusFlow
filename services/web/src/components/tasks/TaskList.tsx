'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Filter } from 'lucide-react'
import { TaskItem } from './TaskItem'
import {
  type Task,
  type TaskStatus,
  type TaskPriority,
  type TaskFilters,
  filterTasks,
  sortTasksByPriority,
  getTaskStats,
} from '@/lib/task-utils'

interface TaskListProps {
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
  onAdd: (title: string, priority: TaskPriority) => void
}

export function TaskList({ tasks, onStatusChange, onDelete, onAdd }: TaskListProps) {
  const [filters, setFilters] = useState<TaskFilters>({})
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const filteredTasks = useMemo(
    () => sortTasksByPriority(filterTasks(tasks, filters)),
    [tasks, filters]
  )
  const stats = useMemo(() => getTaskStats(tasks), [tasks])

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    onAdd(newTaskTitle.trim(), 'MEDIUM')
    setNewTaskTitle('')
    setShowAddForm(false)
  }

  const statusOptions: (TaskStatus | undefined)[] = [undefined, 'TODO', 'IN_PROGRESS', 'COMPLETED']
  const priorityOptions: (TaskPriority | undefined)[] = [undefined, 'URGENT', 'HIGH', 'MEDIUM', 'LOW']

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tasks</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowFilters(!showFilters)} data-testid="filter-toggle">
              <Filter className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-sm">
          <div className="p-2 bg-muted/50 rounded">
            <p className="font-semibold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <p className="font-semibold">{stats.todo}</p>
            <p className="text-xs text-muted-foreground">To Do</p>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <p className="font-semibold">{stats.inProgress}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <p className="font-semibold">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="flex gap-2">
            <Input
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              autoFocus
            />
            <Button onClick={handleAddTask}>Add</Button>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={filters.search || ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value || undefined }))
                }
                className="h-8"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-1">
                {statusOptions.map((status) => (
                  <Button
                    key={status || 'all'}
                    variant={filters.status === status ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setFilters((prev) => ({ ...prev, status }))}
                  >
                    {status || 'All'}
                  </Button>
                ))}
              </div>
              <div className="flex gap-1">
                {priorityOptions.map((priority) => (
                  <Button
                    key={priority || 'any'}
                    variant={filters.priority === priority ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setFilters((prev) => ({ ...prev, priority }))}
                  >
                    {priority || 'Any Priority'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Task Items */}
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
          {filteredTasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {tasks.length === 0
                ? 'No tasks yet. Add your first task to get started!'
                : 'No tasks match the current filters.'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
