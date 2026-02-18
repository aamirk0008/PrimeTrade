import { format, formatDistanceToNow, isPast, isToday } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return null
  return format(new Date(date), 'MMM d, yyyy')
}

export const formatRelative = (date) => {
  if (!date) return null
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'completed') return false
  return isPast(new Date(dueDate))
}

export const isDueToday = (dueDate) => {
  if (!dueDate) return false
  return isToday(new Date(dueDate))
}

export const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', dot: 'bg-red-400' },
  high:   { label: 'High',   color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', dot: 'bg-orange-400' },
  medium: { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', dot: 'bg-yellow-400' },
  low:    { label: 'Low',    color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30',  dot: 'bg-green-400' },
}

export const STATUS_CONFIG = {
  todo:        { label: 'To Do',       color: 'text-subtle',   bg: 'bg-surface-600', border: 'border-border' },
  'in-progress':{ label: 'In Progress', color: 'text-sky-400',  bg: 'bg-sky-400/10',  border: 'border-sky-400/30' },
  completed:   { label: 'Completed',   color: 'text-acid-dim', bg: 'bg-acid/10',     border: 'border-acid/30' },
  archived:    { label: 'Archived',    color: 'text-muted',    bg: 'bg-surface-700', border: 'border-border' },
}

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

export const extractError = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong'
