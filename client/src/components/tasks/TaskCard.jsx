import { Pencil, Trash2, Calendar, Tag } from 'lucide-react'
import { Badge } from '../ui'
import { PRIORITY_CONFIG, STATUS_CONFIG, formatDate, isOverdue, isDueToday } from '../../utils'

export default function TaskCard({ task, onEdit, onDelete, style }) {
  const priority = PRIORITY_CONFIG[task.priority]
  const status = STATUS_CONFIG[task.status]
  const overdue = isOverdue(task.dueDate, task.status)
  const dueToday = isDueToday(task.dueDate)
  const done = task.status === 'completed'

  return (
    <div
      className="card-hover p-4 group animate-fade-up "
      style={style}
    >
      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${priority?.dot}`} />
        <div className="flex-1 min-w-0">
          <p className={`font-500 text-sm leading-snug ${done ? 'line-through text-muted' : 'text-bright'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-muted hover:text-bright hover:bg-surface-600 transition-all"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status badge */}
        <Badge color={status.bg} text={status.color} border={status.border}>
          {status.label}
        </Badge>

        {/* Priority badge */}
        <Badge color={priority?.bg} text={priority?.color} border={priority?.border}>
          {priority?.label}
        </Badge>

        {/* Due date */}
        {task.dueDate && (
          <span className={`flex items-center gap-1 text-xs font-mono ml-auto ${
            overdue ? 'text-red-400' : dueToday ? 'text-yellow-400' : 'text-muted'
          }`}>
            <Calendar size={10} />
            {overdue ? 'Overdue · ' : dueToday ? 'Today · ' : ''}
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
          <Tag size={10} className="text-muted shrink-0" />
          {task.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
          {task.tags.length > 4 && (
            <span className="tag">+{task.tags.length - 4}</span>
          )}
        </div>
      )}
    </div>
  )
}
