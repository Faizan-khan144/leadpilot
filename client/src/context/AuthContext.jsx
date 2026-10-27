import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { api, getStoredOrganizationId, setApiOrganization } from '../lib/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [organizations, setOrganizations] = useState([])
  const [activeOrganization, setActiveOrganization] = useState(null)
  const [loading, setLoading] = useState(true)

  const applySession = useCallback((session) => {
    setUser(session.user)
    setOrganizations(session.organizations || [])
    const storedId = getStoredOrganizationId()
    const current =
      session.organizations?.find((organization) => organization.id === storedId) ||
      session.activeOrganization ||
      session.organizations?.[0] ||
      null
    setActiveOrganization(current)
    setApiOrganization(current?.id || null)
  }, [])

  const refresh = useCallback(async () => {
    try {
      const session = await api.get('/auth/me')
      applySession(session)
      return session
    } catch (error) {
      if (error.status !== 401) throw error
      setUser(null)
      setOrganizations([])
      setActiveOrganization(null)
      setApiOrganization(null)
      return null
    }
  }, [applySession])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
      setOrganizations([])
      setActiveOrganization(null)
      setApiOrganization(null)
    }
    window.addEventListener('leadpilot:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('leadpilot:unauthorized', handleUnauthorized)
  }, [])

  const login = async (values) => {
    const session = await api.post('/auth/login', values)
    applySession(session)
    return session
  }

  const register = async (values) => {
    const session = await api.post('/auth/register', values)
    applySession(session)
    return session
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      setUser(null)
      setOrganizations([])
      setActiveOrganization(null)
      setApiOrganization(null)
    }
  }

  const switchOrganization = (id) => {
    const next = organizations.find((organization) => organization.id === id)
    if (!next) return
    setActiveOrganization(next)
    setApiOrganization(next.id)
    toast.success(`Switched to ${next.name}`)
  }

  const value = useMemo(
    () => ({
      user,
      organizations,
      activeOrganization,
      role: activeOrganization?.role || null,
      loading,
      isOwner: activeOrganization?.role === 'owner',
      isPrivileged: ['owner', 'manager'].includes(activeOrganization?.role),
      login,
      register,
      logout,
      refresh,
      switchOrganization,
      setSession: applySession,
    }),
    [user, organizations, activeOrganization, loading, applySession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
