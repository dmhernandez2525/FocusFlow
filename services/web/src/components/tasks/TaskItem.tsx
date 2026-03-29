'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react'
import {
  type Task,
  type TaskStatus,
  getPriorityColor,
  formatDueDate,
} from '@/lib/task-utils'

interface TaskItemProps {
  task: Task
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onStatusChange, onDelete }: TaskItemProps) {
  const isCompleted = task.status === 'COMPLETED'
  const isCancelled = task.status === 'CANCELLED'

  const handleToggle = () => {
    if (isCompleted) {
      onStatusChange(task.id, 'TODO')
    } else {
      onStatusChange(task.id, 'COMPLETED')
    }
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-colors',
        isCompleted && 'opacity-60',
        isCancelled && 'opacity-40'
      )}
    >
      <button
        onClick={handleToggle}
        className="mt-0.5 flex-shrink-0"
        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn('text-sm font-medium', isCompleted && 'line-through')}>
            {task.title}
          </p>
          <span
            className={cn(
              'px-1.5 py-0.5 text-xs font-medium rounded border',
              getPriorityColor(task.priority)
            )}
          >
            {task.priority}
          </span>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1.5">
          {task.project && (
            <span className="text-xs text-muted-foreground">
              {task.project.name}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 flex-shrink-0"
        onClick={() => onDelete(task.id)}
      >
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  )
}
