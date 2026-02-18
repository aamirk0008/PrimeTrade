import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

const STATUS_OPTIONS = ['', 'todo', 'in-progress', 'completed', 'archived']
const PRIORITY_OPTIONS = ['', 'low', 'medium', 'high', 'urgent']
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created' },
  { value: 'dueDate',   label: 'Due date' },
  { value: 'priority',  label: 'Priority' },
  { value: 'title',     label: 'Title' },
]

const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-acid/10 text-acid border border-acid/20 text-xs font-mono">
    {label}
    <button onClick={onRemove} className="hover:text-acid-dim transition-colors">
      <X size={11} />
    </button>
  </span>
)

export default function TaskFilters({ filters, onFilterChange }) {
  const [showFilters, setShowFilters] = useState(false)

  const activeCount = [filters.status, filters.priority].filter(Boolean).length

  const clear = (key) => onFilterChange({ [key]: '' })
  const clearAll = () => onFilterChange({ status: '', priority: '', search: '' })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="input-base pl-9 pr-4 text-sm h-10"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-bright"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm transition-all duration-150
            ${showFilters || activeCount > 0
              ? 'border-acid/40 text-acid bg-acid/5'
              : 'border-border text-muted hover:border-border-bright hover:text-subtle'
            }`}
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-acid text-surface-950 text-[10px] font-display font-700 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {/* Sort */}
        <select
          value={filters.sortBy || 'createdAt'}
          onChange={(e) => onFilterChange({ sortBy: e.target.value })}
          className="input-base h-10 text-sm w-auto pr-8 cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Order toggle */}
        <button
          onClick={() => onFilterChange({ order: filters.order === 'asc' ? 'desc' : 'asc' })}
          className="px-3 py-2.5 rounded-lg border border-border text-muted text-xs font-mono hover:border-border-bright hover:text-bright transition-all"
          title={`Sort ${filters.order === 'asc' ? 'descending' : 'ascending'}`}
        >
          {filters.order === 'asc' ? '↑ ASC' : '↓ DESC'}
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="flex items-center gap-3 flex-wrap animate-fade-in p-4 rounded-xl bg-surface-800 border border-border">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted font-display uppercase tracking-wider">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="input-base h-8 text-xs w-auto pr-7 cursor-pointer"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s ? s.replace('-', ' ') : 'All'}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-muted font-display uppercase tracking-wider">Priority</label>
            <select
              value={filters.priority || ''}
              onChange={(e) => onFilterChange({ priority: e.target.value })}
              className="input-base h-8 text-xs w-auto pr-7 cursor-pointer"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p ? p : 'All'}</option>
              ))}
            </select>
          </div>

          {(filters.status || filters.priority || filters.search) && (
            <button
              onClick={clearAll}
              className="text-xs text-muted hover:text-red-400 transition-colors ml-auto font-mono flex items-center gap-1"
            >
              <X size={11} /> Clear all
            </button>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {(filters.status || filters.priority) && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.status && <FilterChip label={`Status: ${filters.status}`} onRemove={() => clear('status')} />}
          {filters.priority && <FilterChip label={`Priority: ${filters.priority}`} onRemove={() => clear('priority')} />}
        </div>
      )}
    </div>
  )
}
