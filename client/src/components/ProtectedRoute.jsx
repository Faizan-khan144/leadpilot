import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { LoadingScreen } from '../components/States'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = () => {
  const { user, loading, activeOrganization, logout } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  if (!activeOrganization) {
    return (
      <div className="grid min-h-screen place-items-center bg-app px-5">
        <div className="panel w-full max-w-md p-8 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 text-lg font-bold tracking-[-0.03em]">No active workspace</h1>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Your account is signed in, but it is not attached to an active organization yet.
            Accept a team invitation or ask an owner to activate your membership.
          </p>
          <button type="button" className="btn btn-secondary mt-5" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return <Outlet />
}
