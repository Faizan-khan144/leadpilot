import { useEffect } from 'react'
import { X } from 'lucide-react'

export const Modal = ({ open, onClose, title, description, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (!open) return undefined
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  }

  return (
    <div
      className="dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div className={`dialog ${widths[size]}`}>
        <div className="flex items-start justify-between gap-6 border-b border-app px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
          </div>
          <button type="button" className="icon-button -mr-1 h-8 w-8" onClick={onClose} aria-label="Close dialog">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-app px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  loading = false,
  danger = true,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    description={description}
    size="sm"
    footer={
      <>
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button
          type="button"
          className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Working…' : confirmLabel}
        </button>
      </>
    }
  >
    <p className="text-[13px] leading-relaxed text-muted">
      This action will be recorded in the organization audit trail.
    </p>
  </Modal>
)
