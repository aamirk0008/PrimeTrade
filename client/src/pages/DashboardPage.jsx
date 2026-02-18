import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, Clock, AlertCircle, Archive, Plus, TrendingUp, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTask } from '../context/TaskContext'
import { Skeleton, Badge } from '../components/ui'
import { PRIORITY_CONFIG, STATUS_CONFIG, formatDate, isOverdue } from '../utils'
import DashboardLayout from '../components/layout/DashboardLayout'

const StatCard = ({ icon: Icon, label, value, accent, delay }) => (
  <div
    className={`card p-5 animate-fade-up`}
    style={{ animationDelay: delay, animationFillMode: 'forwards' }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-3xl font-display font-700 text-bright mb-1">{value ?? '—'}</p>
    <p className="text-xs text-muted uppercase tracking-widest font-display">{label}</p>
  </div>
)

export default function DashboardPage() {
  const { user } = useAuth()
  const { tasks, stats, loading, statsLoading, fetchTasks, fetchStats } = useTask()

  useEffect(() => {
    fetchTasks({ limit: 5, sortBy: 'createdAt', order: 'desc' })
    fetchStats()
  }, [])

  const getCount = (status) =>
    stats?.byStatus?.find((s) => s._id === status)?.count ?? 0

  const statCards = [
    { icon: CheckSquare,  label: 'Completed',   value: getCount('completed'),   accent: 'bg-acid/10 text-acid',         delay: '0ms'   },
    { icon: Clock,        label: 'In Progress',  value: getCount('in-progress'), accent: 'bg-sky-400/10 text-sky-400',   delay: '75ms'  },
    { icon: AlertCircle,  label: 'Overdue',      value: stats?.overdue ?? 0,     accent: 'bg-red-400/10 text-red-400',   delay: '150ms' },
    { icon: Archive,      label: 'To Do',        value: getCount('todo'),        accent: 'bg-orange-400/10 text-orange-400', delay: '225ms' },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <p className="text-muted text-sm font-mono mb-1">{greeting} 👋</p>
        <h1 className="font-display font-700 text-3xl text-bright">
          {user?.name?.split(' ')[0]}'s workspace
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)
          : statCards.map((s) => <StatCard key={s.label} {...s} />)
        }
      </div>

      {/* Recent tasks */}
      <div className="card animate-fade-up " style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <TrendingUp size={16} className="text-acid" />
            <h2 className="font-display font-700 text-bright text-sm">Recent tasks</h2>
          </div>
          <Link
            to="/tasks"
            className="flex items-center gap-1.5 text-xs text-muted hover:text-acid transition-colors font-mono"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : tasks?.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-muted text-sm mb-3">No tasks yet. Get started!</p>
            <Link to="/tasks" className="btn-primary inline-flex text-xs px-4 py-2">
              <Plus size={14} /> Create task
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tasks?.map((task, i) => {
              const priority = PRIORITY_CONFIG[task.priority]
              const status = STATUS_CONFIG[task.status]
              const overdue = isOverdue(task.dueDate, task.status)

              return (
                <div
                  key={task._id}
                  className="flex items-center gap-4 p-4 hover:bg-surface-700/40 transition-colors animate-fade-up "
                  style={{ animationDelay: `${350 + i * 50}ms`, animationFillMode: 'forwards' }}
                >
                  {/* Priority dot */}
                  <div className={`w-2 h-2 rounded-full shrink-0 ${priority?.dot}`} />

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-500 truncate ${task.status === 'completed' ? 'line-through text-muted' : 'text-bright'}`}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className={`text-xs font-mono mt-0.5 ${overdue ? 'text-red-400' : 'text-muted'}`}>
                        {overdue ? '⚠ Overdue · ' : ''}{formatDate(task.dueDate)}
                      </p>
                    )}
                  </div>

                  <Badge
                    color={status.bg}
                    text={status.color}
                    border={status.border}
                    className="shrink-0 hidden sm:inline-flex"
                  >
                    {status.label}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
