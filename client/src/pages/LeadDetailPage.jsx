import { useState } from 'react'
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  PhoneCall,
  Plus,
  Trash2,
  UserRound,
  Wallet,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Avatar } from '../components/Avatar'
import { CallFormModal } from '../components/CallFormModal'
import { ConfirmDialog } from '../components/Modal'
import { DealFormModal } from '../components/DealFormModal'
import { FollowUpFormModal } from '../components/FollowUpFormModal'
import { LeadFormModal } from '../components/LeadFormModal'
import { PageHeader, Stat } from '../components/PageHeader'
import { ErrorState, PageSkeleton } from '../components/States'
import {
  CommissionStatusBadge,
  DealStatusBadge,
  LeadStatusBadge,
  PriorityBadge,
} from '../components/StatusBadges'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { formatDate, formatDateTime, formatMoney, timeAgo } from '../lib/utils'

const activityIcons = {
  'lead.created': Building2,
  'lead.updated': Pencil,
  'lead.stage_changed': CheckCircle2,
  'lead.assigned': UserRound,
  'call.logged': PhoneCall,
  'follow_up.created': CalendarClock,
  'follow_up.completed': Check,
  'deal.created': CircleDollarSign,
  'deal.won': CheckCircle2,
  'deal.lost': CircleDollarSign,
  'payment.recorded': Wallet,
  'commission.approved': CheckCircle2,
  'commission.paid': Wallet,
}

const tabs = ['activity', 'calls', 'follow-ups', 'deals']

