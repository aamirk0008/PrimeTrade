import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Zap, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Input, Button } from '../components/ui'
import { extractError } from '../utils'
import toast from 'react-hot-toast'

const validate = (fields) => {
  const errors = {}
  if (!fields.name || fields.name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters'
  if (!fields.email) errors.email = 'Email is required'
  else if (!/^\S+@\S+\.\S+$/.test(fields.email)) errors.email = 'Enter a valid email'
  if (!fields.password) errors.password = 'Password is required'
  else if (fields.password.length < 8) errors.password = 'Minimum 8 characters'
  else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(fields.password))
    errors.password = 'Must include uppercase, lowercase, and a number'
  if (!fields.passwordConfirm) errors.passwordConfirm = 'Please confirm your password'
  else if (fields.password !== fields.passwordConfirm) errors.passwordConfirm = 'Passwords do not match'
  return errors
}

const StrengthBar = ({ password }) => {
  const score = [/.{8,}/, /[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length
  const levels = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-acid', 'bg-acid']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong']
  if (!password) return null
  return (
    <div className="space-y-1.5 mt-1">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? levels[score] : 'bg-border'}`} />
        ))}
      </div>
      <p className={`text-xs font-mono ${score >= 4 ? 'text-acid' : score >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
        {labels[score]}
      </p>
    </div>
  )
}

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', passwordConfirm: '' })
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
      await signup(form)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4 noise">
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-acid/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-acid flex items-center justify-center">
            <Zap size={18} className="text-surface-950" fill="currentColor" />
          </div>
          <span className="font-display font-700 text-bright text-xl tracking-tight">TaskFlow</span>
        </div>

        <div className="mb-8">
          <h1 className="font-display font-700 text-2xl text-bright mb-1.5">Create account</h1>
          <p className="text-muted text-sm">Get started — free forever, no credit card needed.</p>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <Input
            label="Full name"
            name="name"
            icon={User}
            placeholder="Jane Doe"
            value={form.name}
            onChange={change}
            error={errors.name}
            autoComplete="name"
          />
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
          <div className="space-y-1.5">
            <Input
              label="Password"
              name="password"
              type="password"
              icon={Lock}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={change}
              error={errors.password}
              autoComplete="new-password"
            />
            <StrengthBar password={form.password} />
          </div>
          <Input
            label="Confirm password"
            name="passwordConfirm"
            type="password"
            icon={Lock}
            placeholder="Repeat password"
            value={form.passwordConfirm}
            onChange={change}
            error={errors.passwordConfirm}
            autoComplete="new-password"
          />

          <Button type="submit" loading={loading} className="w-full mt-2">
            Create account <ArrowRight size={15} />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-acid hover:text-acid-dim transition-colors font-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
