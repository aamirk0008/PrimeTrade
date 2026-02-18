import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../ui'

export default function ProtectedRoute() {
  const { user, loading, token } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size={32} className="text-acid mx-auto" />
          <p className="text-muted text-sm font-mono">Loading session...</p>
        </div>
      </div>
    )
  }

  if (!token || !user) return <Navigate to="/login" replace />

  return <Outlet />
}
