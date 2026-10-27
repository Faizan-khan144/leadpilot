import { AlertCircle, Inbox, RefreshCcw } from 'lucide-react'

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
    <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-subtle">
      <Icon className="h-5 w-5" />
    </span>
    <h3 className="mt-4 text-[13px] font-semibold">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

export const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--danger-soft)] text-[var(--danger)]">
      <AlertCircle className="h-5 w-5" />
    </span>
    <h3 className="mt-4 text-[13px] font-semibold">Could not load this view</h3>
    <p className="mt-1 max-w-md text-xs text-muted">
      {error?.message || 'The request failed. Check your connection and try again.'}
    </p>
    {onRetry && (
      <button type="button" className="btn btn-secondary mt-4" onClick={onRetry}>
        <RefreshCcw className="h-3.5 w-3.5" /> Retry
      </button>
    )}
  </div>
)

export const LoadingScreen = () => (
  <div className="grid min-h-screen place-items-center bg-app">
    <div className="flex flex-col items-center gap-3">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-orange-500" />
      <p className="text-xs text-muted">Loading workspace…</p>
    </div>
  </div>
)

export const PageSkeleton = () => (
  <div className="space-y-5">
    <div className="space-y-2">
      <div className="skeleton h-7 w-48" />
      <div className="skeleton h-4 w-80 max-w-full" />
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="panel h-28 p-4">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton mt-5 h-7 w-28" />
          <div className="skeleton mt-3 h-3 w-16" />
        </div>
      ))}
    </div>
    <div className="panel p-5">
      <div className="skeleton h-4 w-36" />
      <div className="mt-5 space-y-3">
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className="skeleton h-10 w-full" />
        ))}
      </div>
    </div>
  </div>
)
