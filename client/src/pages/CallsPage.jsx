import { useMemo, useState } from 'react'
import { PhoneCall, PhoneOutgoing } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { CallFormModal } from '../components/CallFormModal'
import { PageHeader } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { EmptyState, ErrorState, PageSkeleton } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { useMembers } from '../hooks/useMembers'
import { CALL_OUTCOMES } from '../lib/constants'
import { formatDateTime } from '../lib/utils'

const duration = (seconds) => {
  if (!seconds) return '—'
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return minutes ? `${minutes}m ${rest}s` : `${rest}s`
}

export const CallsPage = () => {
  const navigate = useNavigate()
  const { isPrivileged } = useAuth()
  const { members } = useMembers()
  const [page, setPage] = useState(1)
  const [outcome, setOutcome] = useState('')
  const [user, setUser] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [reload, setReload] = useState(0)
  const query = useMemo(() => ({ page, limit: 20, outcome, user }), [page, outcome, user])
  const { data, loading, error, refetch } = useApi('/calls', query, [reload])
  const items = data?.items || []

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Conversation log"
        title="Calls"
        description="A complete record of outreach, outcomes and the next action promised."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <PhoneOutgoing className="h-3.5 w-3.5" /> Log call
          </button>
        }
      />

      <div className="panel flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        <select
          value={outcome}
          onChange={(event) => {
            setOutcome(event.target.value)
            setPage(1)
          }}
          className="input max-w-[190px]"
        >
          <option value="">All outcomes</option>
          {CALL_OUTCOMES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        {isPrivileged && (
          <select
            value={user}
            onChange={(event) => {
              setUser(event.target.value)
              setPage(1)
            }}
            className="input max-w-[190px]"
          >
            <option value="">All teammates</option>
            {members.map((membership) => (
              <option key={membership.user?._id} value={membership.user?._id}>{membership.user?.name}</option>
            ))}
          </select>
        )}
        <p className="ml-auto text-[10px] text-subtle">
          {data?.total ?? 0} calls · {isPrivileged ? 'workspace view' : 'your calls'}
        </p>
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
                <th>Outcome</th>
                <th>Duration</th>
                <th>Teammate</th>
                <th>Next action</th>
                <th>Called at</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((call) => (
                  <tr key={call._id} className="cursor-pointer" onClick={() => navigate(`/leads/${call.lead?._id}`)}>
                    <td>
                      <p className="font-semibold">{call.lead?.businessName || 'Deleted lead'}</p>
                      <p className="text-[10px] text-subtle">{call.lead?.phone || 'No phone'}</p>
                    </td>
                    <td>
                      <span className={`badge ${['Interested', 'Meeting Requested'].includes(call.outcome) ? 'badge-success' : call.outcome === 'Not Interested' ? 'badge-danger' : 'badge-muted'}`}>
                        {call.outcome}
                      </span>
                    </td>
                    <td className="text-muted">{duration(call.durationSeconds)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar user={call.user} size="xs" />
                        <span>{call.user?.name}</span>
                      </div>
                    </td>
                    <td className="max-w-[260px] truncate text-muted">{call.nextAction || '—'}</td>
                    <td className="text-muted">{formatDateTime(call.calledAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={PhoneCall}
                      title="No calls logged"
                      description="Log a conversation and LeadPilot will keep the outcome, notes and next step together."
                      action={<button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>Log the first call</button>}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} limit={20} total={data?.pagination?.total || 0} onPageChange={setPage} />
        </div>
      )}

      <CallFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setReload((current) => current + 1)
          refetch({ quiet: true })
        }}
      />
    </div>
  )
}
