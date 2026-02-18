import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Zap, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Input, Button } from '../components/ui'
import { extractError } from '../utils'
import toast from 'react-hot-toast'

const validate = (fields) => {
  const errors = {}
  if (!fields.email) errors.email = 'Email is required'
  else if (!/^\S+@\S+\.\S+$/.test(fields.email)) errors.email = 'Enter a valid email'
  if (!fields.password) errors.password = 'Password is required'
  return errors
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const change = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors((er) => ({ ...er, [e.target.name]: '' }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4 noise">
      {/* Background glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-acid/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-acid flex items-center justify-center">
            <Zap size={18} className="text-surface-950" fill="currentColor" />
          </div>
          <span className="font-display font-700 text-bright text-xl tracking-tight">TaskFlow</span>
        </div>

        <div className="mb-8">
          <h1 className="font-display font-700 text-2xl text-bright mb-1.5">Sign in</h1>
          <p className="text-muted text-sm">Welcome back. Enter your credentials to continue.</p>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <Input
            label="Email"
            name="email"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            value={form.email}
            onChange={change}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={form.password}
            onChange={change}
            error={errors.password}
            autoComplete="current-password"
          />

          <Button type="submit" loading={loading} className="w-full mt-2">
            Sign in <ArrowRight size={15} />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-acid hover:text-acid-dim transition-colors font-500">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
