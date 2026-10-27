import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatNumber } from '../lib/utils'

export const Pagination = ({ page = 1, limit = 20, total = 0, onPageChange }) => {
  const pages = Math.max(1, Math.ceil(total / limit))
  if (total === 0) return null
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex flex-col gap-3 border-t border-app px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[11px] text-muted">
        Showing <span className="font-medium text-[var(--text)]">{formatNumber(from)}</span>–
        <span className="font-medium text-[var(--text)]">{formatNumber(to)}</span> of{' '}
        <span className="font-medium text-[var(--text)]">{formatNumber(total)}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="btn btn-secondary h-8 px-2.5"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-16 text-center text-[11px] text-muted">
          {formatNumber(page)} / {formatNumber(pages)}
        </span>
        <button
          type="button"
          className="btn btn-secondary h-8 px-2.5"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