export const LeadDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isPrivileged } = useAuth()
  const { data, loading, error, refetch } = useApi(`/leads/${id}`)
  const [tab, setTab] = useState('activity')
  const [editOpen, setEditOpen] = useState(false)
  const [callOpen, setCallOpen] = useState(false)
  const [followUpOpen, setFollowUpOpen] = useState(false)
  const [dealOpen, setDealOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (loading && !data) return <PageSkeleton />
  if (error && !data) return <ErrorState error={error} onRetry={refetch} />

  const { lead, activities = [], calls = [], followUps = [], deals = [] } = data
  const pendingFollowUps = followUps.filter((item) => item.status === 'pending')
  const wonValue = deals.filter((deal) => deal.status === 'won').reduce((sum, deal) => sum + deal.amountPaise, 0)

  const completeFollowUp = async (followUpId) => {
    try {
      await api.patch(`/follow-ups/${followUpId}/complete`, {})
      toast.success('Follow-up completed')
      refetch({ quiet: true })
    } catch (requestError) {
      toast.error(requestError.message)
    }
  }

  const removeLead = async () => {
    setDeleting(true)
    try {
      await api.delete(`/leads/${lead._id}`)
      toast.success('Lead deleted')
      navigate('/leads', { replace: true })
    } catch (requestError) {
      toast.error(requestError.message)
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      <Link to="/leads" className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-muted transition hover:text-[var(--text)]">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to leads
      </Link>

      <PageHeader
        eyebrow="Lead record"
        title={lead.businessName}
        description={`${lead.industry || 'No industry'} · Created ${formatDate(lead.createdAt)}`}
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setCallOpen(true)}>
              <PhoneCall className="h-3.5 w-3.5" /> Log call
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setFollowUpOpen(true)}>
              <CalendarClock className="h-3.5 w-3.5" /> Follow-up
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setDealOpen(true)}>
              <CircleDollarSign className="h-3.5 w-3.5" /> Create deal
            </button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <LeadStatusBadge status={lead.status} />
        <PriorityBadge priority={lead.priority} />
        {lead.assignedTo && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-app px-2 py-1 text-[10px] text-muted">
            <Avatar user={lead.assignedTo} size="xs" className="h-4 w-4 text-[7px]" />
            {lead.assignedTo.name}
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full border border-app px-2 py-1 text-[10px] text-muted">
          <MapPin className="h-3 w-3" /> {lead.city || 'Location not set'}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button type="button" className="icon-button h-8 w-8" onClick={() => setEditOpen(true)} title="Edit lead">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {isPrivileged && (
            <button type="button" className="icon-button h-8 w-8 text-[var(--danger)]" onClick={() => setDeleteOpen(true)} title="Delete lead">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Estimated value" value={formatMoney(lead.estimatedValuePaise, { compact: true })} icon={CircleDollarSign} tone="accent" />
        <Stat label="Won value" value={formatMoney(wonValue, { compact: true })} hint={`${deals.length} deal${deals.length === 1 ? '' : 's'} linked`} icon={Wallet} tone="success" />
        <Stat label="Open follow-ups" value={pendingFollowUps.length} hint={lead.nextFollowUpAt ? `Next ${formatDate(lead.nextFollowUpAt)}` : 'Nothing scheduled'} icon={CalendarClock} tone="warning" />
        <Stat label="Last contacted" value={lead.lastContactedAt ? formatDate(lead.lastContactedAt) : 'Not yet'} hint={`${calls.length} calls logged`} icon={PhoneCall} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <section className="panel overflow-hidden">
          <div className="flex gap-1 overflow-x-auto border-b border-app px-3 pt-3 scrollbar-none">
            {tabs.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`shrink-0 border-b-2 px-3 py-2 text-[11px] font-medium capitalize transition ${
                  tab === item
                    ? 'border-orange-500 text-[var(--text)]'
                    : 'border-transparent text-muted hover:text-[var(--text)]'
                }`}
              >
                {item}
                {item === 'follow-ups' && pendingFollowUps.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-[var(--accent-soft)] px-1.5 text-[9px] text-orange-500">{pendingFollowUps.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-5">
            {tab === 'activity' && (
              <div>
                {activities.length ? (
                  activities.map((activity) => {
                    const Icon = activityIcons[activity.type] || MessageSquare
                    return (
                      <div key={activity._id} className="flex gap-3 border-b border-app py-3 first:pt-0 last:border-0">
                        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-subtle">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11.5px] leading-relaxed">{activity.message}</p>
                          <p className="mt-0.5 text-[9.5px] text-subtle">
                            {activity.actor?.name || 'System'} · {timeAgo(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="py-12 text-center text-[11px] text-muted">Activity will appear as this lead moves forward.</p>
                )}
              </div>
            )}

            {tab === 'calls' && (
              <div>
                {calls.length ? (
                  calls.map((call) => (
                    <div key={call._id} className="border-b border-app py-3 first:pt-0 last:border-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="badge badge-accent">{call.outcome}</span>
                          <p className="text-[10px] text-muted">{formatDateTime(call.calledAt)}</p>
                        </div>
                        <span className="text-[9.5px] text-subtle">
                          {call.durationSeconds ? `${Math.round(call.durationSeconds / 60)} min` : '—'}
                        </span>
                      </div>
                      {call.notes && <p className="mt-2 text-[11px] leading-relaxed text-muted">{call.notes}</p>}
                      {call.nextAction && (
                        <p className="mt-1.5 text-[10.5px] text-orange-500">Next: {call.nextAction}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <PhoneCall className="mx-auto h-5 w-5 text-subtle" />
                    <p className="mt-2 text-[11px] font-medium">No calls logged</p>
                    <button type="button" className="mt-2 text-[10px] text-orange-500" onClick={() => setCallOpen(true)}>Log the first call</button>
                  </div>
                )}
              </div>
            )}

            {tab === 'follow-ups' && (
              <div>
                {followUps.length ? (
                  followUps.map((followUp) => (
                    <div key={followUp._id} className="flex items-start gap-3 border-b border-app py-3 first:pt-0 last:border-0">
                      <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${followUp.type === 'meeting' ? 'bg-[var(--accent-soft)] text-orange-500' : 'bg-[var(--warning-soft)] text-[var(--warning)]'}`}>
                        {followUp.type === 'meeting' ? <CalendarClock className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[11.5px] font-medium capitalize">{followUp.type.replace('_', ' ')}</p>
                          <PriorityBadge priority={followUp.priority} />
                          <span className={`badge ${followUp.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{followUp.status}</span>
                        </div>
                        <p className="mt-1 text-[10px] text-muted">{formatDateTime(followUp.dueAt)}</p>
                        {followUp.notes && <p className="mt-1 text-[10.5px] text-muted">{followUp.notes}</p>}
                      </div>
                      {followUp.status === 'pending' && (
                        <button type="button" className="btn btn-secondary h-7 px-2 text-[10px]" onClick={() => completeFollowUp(followUp._id)}>
                          <Check className="h-3 w-3" /> Done
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <CalendarClock className="mx-auto h-5 w-5 text-subtle" />
                    <p className="mt-2 text-[11px] font-medium">Nothing scheduled</p>
                    <button type="button" className="mt-2 text-[10px] text-orange-500" onClick={() => setFollowUpOpen(true)}>Schedule a follow-up</button>
                  </div>
                )}
              </div>
            )}

            {tab === 'deals' && (
              <div>
                {deals.length ? (
                  deals.map((deal) => (
                    <Link key={deal._id} to={`/deals/${deal._id}`} className="flex items-center gap-3 border-b border-app py-3 first:pt-0 last:border-0">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--success-soft)] text-[var(--success)]">
                        <CircleDollarSign className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11.5px] font-semibold">{formatMoney(deal.amountPaise)}</p>
                        <p className="text-[9.5px] text-subtle">Created {formatDate(deal.createdAt)}</p>
                      </div>
                      <DealStatusBadge status={deal.status} />
                    </Link>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <CircleDollarSign className="mx-auto h-5 w-5 text-subtle" />
                    <p className="mt-2 text-[11px] font-medium">No deal yet</p>
                    <button type="button" className="mt-2 text-[10px] text-orange-500" onClick={() => setDealOpen(true)}>Create a deal</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="space-y-4">
          <section className="panel p-4">
            <h2 className="section-title">Contact</h2>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2.5">
                <UserRound className="h-3.5 w-3.5 text-subtle" />
                <span className="text-[11px]">{lead.contactPerson || 'No contact person'}</span>
              </div>
              <a href={lead.phone ? `tel:${lead.phone}` : undefined} className={`flex items-center gap-2.5 ${lead.phone ? 'hover:text-orange-500' : ''}`}>
                <Phone className="h-3.5 w-3.5 text-subtle" />
                <span className="text-[11px]">{lead.phone || 'No phone'}</span>
              </a>
              <a href={lead.email ? `mailto:${lead.email}` : undefined} className={`flex items-center gap-2.5 ${lead.email ? 'hover:text-orange-500' : ''}`}>
                <Mail className="h-3.5 w-3.5 text-subtle" />
                <span className="min-w-0 truncate text-[11px]">{lead.email || 'No email'}</span>
              </a>
              <a href={lead.website || undefined} target="_blank" rel="noreferrer" className={`flex items-center gap-2.5 ${lead.website ? 'hover:text-orange-500' : ''}`}>
                <Globe className="h-3.5 w-3.5 text-subtle" />
                <span className="min-w-0 truncate text-[11px]">{lead.website || 'No website'}</span>
              </a>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-3.5 w-3.5 text-subtle" />
                <span className="text-[11px]">{[lead.city, lead.country].filter(Boolean).join(', ') || 'No location'}</span>
              </div>
            </div>
          </section>

          <section className="panel p-4">
            <h2 className="section-title">Record details</h2>
            <dl className="mt-3 space-y-2.5">
              {[
                ['Source', lead.source],
                ['Industry', lead.industry || '—'],
                ['Value', formatMoney(lead.estimatedValuePaise)],
                ['Created', formatDate(lead.createdAt)],
                ['Last contacted', lead.lastContactedAt ? formatDateTime(lead.lastContactedAt) : 'Not yet'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <dt className="text-[10px] text-muted">{label}</dt>
                  <dd className="text-right text-[10.5px] font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="panel p-4">
            <h2 className="section-title">Notes</h2>
            <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-muted">
              {lead.notes || 'No notes added yet. Use edit to capture context, pain points and buying signals.'}
            </p>
          </section>

          {deals[0]?.commission && (
            <section className="panel p-4">
              <div className="flex items-center justify-between">
                <h2 className="section-title">Commission snapshot</h2>
                <CommissionStatusBadge status={deals[0].commission.status} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9.5px] text-muted">Rate captured</p>
                  <p className="mt-0.5 text-sm font-bold">{deals[0].commission.ratePercent}%</p>
                </div>
                <div>
                  <p className="text-[9.5px] text-muted">Calculated</p>
                  <p className="mt-0.5 text-sm font-bold">{formatMoney(deals[0].commission.calculatedCommissionPaise, { compact: true })}</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      <LeadFormModal open={editOpen} onClose={() => setEditOpen(false)} lead={lead} onSaved={refetch} />
      <CallFormModal open={callOpen} onClose={() => setCallOpen(false)} lead={lead} onSaved={refetch} />
      <FollowUpFormModal open={followUpOpen} onClose={() => setFollowUpOpen(false)} lead={lead} onSaved={refetch} />
      <DealFormModal open={dealOpen} onClose={() => setDealOpen(false)} lead={lead} onSaved={refetch} />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={removeLead}
        title="Delete this lead?"
        description="The lead will be soft-deleted and removed from active pipeline views."
        confirmLabel="Delete lead"
        loading={deleting}
      />
    </div>
  )
}
