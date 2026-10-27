import { useMemo, useState } from 'react'
import { Banknote, BriefcaseBusiness, IndianRupee, Plus, Search, Trophy } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { DealFormModal } from '../components/DealFormModal'
import { PageHeader, Stat } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { EmptyState, ErrorState, PageSkeleton } from '../components/States'
import { DealStatusBadge } from '../components/StatusBadges'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { useDebounce } from '../hooks/useDebounce'
import { useMembers } from '../hooks/useMembers'
import { DEAL_STATUSES } from '../lib/constants'
import { formatDate, formatMoney, titleCase } from '../lib/utils'

export const DealsPage = () => {
  const navigate = useNavigate()
  const { isPrivileged } = useAuth()
  const { members } = useMembers()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [reload, setReload] = useState(0)
  const debouncedSearch = useDebounce(search, 350)
  const query = useMemo(() => ({ page, limit: 20, search: debouncedSearch, status, assignedTo }), [page, debouncedSearch, status, assignedTo])
  const { data, loading, error, refetch } = useApi('/deals', query, [reload])
  const { data: summary } = useApi('/deals/summary', null, [reload])
  const items = data?.items || []

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Revenue"
        title="Deals"
        description="Track value, collections and commission from proposal to close."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New deal
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open pipeline" value={formatMoney(summary?.openValuePaise || 0, { compact: true })} hint={`${summary?.openCount ?? 0} open deals`} icon={BriefcaseBusiness} tone="accent" />
        <Stat label="Won value" value={formatMoney(summary?.wonValuePaise || 0, { compact: true })} hint={`${summary?.wonCount ?? 0} closed won`} icon={Trophy} tone="success" />
        <Stat label="Collected" value={formatMoney(summary?.collectedPaise || 0, { compact: true })} hint="All recorded payments" icon={Banknote} tone="success" />
        <Stat label="Outstanding" value={formatMoney(summary?.outstandingPaise || 0, { compact: true })} hint="Across every deal" icon={IndianRupee} tone="warning" />
      </div>

      <div className="panel flex flex-col gap-2 p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} className="input pl-9" placeholder="Search by business name…" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className="input min-w-[130px]">
            <option value="">All statuses</option>
            {DEAL_STATUSES.map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}
          </select>
          {isPrivileged && (
            <select value={assignedTo} onChange={(event) => { setAssignedTo(event.target.value); setPage(1) }} className="input min-w-[150px]">
              <option value="">All owners</option>
              {members.map((membership) => <option key={membership.user?._id} value={membership.user?._id}>{membership.user?.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {loading && !data ? (
        <PageSkeleton />
      ) : error && !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Value</th>
                <th>Received</th>
                <th>Outstanding</th>
                <th>Commission</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Expected close</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((deal) => (
                  <tr key={deal._id} className="cursor-pointer" onClick={() => navigate(`/deals/${deal._id}`)}>
                    <td>
                      <Link to={`/deals/${deal._id}`} className="font-semibold hover:text-orange-500" onClick={(event) => event.stopPropagation()}>
                        {deal.businessName}
                      </Link>
                      <p className="text-[10px] text-subtle">{deal.lead?.businessName || deal.contactPerson || 'No linked lead'}</p>
                    </td>
                    <td className="font-semibold">{formatMoney(deal.amountPaise)}</td>
                    <td className="text-[var(--success)]">{formatMoney(deal.receivedPaise)}</td>
                    <td className={deal.outstandingPaise ? 'text-[var(--warning)]' : 'text-muted'}>{formatMoney(deal.outstandingPaise)}</td>
                    <td>
                      <p className="font-medium">{formatMoney(deal.commission?.earnedCommissionPaise || 0)}</p>
                      <p className="text-[9.5px] text-subtle">{deal.commission?.ratePercent ?? '—'}% earned</p>
                    </td>
                    <td><DealStatusBadge status={deal.status} /></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar user={deal.assignedTo} size="xs" />
                        <span>{deal.assignedTo?.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{formatDate(deal.expectedClosingDate)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={BriefcaseBusiness}
                      title={search || status || assignedTo ? 'No deals match these filters' : 'No deals yet'}
                      description="Create a deal from a lead to start tracking value, payments and commission."
                      action={<button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>Create a deal</button>}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} limit={20} total={data?.pagination?.total || 0} onPageChange={setPage} />
        </div>
      )}

      <DealFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={(deal) => {
          setReload((current) => current + 1)
          refetch({ quiet: true })
          if (deal?._id) navigate(`/deals/${deal._id}`)
        }}
      />
    </div>
  )
}

