import { useMemo, useState } from 'react'
import { CalendarClock, GripVertical, Plus, Search, Target, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Avatar } from '../components/Avatar'
import { LeadFormModal } from '../components/LeadFormModal'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { ErrorState, PageSkeleton } from '../components/States'
import { PriorityBadge } from '../components/StatusBadges'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { useMembers } from '../hooks/useMembers'
import { api } from '../lib/api'
import { LEAD_STATUSES, PRIORITIES } from '../lib/constants'
import { formatDate, formatMoney } from '../lib/utils'

const stageAccent = {
  'New Lead': '#94a3b8',
  Contacted: '#60a5fa',
  Interested: '#fb923c',
  'Meeting Scheduled': '#fbbf24',
  'Proposal Sent': '#38bdf8',
  Negotiation: '#fb923c',
  Won: '#34d399',
  Lost: '#f87171',
}

export const PipelinePage = () => {
  const navigate = useNavigate()
  const { isPrivileged } = useAuth()
  const { members } = useMembers()
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [dragged, setDragged] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [lostDrop, setLostDrop] = useState(null)
  const [lostReason, setLostReason] = useState('')
  const [moving, setMoving] = useState(false)
  const query = useMemo(() => ({ search, priority, assignedTo }), [search, priority, assignedTo])
  const { data, loading, error, refetch } = useApi('/leads/board', query)
  const columns = data?.columns || LEAD_STATUSES.map((status) => ({ status, count: 0, valuePaise: 0, items: [] }))
  const totalValue = columns.reduce((sum, column) => sum + column.valuePaise, 0)

  const moveLead = async (leadId, status, reason = '') => {
    setMoving(true)
    try {
      await api.patch(`/leads/${leadId}/stage`, { status, lostReason: reason })
      toast.success(`Moved to ${status}`)
      await refetch({ quiet: true })
    } catch (requestError) {
      toast.error(requestError.message)
      await refetch({ quiet: true })
    } finally {
      setMoving(false)
      setDragged(null)
      setDragOver(null)
    }
  }

  const handleDrop = (status) => {
    if (!dragged || dragged.status === status) {
      setDragged(null)
      setDragOver(null)
      return
    }
    if (status === 'Lost') {
      setLostDrop({ id: dragged._id, name: dragged.businessName })
      setLostReason('')
      setDragged(null)
      setDragOver(null)
      return
    }
    moveLead(dragged._id, status)
  }

  const confirmLost = async () => {
    if (!lostReason.trim()) return
    await moveLead(lostDrop.id, 'Lost', lostReason.trim())
    setLostDrop(null)
    setLostReason('')
  }

  if (loading && !data) return <PageSkeleton />
  if (error && !data) return <ErrorState error={error} onRetry={refetch} />

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Conversion board"
        title="Pipeline"
        description="Drag a lead between stages to update it. Every move is written to the activity and audit trail."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New lead
          </button>
        }
      />

      <div className="panel p-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="input pl-9" placeholder="Search the board…" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <select value={priority} onChange={(event) => setPriority(event.target.value)} className="input min-w-[130px] capitalize">
              <option value="">All priorities</option>
              {PRIORITIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            {isPrivileged && (
              <select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} className="input min-w-[140px]">
                <option value="">All owners</option>
                {members.map((membership) => (
                  <option key={membership.user?._id} value={membership.user?._id}>{membership.user?.name}</option>
                ))}
              </select>
            )}
            <div className="flex h-10 items-center gap-2 rounded-lg border border-app px-3 text-[10px] text-muted">
              <Target className="h-3 w-3 text-orange-500" />
              <span>{formatMoney(totalValue, { compact: true })}</span>
            </div>
          </div>
        </div>
      </div>

      {data?.truncated && (
        <p className="text-[10px] text-[var(--warning)]">Showing the 500 most recent leads. Use filters to narrow the board.</p>
      )}

      <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-max gap-3">
          {columns.map((column) => (
            <div
              key={column.status}
              className={`w-[262px] shrink-0 rounded-2xl border p-2 transition ${
                dragOver === column.status
                  ? 'border-orange-500 bg-[var(--accent-soft)]'
                  : 'border-app bg-[var(--surface-2)]'
              }`}
              onDragOver={(event) => {
                event.preventDefault()
                setDragOver(column.status)
              }}
              onDragLeave={() => setDragOver((current) => (current === column.status ? null : current))}
              onDrop={() => handleDrop(column.status)}
            >
              <div className="flex items-center justify-between px-1.5 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: stageAccent[column.status] }} />
                  <p className="text-[11px] font-semibold">{column.status}</p>
                  <span className="rounded-full bg-[var(--surface)] px-1.5 py-0.5 text-[9px] font-bold text-muted">{column.count}</span>
                </div>
                <span className="text-[9px] text-subtle">{formatMoney(column.valuePaise, { compact: true })}</span>
              </div>

              <div className="mt-1 max-h-[calc(100vh-280px)] min-h-[120px] space-y-2 overflow-y-auto pr-0.5 scrollbar-none">
                {column.items.length ? (
                  column.items.map((lead) => (
                    <article
                      key={lead._id}
                      draggable
                      onDragStart={() => setDragged(lead)}
                      onDragEnd={() => {
                        setDragged(null)
                        setDragOver(null)
                      }}
                      onClick={() => navigate(`/leads/${lead._id}`)}
                      className={`group cursor-pointer rounded-xl border border-app bg-[var(--surface)] p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-soft ${
                        moving && dragged?._id === lead._id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-grab text-subtle opacity-0 transition group-hover:opacity-100" />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-[11.5px] font-semibold leading-snug">{lead.businessName}</p>
                          <p className="mt-1 truncate text-[9.5px] text-subtle">{lead.contactPerson || lead.email || lead.phone || 'No contact'}</p>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold tracking-[-0.02em]">{formatMoney(lead.estimatedValuePaise, { compact: true })}</span>
                        <PriorityBadge priority={lead.priority} />
                      </div>
                      <div className="mt-2.5 flex items-center justify-between border-t border-app pt-2">
                        {lead.assignedTo ? (
                          <div className="flex items-center gap-1.5">
                            <Avatar user={lead.assignedTo} size="xs" className="h-5 w-5 text-[7px]" />
                            <span className="max-w-[100px] truncate text-[9px] text-muted">{lead.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] text-subtle"><UserRound className="h-3 w-3" /> Unassigned</span>
                        )}
                        {lead.nextFollowUpAt && (
                          <span className="inline-flex items-center gap-1 text-[9px] text-muted">
                            <CalendarClock className="h-3 w-3" /> {formatDate(lead.nextFollowUpAt, { year: undefined })}
                          </span>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="grid min-h-[110px] place-items-center rounded-xl border border-dashed border-[var(--border)] px-4 text-center">
                    <p className="text-[9.5px] text-subtle">Drop a lead here</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <LeadFormModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={() => refetch()} />
      <Modal
        open={Boolean(lostDrop)}
        onClose={() => setLostDrop(null)}
        title="Mark lead as lost"
        description={lostDrop ? `${lostDrop.name} will leave the active pipeline.` : ''}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setLostDrop(null)} disabled={moving}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={confirmLost} disabled={!lostReason.trim() || moving}>
              {moving ? 'Saving…' : 'Mark lost'}
            </button>
          </>
        }
      >
        <label className="label" htmlFor="lostReason">Why was this lead lost? *</label>
        <textarea
          id="lostReason"
          className="input"
          rows={3}
          value={lostReason}
          onChange={(event) => setLostReason(event.target.value)}
          placeholder="Budget, timing, competitor, no response…"
          autoFocus
        />
        <p className="mt-1.5 text-[10px] text-subtle">This reason is stored for reporting and coaching.</p>
      </Modal>
    </div>
  )
}
