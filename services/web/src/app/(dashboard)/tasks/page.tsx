'use client'

import { useState, useCallback } from 'react'
import { TaskList } from '@/components/tasks/TaskList'
import type { Task, TaskStatus, TaskPriority } from '@/lib/task-utils'

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Review project proposal',
    description: 'Go through the Q2 project proposal and provide feedback',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Write unit tests for auth module',
    description: 'Add missing test coverage for the authentication flows',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Update documentation',
    description: 'Update the API documentation with new endpoints',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Fix CSS layout bug on mobile',
    status: 'COMPLETED',
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Refactor database queries',
    description: 'Optimize slow queries in the dashboard endpoint',
    status: 'TODO',
    priority: 'LOW',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)

  const handleStatusChange = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status, updatedAt: new Date().toISOString() } : task
      )
    )
  }, [])

  const handleDelete = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  const handleAdd = useCallback((title: string, priority: TaskPriority) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      status: 'TODO',
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTasks((prev) => [newTask, ...prev])
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">
          Manage your tasks, set priorities, and track progress.
        </p>
      </div>
      <TaskList
        tasks={tasks}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
    </div>
  )
}
