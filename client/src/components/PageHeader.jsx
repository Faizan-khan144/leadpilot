export const PageHeader = ({ eyebrow, title, description, actions }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      {eyebrow && (
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-orange-500">
          {eyebrow}
        </p>
      )}
      <h1 className="page-title">{title}</h1>
      {description && <p className="mt-1.5 max-w-2xl text-[12.5px] text-muted">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
)

export const Field = ({ label, htmlFor, error, hint, children, className = '' }) => (
  <div className={className}>
    {label && (
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
    )}
    {children}
    {error && <p className="field-error">{error}</p>}
    {!error && hint && <p className="mt-1.5 text-[10.5px] text-subtle">{hint}</p>}
  </div>
)

export const Stat = ({ label, value, hint, icon: Icon, tone = 'default', className = '' }) => {
  const tones = {
    default: 'bg-surface-2 text-muted',
    accent: 'bg-[var(--accent-soft)] text-orange-500',
    success: 'bg-[var(--success-soft)] text-[var(--success)]',
    warning: 'bg-[var(--warning-soft)] text-[var(--warning)]',
    danger: 'bg-[var(--danger-soft)] text-[var(--danger)]',
  }
  return (
    <div className={`panel stat-card flex min-h-[112px] flex-col justify-between p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-medium text-muted">{label}</p>
        {Icon && (
          <span className={`stat-icon grid h-7 w-7 place-items-center rounded-lg ${tones[tone]}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div>
        <p className="text-[22px] font-bold tracking-[-0.045em]">{value}</p>
        {hint && <p className="mt-0.5 text-[10.5px] text-subtle">{hint}</p>}
      </div>
    </div>
  )
}
