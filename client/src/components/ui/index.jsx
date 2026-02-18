import { forwardRef, useState } from 'react'
import { Eye, EyeOff, X, AlertCircle } from 'lucide-react'
import { getInitials } from '../../utils'

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = forwardRef(({ label, error, icon: Icon, type = 'text', className = '', ...props }, ref) => {
  const [showPw, setShowPw] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPw ? 'text' : 'password') : type

  return (
    <div className="space-y-1.5">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
            <Icon size={15} />
          </span>
        )}
        <input
          ref={ref}
          type={inputType}
          className={`input-base ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-11' : ''} ${
            error ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : ''
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-subtle transition-colors"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
})
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────────────────────────
export const Textarea = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="label">{label}</label>}
    <textarea
      ref={ref}
      rows={3}
      className={`input-base resize-none ${error ? 'border-red-500/60' : ''} ${className}`}
      {...props}
    />
    {error && (
      <p className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
))
Textarea.displayName = 'Textarea'

// ─── Select ───────────────────────────────────────────────────────────────────
export const Select = forwardRef(({ label, error, children, className = '', ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="label">{label}</label>}
    <select
      ref={ref}
      className={`input-base appearance-none cursor-pointer ${error ? 'border-red-500/60' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && (
      <p className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
))
Select.displayName = 'Select'

// ─── Button ───────────────────────────────────────────────────────────────────
export const Button = ({ children, variant = 'primary', loading, className = '', ...props }) => {
  const variants = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  }
  return (
    <button className={`${variants[variant]} ${className}`} disabled={loading} {...props}>
      {loading ? <Spinner size={14} /> : children}
    </button>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 18, className = '' }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    className={`animate-spin ${className}`}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ children, color = 'bg-surface-600', text = 'text-subtle', border = 'border-border', className = '' }) => (
  <span className={`badge border ${color} ${text} ${border} ${className}`}>
    {children}
  </span>
)

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const Avatar = ({ name, src, size = 'md' }) => {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' }
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-display font-700 bg-acid/20 text-acid border border-acid/30 shrink-0 overflow-hidden`}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : getInitials(name)}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} card animate-fade-up shadow-2xl shadow-surface-950`}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-display font-700 text-bright text-base">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-bright transition-colors p-1 rounded-lg hover:bg-surface-700">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-14 h-14 rounded-2xl bg-surface-700 border border-border flex items-center justify-center mb-4">
      <Icon size={24} className="text-muted" />
    </div>
    <h3 className="font-display font-600 text-bright mb-1.5">{title}</h3>
    <p className="text-sm text-muted max-w-xs">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
)

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const Skeleton = ({ className = '' }) => (
  <div className={`shimmer-bg rounded-lg ${className}`} />
)
