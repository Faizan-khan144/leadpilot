import { useMemo, useState } from 'react'
import {
  CalendarCheck,
  CalendarClock,
  Check,
  Clock3,
  Loader2,
  Plus,
  RotateCcw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Avatar } from '../components/Avatar'
import { FollowUpFormModal } from '../components/FollowUpFormModal'
import { Modal } from '../components/Modal'
import { PageHeader, Stat } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { EmptyState, ErrorState, PageSkeleton } from '../components/States'
import { PriorityBadge } from '../components/StatusBadges'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { useMembers } from '../hooks/useMembers'
import { api } from '../lib/api'
import { formatDateTime, timeAgo, toDateTimeLocal } from '../lib/utils'

const views = [
  { value: 'today', label: 'Today' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'all', label: 'All' },
]

export const FollowUpsPage = () => {
  const { isPrivileged } = useAuth()
  const { members } = useMembers()
  const [view, setView] = useState('today')
  const [assignedTo, setAssignedTo] = useState('')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [completeTarget, setCompleteTarget] = useState(null)
  const [completeNotes, setCompleteNotes] = useState('')
  const [rescheduleTarget, setRescheduleTarget] = useState(null)
  const [rescheduleAt, setRescheduleAt] = useState('')
  const [rescheduleReason, setRescheduleReason] = useState('')
  const [working, setWorking] = useState(false)
  const query = useMemo(() => ({ view, assignedTo, page, limit: 20 }), [view, assignedTo, page])
  const { data, loading, error, refetch } = useApi('/follow-ups', query, [reload])
  const { data: summary, refetch: refetchSummary } = useApi('/follow-ups/summary', null, [reload])
  const items = data?.items || []

  const refresh = () => {
    setReload((current) => current + 1)
    refetchSummary({ quiet: true })
  }

  const openComplete = (followUp) => {
    setCompleteTarget(followUp)
    setCompleteNotes('')
  }

  const complete = async () => {
    setWorking(true)
    try {
      await api.patch(`/follow-ups/${completeTarget._id}/complete`, {
        ...(completeNotes.trim() ? { meetingNotes: completeNotes.trim() } : {}),
      })
      toast.success('Follow-up completed')
      setCompleteTarget(null)
      refresh()
      refetch({ quiet: true })
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setWorking(false)
    }
  }

  const openReschedule = (followUp) => {
    setRescheduleTarget(followUp)
    setRescheduleAt(toDateTimeLocal(followUp.dueAt))
    setRescheduleReason('')
  }

  const reschedule = async () => {
    if (!rescheduleAt) return
    setWorking(true)
    try {
      await api.patch(`/follow-ups/${rescheduleTarget._id}/reschedule`, {
        dueAt: new Date(rescheduleAt).toISOString(),
        reason: rescheduleReason.trim(),
      })
      toast.success('Follow-up rescheduled')
      setRescheduleTarget(null)
      refresh()
      refetch({ quiet: true })
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Next actions"
        title="Follow-ups"
        description="Keep commitments visible. Overdue items are highlighted until they are completed or rescheduled."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Schedule
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Due today" value={summary?.today ?? '—'} hint="Across the selected scope" icon={Clock3} tone="warning" />
        <Stat label="Overdue" value={summary?.overdue ?? '—'} hint="Needs attention now" icon={CalendarClock} tone="danger" />
        <Stat label="Upcoming" value={summary?.upcoming ?? '—'} hint="Scheduled after today" icon={CalendarCheck} tone="success" />
      </div>

      <div className="panel flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-1 overflow-x-auto rounded-lg border border-app bg-[var(--surface)] p-0.5 scrollbar-none">
          {views.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setView(item.value)
                setPage(1)
              }}
              className={`shrink-0 rounded-md px-3 py-1.5 text-[10.5px] font-medium transition ${
                view === item.value ? 'bg-[var(--surface-3)] text-[var(--text)]' : 'text-muted hover:text-[var(--text)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {isPrivileged && (
          <select
            value={assignedTo}
            onChange={(event) => {
              setAssignedTo(event.target.value)
              setPage(1)
            }}
            className="input max-w-[180px]"
          >
            <option value="">All owners</option>
            {members.map((membership) => (
              <option key={membership.user?._id} value={membership.user?._id}>{membership.user?.name}</option>
            ))}
          </select>
        )}
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
                <th>Lead</th>
                <th>Type</th>
                <th>Due</th>
                <th>Owner</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((followUp) => {
                  const overdue = followUp.status === 'pending' && new Date(followUp.dueAt) < new Date()
                  return (
                    <tr key={followUp._id}>
                      <td>
                        <Link to={`/leads/${followUp.lead?._id}`} className="font-semibold hover:text-orange-500">
                          {followUp.lead?.businessName || 'Deleted lead'}
                        </Link>
                        <p className="max-w-[220px] truncate text-[10px] text-subtle">{followUp.notes || followUp.lead?.phone || 'No notes'}</p>
                      </td>
                      <td className="capitalize">{followUp.type.replace('_', ' ')}</td>
                      <td>
                        <p className={overdue ? 'font-medium text-[var(--danger)]' : ''}>{formatDateTime(followUp.dueAt)}</p>
                        <p className="text-[9.5px] text-subtle">{timeAgo(followUp.dueAt)}</p>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar user={followUp.assignedTo} size="xs" />
                          <span>{followUp.assignedTo?.name}</span>
                        </div>
                      </td>
                      <td><PriorityBadge priority={followUp.priority} /></td>
                      <td>
                        <span className={`badge ${followUp.status === 'completed' ? 'badge-success' : overdue ? 'badge-danger' : 'badge-warning'}`}>
                          {overdue ? 'overdue' : followUp.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          {followUp.status === 'pending' && (
                            <>
                              <button type="button" className="btn btn-secondary h-7 px-2 text-[10px]" onClick={() => openComplete(followUp)}>
                                <Check className="h-3 w-3" /> Done
                              </button>
                              <button type="button" className="icon-button h-7 w-7" onClick={() => openReschedule(followUp)} title="Reschedule">
                                <RotateCcw className="h-3 w-3" />
                              </button>
                            </>
                          )}
                          {followUp.status === 'completed' && (
                            <span className="text-[9.5px] text-subtle">{followUp.completedAt ? formatDateTime(followUp.completedAt) : 'Completed'}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={CalendarClock}
                      title={view === 'today' ? 'Nothing due today' : `No ${view} follow-ups`}
                      description="Schedule a reminder or log a call with a next action to build your queue."
                      action={<button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>Schedule follow-up</button>}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} limit={20} total={data?.pagination?.total || 0} onPageChange={setPage} />
        </div>
      )}

      <FollowUpFormModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={refresh} />
      <Modal
        open={Boolean(completeTarget)}
        onClose={() => setCompleteTarget(null)}
        title="Complete follow-up"
        description={completeTarget ? `${completeTarget.lead?.businessName} · ${formatDateTime(completeTarget.dueAt)}` : ''}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setCompleteTarget(null)} disabled={working}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={complete} disabled={working}>
              {working && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {working ? 'Saving…' : 'Mark complete'}
            </button>
          </>
        }
      >
        <label className="label" htmlFor="meetingNotes">Meeting notes (optional)</label>
        <textarea id="meetingNotes" className="input" rows={3} value={completeNotes} onChange={(event) => setCompleteNotes(event.target.value)} placeholder="What happened? What is the next step?" />
      </Modal>
      <Modal
        open={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        title="Reschedule follow-up"
        description={rescheduleTarget ? rescheduleTarget.lead?.businessName : ''}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setRescheduleTarget(null)} disabled={working}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={reschedule} disabled={!rescheduleAt || working}>
              {working && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {working ? 'Saving…' : 'Reschedule'}
            </button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div>
            <label className="label" htmlFor="rescheduleAt">New date & time *</label>
            <input id="rescheduleAt" type="datetime-local" className="input" value={rescheduleAt} onChange={(event) => setRescheduleAt(event.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="rescheduleReason">Reason</label>
            <textarea id="rescheduleReason" className="input" rows={2} value={rescheduleReason} onChange={(event) => setRescheduleReason(event.target.value)} placeholder="Client asked to move it…" />
          </div>
        </div>
      </Modal>
    </div>
  )
}
