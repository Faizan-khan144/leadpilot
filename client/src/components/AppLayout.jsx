import { useEffect, useRef, useState } from 'react'
import {
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  ChevronDown,
  Command,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PhoneCall,
  Plus,
  Settings,
  Sun,
  Target,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Avatar } from './Avatar'
import { Logo } from './Logo'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { cn, timeAgo, titleCase } from '../lib/utils'

const primaryNav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Target },
  { to: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { to: '/calls', label: 'Calls', icon: PhoneCall },
  { to: '/follow-ups', label: 'Follow-ups', icon: CalendarClock, badgeKey: 'followUps' },
  { to: '/deals', label: 'Deals', icon: WalletCards },
  { to: '/commissions', label: 'Commissions', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

const secondaryNav = [
  { to: '/team', label: 'Team', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const pageTitles = {
  '/': 'Overview',
  '/leads': 'Leads',
  '/pipeline': 'Pipeline',
  '/calls': 'Calls',
  '/follow-ups': 'Follow-ups',
  '/deals': 'Deals',
  '/commissions': 'Commissions',
  '/reports': 'Reports',
  '/team': 'Team',
  '/settings': 'Settings',
}

const useOutsideClick = (callback) => {
  const ref = useRef(null)
  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) callback()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [callback])
  return ref
}

const NavItem = ({ item, onNavigate, count }) => (
  <NavLink
    to={item.to}
    end={item.end}
    onClick={onNavigate}
    className={({ isActive }) => cn('nav-link group', isActive && 'active')}
  >
    <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
    <span className="flex-1">{item.label}</span>
    {count > 0 && (
      <span className="min-w-5 rounded-full bg-[var(--surface-3)] px-1.5 py-0.5 text-center text-[9px] font-bold text-[var(--text)]">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </NavLink>
)

const Sidebar = ({ open, onClose }) => {
  const { activeOrganization, organizations, user, logout, switchOrganization, role } = useAuth()
  const navigate = useNavigate()
  const [orgMenu, setOrgMenu] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const orgRef = useOutsideClick(() => setOrgMenu(false))
  const userRef = useOutsideClick(() => setUserMenu(false))
  const { data: followUps } = useApi('/follow-ups/summary')
  const counts = { followUps: (followUps?.overdue || 0) + (followUps?.today || 0) }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[236px] flex-col border-r border-app bg-[var(--surface)] px-3 py-4 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-2">
          <Link to="/dashboard" onClick={onClose}>
            <Logo />
          </Link>
          <button type="button" className="icon-button lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-5" ref={orgRef}>
          <button
            type="button"
            onClick={() => setOrgMenu((current) => !current)}
            className="flex w-full items-center gap-2.5 rounded-xl border border-app bg-surface-2 p-2 text-left transition hover:border-[var(--border-strong)]"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-orange-500">
              <Building2 className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] font-semibold">{activeOrganization.name}</span>
              <span className="block truncate text-[9.5px] capitalize text-subtle">
                {titleCase(role)}
              </span>
            </span>
            <ChevronDown className={cn('h-3 w-3 text-subtle transition', orgMenu && 'rotate-180')} />
          </button>
          {orgMenu && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-app bg-[var(--surface)] p-1 shadow-soft">
              <p className="px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-subtle">
                Your workspaces
              </p>
              {organizations.map((organization) => (
                <button
                  key={organization.id}
                  type="button"
                  onClick={() => {
                    switchOrganization(organization.id)
                    setOrgMenu(false)
                    navigate('/')
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11.5px] transition hover:bg-surface-2',
                    organization.id === activeOrganization.id && 'bg-surface-2 font-semibold',
                  )}
                >
                  <span className="grid h-5 w-5 place-items-center rounded bg-[var(--accent-soft)] text-[9px] font-bold text-orange-500">
                    {organization.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{organization.name}</span>
                  {organization.id === activeOrganization.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="mt-5 flex-1 space-y-0.5 overflow-y-auto scrollbar-none">
          <p className="px-2.5 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.09em] text-subtle">
            Workspace
          </p>
          {primaryNav.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              onNavigate={onClose}
              count={counts[item.badgeKey]}
            />
          ))}
          <p className="px-2.5 pb-1.5 pt-5 text-[9px] font-semibold uppercase tracking-[0.09em] text-subtle">
            Manage
          </p>
          {secondaryNav.map((item) => (
            <NavItem key={item.to} item={item} onNavigate={onClose} />
          ))}
        </nav>

        <div className="mt-3 rounded-xl border border-dashed border-[var(--border-strong)] p-3">
          <p className="text-[10.5px] font-semibold">Bring the team in</p>
          <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
            Invite managers and lead generators to work the same pipeline.
          </p>
          <Link to="/team" onClick={onClose} className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-semibold text-orange-500">
            Manage team <Plus className="h-3 w-3" />
          </Link>
        </div>

        <div className="relative mt-3" ref={userRef}>
          <button
            type="button"
            onClick={() => setUserMenu((current) => !current)}
            className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition hover:bg-surface-2"
          >
            <Avatar user={user} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] font-semibold">{user.name}</span>
              <span className="block truncate text-[9.5px] text-subtle">{user.email}</span>
            </span>
            <ChevronDown className={cn('h-3 w-3 text-subtle transition', userMenu && 'rotate-180')} />
          </button>
          {userMenu && (
            <div className="absolute bottom-[calc(100%+6px)] left-0 right-0 rounded-xl border border-app bg-[var(--surface)] p-1 shadow-soft">
              <Link
                to="/settings"
                onClick={() => {
                  setUserMenu(false)
                  onClose()
                }}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11.5px] hover:bg-surface-2"
              >
                <Settings className="h-3.5 w-3.5" /> Account & workspace
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11.5px] text-[var(--danger)] hover:bg-[var(--danger-soft)]"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

const NotificationMenu = () => {
  const [open, setOpen] = useState(false)
  const ref = useOutsideClick(() => setOpen(false))
  const { data, loading, refetch } = useApi('/notifications', { limit: 7 })
  const { data: countData, refetch: refetchCount } = useApi('/notifications/unread-count')

  const markAll = async () => {
    await api.patch('/notifications/read-all')
    refetch({ quiet: true })
    refetchCount({ quiet: true })
    toast.success('Notifications cleared')
  }

  const markOne = async (notification) => {
    if (!notification.readAt) {
      await api.patch(`/notifications/${notification._id}/read`)
      refetch({ quiet: true })
      refetchCount({ quiet: true })
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="icon-button relative"
        onClick={() => setOpen((current) => !current)}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {(countData?.unread || 0) > 0 && (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 ring-2 ring-[var(--surface)]" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[320px] overflow-hidden rounded-xl border border-app bg-[var(--surface)] shadow-soft">
          <div className="flex items-center justify-between border-b border-app px-3.5 py-2.5">
            <p className="text-[11.5px] font-semibold">Notifications</p>
            {(countData?.unread || 0) > 0 && (
              <button type="button" onClick={markAll} className="text-[10px] font-medium text-orange-500">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="skeleton h-12 w-full" />
                ))}
              </div>
            ) : data?.items?.length ? (
              data.items.map((notification) => (
                <Link
                  key={notification._id}
                  to={notification.link || '/dashboard'}
                  onClick={() => {
                    markOne(notification)
                    setOpen(false)
                  }}
                  className={cn(
                    'block border-b border-app px-3.5 py-3 transition last:border-0 hover:bg-surface-2',
                    !notification.readAt && 'bg-[var(--accent-soft)]/25',
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                        notification.readAt ? 'bg-transparent' : 'bg-orange-500',
                      )}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold">{notification.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-muted">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[9px] text-subtle">{timeAgo(notification.createdAt)}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto h-5 w-5 text-subtle" />
                <p className="mt-2 text-[11px] font-medium">You are all caught up</p>
                <p className="mt-0.5 text-[10px] text-muted">New assignments and reminders appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const title =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith('/leads/')
      ? 'Lead details'
      : location.pathname.startsWith('/deals/')
        ? 'Deal details'
        : 'Workspace')

  return (
    <div className="flex min-h-screen bg-app">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[58px] items-center gap-3 border-b border-app bg-[color-mix(in_srgb,var(--canvas)_88%,transparent)] px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            className="icon-button lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="hidden items-center gap-2 text-[11px] text-muted sm:flex">
            <Command className="h-3 w-3" />
            <span>LeadPilot</span>
            <span className="text-subtle">/</span>
            <span className="font-medium text-[var(--text)]">{title}</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-1.5">
            <button
              type="button"
              className="btn btn-primary mr-1 hidden h-8 px-3 sm:inline-flex"
              onClick={() => navigate('/leads?new=1')}
            >
              <Plus className="h-3.5 w-3.5" /> New lead
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <NotificationMenu />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
          <div key={location.pathname} className="mx-auto max-w-[1400px] animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
