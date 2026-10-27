import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpDown,
  Download,
  FilterX,
  Loader2,
  Plus,
  Search,
  Target,
  Upload,
  UserRoundCheck,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Avatar } from '../components/Avatar'
import { ImportLeadsModal } from '../components/ImportLeadsModal'
import { LeadFormModal } from '../components/LeadFormModal'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { EmptyState, ErrorState, PageSkeleton } from '../components/States'
import { LeadStatusBadge, PriorityBadge } from '../components/StatusBadges'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { useDebounce } from '../hooks/useDebounce'
import { useMembers } from '../hooks/useMembers'
import { api } from '../lib/api'
import { LEAD_SOURCES, LEAD_STATUSES, PRIORITIES } from '../lib/constants'
import { downloadBlob, formatDate, formatMoney, titleCase } from '../lib/utils'

const initialFilters = { status: '', priority: '', source: '', assignedTo: '', sort: '-createdAt' }

export const LeadsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isPrivileged, isOwner } = useAuth()
  const { members } = useMembers()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [filters, setFilters] = useState(initialFilters)
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [createOpen, setCreateOpen] = useState(searchParams.get('new') === '1')
  const [importOpen, setImportOpen] = useState(false)
  const [selected, setSelected] = useState([])
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignTo, setAssignTo] = useState('')
  const [assigning, setAssigning] = useState(false)

  const query = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch,
      status: filters.status,
      priority: filters.priority,
      source: filters.source,
      assignedTo: filters.assignedTo,
      sort: filters.sort,
    }),
    [page, debouncedSearch, filters],
  )
  const { data, loading, error, refetch } = useApi('/leads', query, [reload])
  const items = data?.items || []
  const hasFilters = debouncedSearch || filters.status || filters.priority || filters.source || filters.assignedTo

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filters])

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setCreateOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const refresh = () => setReload((current) => current + 1)

  const clearFilters = () => {
    setSearch('')
    setFilters(initialFilters)
  }

  const toggleAll = () => {
    setSelected((current) => (current.length === items.length ? [] : items.map((lead) => lead._id)))
  }

  const toggleOne = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    )
  }

  const exportCsv = async () => {
    try {
      const blob = await api.download('/leads/export', query)
      downloadBlob(blob, `leadpilot-leads-${new Date().toISOString().slice(0, 10)}.csv`)
      toast.success('Lead export downloaded')
    } catch (requestError) {
      toast.error(requestError.message)
    }
  }

  const bulkAssign = async () => {
    if (!assignTo) return
    setAssigning(true)
    try {
      const result = await api.post('/leads/bulk-assign', { leadIds: selected, assignedTo: assignTo })
      toast.success(result.message)
      setSelected([])
      setAssignOpen(false)
      setAssignTo('')
      refresh()
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Lead workspace"
        title="Leads"
        description="Every prospect, owner and next step in one searchable workspace."
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={exportCsv}>
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setImportOpen(true)}>
              <Upload className="h-3.5 w-3.5" /> Import
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> New lead
            </button>
          </>
        }
      />

      <div className="panel p-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input pl-9"
              placeholder="Search business, contact, email or phone…"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              className="input min-w-[130px]"
              aria-label="Filter by stage"
            >
              <option value="">All stages</option>
              {LEAD_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <select
              value={filters.priority}
              onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
              className="input min-w-[115px] capitalize"
              aria-label="Filter by priority"
            >
              <option value="">All priorities</option>
              {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
            <select
              value={filters.source}
              onChange={(event) => setFilters((current) => ({ ...current, source: event.target.value }))}
              className="input min-w-[125px]"
              aria-label="Filter by source"
            >
              <option value="">All sources</option>
              {LEAD_SOURCES.map((source) => <option key={source} value={source}>{source}</option>)}
            </select>
            {isPrivileged && (
              <select
                value={filters.assignedTo}
                onChange={(event) => setFilters((current) => ({ ...current, assignedTo: event.target.value }))}
                className="input min-w-[135px]"
                aria-label="Filter by owner"
              >
                <option value="">All owners</option>
                {members.map((membership) => (
                  <option key={membership.user?._id} value={membership.user?._id}>{membership.user?.name}</option>
                ))}
              </select>
            )}
            <select
              value={filters.sort}
              onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}
              className="input min-w-[135px]"
              aria-label="Sort leads"
            >
              <option value="-createdAt">Newest first</option>
              <option value="createdAt">Oldest first</option>
              <option value="businessName">Business A–Z</option>
              <option value="-estimatedValuePaise">Highest value</option>
              <option value="nextFollowUpAt">Next follow-up</option>
            </select>
            {hasFilters && (
              <button type="button" className="btn btn-ghost h-10 px-2.5" onClick={clearFilters} title="Clear filters">
                <FilterX className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-500/20 bg-[var(--accent-soft)] px-3.5 py-2.5">
          <p className="text-[11.5px] font-medium">
            {selected.length} lead{selected.length === 1 ? '' : 's'} selected
          </p>
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-ghost h-8 px-2" onClick={() => setSelected([])}>
              Clear
            </button>
            {isPrivileged && (
              <button type="button" className="btn btn-secondary h-8" onClick={() => setAssignOpen(true)}>
                <UserRoundCheck className="h-3.5 w-3.5" /> Assign
              </button>
            )}
          </div>
        </div>
      )}

      {loading && !data ? (
        <PageSkeleton />
      ) : error && !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {isPrivileged && (
                  <th className="w-10">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selected.length === items.length}
                      onChange={toggleAll}
                      className="accent-orange-500"
                      aria-label="Select all leads"
                    />
                  </th>
                )}
                <th>Business</th>
                <th>Stage</th>
                <th>Priority</th>
                <th>Value</th>
                <th>Owner</th>
                <th>Next follow-up</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((lead) => (
                  <tr
                    key={lead._id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/leads/${lead._id}`)}
                  >
                    {isPrivileged && (
                      <td onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.includes(lead._id)}
                          onChange={() => toggleOne(lead._id)}
                          className="accent-orange-500"
                          aria-label={`Select ${lead.businessName}`}
                        />
                      </td>
                    )}
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-soft)] text-[11px] font-bold text-orange-500">
                          {lead.businessName.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="max-w-[230px] truncate font-semibold">{lead.businessName}</p>
                          <p className="max-w-[230px] truncate text-[10px] text-subtle">
                            {lead.contactPerson || lead.email || lead.phone || lead.industry || 'No contact details'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td><LeadStatusBadge status={lead.status} /></td>
                    <td><PriorityBadge priority={lead.priority} /></td>
                    <td className="font-semibold">{formatMoney(lead.estimatedValuePaise)}</td>
                    <td>
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar user={lead.assignedTo} size="xs" />
                          <span className="text-[11px]">{lead.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-[10.5px] text-subtle">Unassigned</span>
                      )}
                    </td>
                    <td className={lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) < new Date() ? 'text-[var(--danger)]' : ''}>
                      {lead.nextFollowUpAt ? formatDate(lead.nextFollowUpAt) : '—'}
                    </td>
                    <td className="text-muted">{formatDate(lead.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isPrivileged ? 8 : 7}>
                    <EmptyState
                      icon={Target}
                      title={hasFilters ? 'No leads match these filters' : 'Start with your first lead'}
                      description={
                        hasFilters
                          ? 'Try a different search or clear the active filters.'
                          : 'Add a business manually or import an existing list from CSV.'
                      }
                      action={
                        hasFilters ? (
                          <button type="button" className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>
                        ) : (
                          <div className="flex gap-2">
                            <button type="button" className="btn btn-secondary" onClick={() => setImportOpen(true)}>
                              <Upload className="h-3.5 w-3.5" /> Import CSV
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
                              <Plus className="h-3.5 w-3.5" /> Add lead
                            </button>
                          </div>
                        )
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} limit={20} total={data?.pagination?.total || 0} onPageChange={setPage} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-[10px] text-subtle">
        <span className="inline-flex items-center gap-1"><ArrowUpDown className="h-3 w-3" /> {data?.total ?? 0} leads</span>
        <span>·</span>
        <span>{isPrivileged ? 'Managers see the whole workspace' : 'You see leads assigned to you'}</span>
        {!items.length && isOwner && !hasFilters && (
          <span className="inline-flex items-center gap-1 text-orange-500">
            <Upload className="h-3 w-3" /> CSV import supports up to 1,000 rows
          </span>
        )}
      </div>

      <LeadFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={refresh}
      />
      <ImportLeadsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={refresh}
      />
      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign selected leads"
        description={`${selected.length} leads will move to a new owner.`}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setAssignOpen(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={bulkAssign} disabled={!assignTo || assigning}>
              {assigning && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {assigning ? 'Assigning…' : 'Assign leads'}
            </button>
          </>
        }
      >
        <label className="label">New owner</label>
        <select className="input" value={assignTo} onChange={(event) => setAssignTo(event.target.value)}>
          <option value="">Choose a team member</option>
          {members.map((membership) => (
            <option key={membership.user?._id} value={membership.user?._id}>
              {membership.user?.name} · {titleCase(membership.role)}
            </option>
          ))}
        </select>
      </Modal>
    </div>
  )
}
