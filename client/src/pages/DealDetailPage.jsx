import { useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  History,
  IndianRupee,
  Pencil,
  Plus,
  Target,
  XCircle,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Avatar } from '../components/Avatar'
import { EditDealModal } from '../components/EditDealModal'
import { Modal } from '../components/Modal'
import { PageHeader, Stat } from '../components/PageHeader'
import { PaymentModal } from '../components/PaymentModal'
import { EmptyState, ErrorState, PageSkeleton } from '../components/States'
import { CommissionStatusBadge, DealStatusBadge } from '../components/StatusBadges'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { formatDate, formatDateTime, formatMoney, titleCase } from '../lib/utils'

export const DealDetailPage = () => {
  const { id } = useParams()
  const [reload, setReload] = useState(0)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [closing, setClosing] = useState(null)
  const [lostReason, setLostReason] = useState('')
  const [working, setWorking] = useState(false)
  const { data, loading, error, refetch } = useApi(`/deals/${id}`, null, [reload])
  const deal = data?.deal
  const payments = data?.payments || []
  const activities = data?.activities || []

  const refresh = () => {
    setReload((current) => current + 1)
    refetch({ quiet: true })
  }

  const closeDeal = async () => {
    if (closing === 'lost' && !lostReason.trim()) return
    setWorking(true)
    try {
      await api.patch(`/deals/${id}/status`, {
        status: closing,
        ...(closing === 'lost' ? { lostReason: lostReason.trim() } : {}),
      })
      toast.success(closing === 'won' ? 'Deal marked won' : 'Deal marked lost')
      setClosing(null)
      setLostReason('')
      refresh()
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setWorking(false)
    }
  }

  if (loading && !data) return <PageSkeleton />
  if (error && !data) return <ErrorState error={error} onRetry={refetch} />
  if (!deal) return <ErrorState error={{ message: 'Deal not found' }} />

  const progress = deal.amountPaise ? Math.min(100, Math.round((deal.receivedPaise / deal.amountPaise) * 100)) : 0
  const canPay = deal.status !== 'lost' && deal.outstandingPaise > 0

  return (
    <div className="space-y-5">
      <Link to="/deals" className="inline-flex items-center gap-1.5 text-[11px] text-muted transition hover:text-[var(--text)]">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to deals
      </Link>

      <PageHeader
        eyebrow="Deal record"
        title={deal.businessName}
        description={deal.lead ? `Linked to ${deal.lead.businessName}` : deal.contactPerson || 'No contact person'}
        actions={
          <>
            {deal.status !== 'lost' && (
              <button type="button" className="btn btn-secondary" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            )}
            {canPay && (
              <button type="button" className="btn btn-secondary" onClick={() => setPaymentOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Payment
              </button>
            )}
            {deal.status === 'open' && (
              <>
                <button type="button" className="btn btn-secondary" onClick={() => setClosing('lost')}>
                  <XCircle className="h-3.5 w-3.5" /> Lost
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setClosing('won')}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Mark won
                </button>
              </>
            )}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <DealStatusBadge status={deal.status} />
        <span className="text-[10px] text-subtle">Created {formatDate(deal.createdAt)}</span>
        {deal.actualClosingDate && <span className="text-[10px] text-subtle">· Closed {formatDate(deal.actualClosingDate)}</span>}
      </div>

      {deal.status === 'lost' && deal.lostReason && (
        <div className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-4 py-3 text-[11.5px] text-[var(--danger)]">
          <span className="font-semibold">Lost reason:</span> {deal.lostReason}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Deal value" value={formatMoney(deal.amountPaise)} hint={`${deal.commission?.ratePercent ?? '—'}% commission rate`} icon={Target} tone="accent" />
        <Stat label="Received" value={formatMoney(deal.receivedPaise)} hint={`${progress}% collected`} icon={IndianRupee} tone="success" />
        <Stat label="Outstanding" value={formatMoney(deal.outstandingPaise)} hint={deal.outstandingPaise ? 'Balance still due' : 'Fully collected'} icon={FileText} tone={deal.outstandingPaise ? 'warning' : 'success'} />
        <Stat label="Commission earned" value={formatMoney(deal.commission?.earnedCommissionPaise || 0)} hint={`${formatMoney(deal.commission?.paidCommissionPaise || 0)} paid`} icon={CheckCircle2} tone="accent" />
      </div>

      <div className="panel p-4">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted">Collection progress</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
          <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-fuchsia-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-app px-4 py-3">
              <h2 className="text-[12px] font-semibold">Payments</h2>
              {canPay && (
                <button type="button" className="btn btn-secondary h-7 px-2 text-[10px]" onClick={() => setPaymentOpen(true)}>
                  <Plus className="h-3 w-3" /> Record
                </button>
              )}
            </div>
            {payments.length ? (
              <div className="divide-y divide-[var(--border)]">
                {payments.map((payment) => (
                  <div key={payment._id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11.5px] font-semibold">{formatMoney(payment.amountPaise)}</p>
                      <p className="mt-0.5 text-[9.5px] text-subtle">
                        {titleCase(payment.method)} · {payment.reference || 'No reference'} · {payment.recordedBy?.name}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-muted">{formatDate(payment.receivedAt)}</p>
                      {payment.notes && <p className="mt-0.5 max-w-[260px] truncate text-[9.5px] text-subtle">{payment.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={IndianRupee} title="No payments recorded" description="Record the first payment to start releasing commission." />
            )}
          </div>

          <div className="panel overflow-hidden">
            <div className="flex items-center gap-2 border-b border-app px-4 py-3">
              <History className="h-3.5 w-3.5 text-orange-500" />
              <h2 className="text-[12px] font-semibold">Activity</h2>
            </div>
            {activities.length ? (
              <div className="divide-y divide-[var(--border)]">
                {activities.map((activity) => (
                  <div key={activity._id} className="flex gap-3 px-4 py-3">
                    <Avatar user={activity.actor} size="xs" className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10.5px] leading-relaxed">{activity.message}</p>
                      <p className="mt-0.5 text-[9px] text-subtle">{formatDateTime(activity.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={History} title="No activity yet" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-4">
            <h2 className="text-[12px] font-semibold">Deal details</h2>
            <dl className="mt-3 space-y-2.5">
              <div className="flex justify-between gap-3 text-[10.5px]"><dt className="text-muted">Owner</dt><dd className="flex items-center gap-1.5 font-medium"><Avatar user={deal.assignedTo} size="xs" className="h-5 w-5 text-[7px]" />{deal.assignedTo?.name}</dd></div>
              <div className="flex justify-between gap-3 text-[10.5px]"><dt className="text-muted">Proposal date</dt><dd className="font-medium">{formatDate(deal.proposalDate)}</dd></div>
              <div className="flex justify-between gap-3 text-[10.5px]"><dt className="text-muted">Expected close</dt><dd className="font-medium">{formatDate(deal.expectedClosingDate)}</dd></div>
              <div className="flex justify-between gap-3 text-[10.5px]"><dt className="text-muted">Created by</dt><dd className="font-medium">{deal.createdBy?.name}</dd></div>
              <div className="flex justify-between gap-3 text-[10.5px]"><dt className="text-muted">Contact</dt><dd className="font-medium">{deal.contactPerson || '—'}</dd></div>
            </dl>
            {deal.notes && (
              <div className="mt-3 border-t border-app pt-3">
                <p className="text-[9.5px] uppercase tracking-[0.06em] text-subtle">Notes</p>
                <p className="mt-1 whitespace-pre-wrap text-[10.5px] leading-relaxed text-muted">{deal.notes}</p>
              </div>
            )}
          </div>

          {deal.lead && (
            <div className="panel p-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
                <h2 className="text-[12px] font-semibold">Linked lead</h2>
              </div>
              <Link to={`/leads/${deal.lead._id}`} className="mt-2 block text-[11.5px] font-semibold hover:text-orange-500">
                {deal.lead.businessName}
              </Link>
              <p className="mt-1 text-[10px] text-muted">{deal.lead.contactPerson || 'No contact person'}</p>
              <p className="mt-0.5 text-[10px] text-muted">{deal.lead.phone || deal.lead.email || 'No contact details'}</p>
            </div>
          )}

          {deal.commission && (
            <div className="panel p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[12px] font-semibold">Commission</h2>
                <CommissionStatusBadge status={deal.commission.status} />
              </div>
              <dl className="mt-3 space-y-2.5">
                <div className="flex justify-between gap-3 text-[10.5px]"><dt className="text-muted">Captured rate</dt><dd className="font-medium">{deal.commission.ratePercent}%</dd></div>
                <div className="flex justify-between gap-3 text-[10.5px]"><dt className="text-muted">Basis</dt><dd className="font-medium capitalize">{deal.commission.basis.replace('_', ' ')}</dd></div>
                <div className="flex justify-between gap-3 text-[10.5px]"><dt className="text-muted">Calculated</dt><dd className="font-medium">{formatMoney(deal.commission.calculatedCommissionPaise)}</dd></div>
                <div className="flex justify-between gap-3 text-[10.5px]"><dt className="text-muted">Earned</dt><dd className="font-medium">{formatMoney(deal.commission.earnedCommissionPaise)}</dd></div>
                <div className="flex justify-between gap-3 text-[10.5px]"><dt className="text-muted">Approved</dt><dd className="font-medium">{formatMoney(deal.commission.approvedCommissionPaise)}</dd></div>
                <div className="flex justify-between gap-3 text-[10.5px]"><dt className="text-muted">Paid</dt><dd className="font-medium">{formatMoney(deal.commission.paidCommissionPaise)}</dd></div>
              </dl>
              <Link to="/commissions" className="mt-3 inline-block text-[10px] font-medium text-orange-500 hover:underline">Open commissions →</Link>
            </div>
          )}
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        deal={deal}
        onSaved={() => {
          setReload((current) => current + 1)
          refetch({ quiet: true })
        }}
      />
      <EditDealModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        deal={deal}
        onSaved={() => {
          setReload((current) => current + 1)
          refetch({ quiet: true })
        }}
      />
      <Modal
        open={Boolean(closing)}
        onClose={() => setClosing(null)}
        title={closing === 'won' ? 'Mark deal as won' : 'Mark deal as lost'}
        description={closing === 'won' ? 'The linked lead will move to Won. Payments can still be recorded.' : 'The deal will close and commissions stop accruing.'}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setClosing(null)} disabled={working}>Cancel</button>
            <button
              type="button"
              className={closing === 'lost' ? 'btn btn-danger' : 'btn btn-primary'}
              onClick={closeDeal}
              disabled={working || (closing === 'lost' && !lostReason.trim())}
            >
              {working ? 'Saving…' : closing === 'won' ? 'Mark won' : 'Mark lost'}
            </button>
          </>
        }
      >
        {closing === 'lost' ? (
          <>
            <label className="label" htmlFor="dealLostReason">Lost reason *</label>
            <textarea id="dealLostReason" className="input" rows={3} value={lostReason} onChange={(event) => setLostReason(event.target.value)} placeholder="Budget, timing, competitor…" autoFocus />
          </>
        ) : (
          <p className="text-[11.5px] text-muted">Confirm that this deal closed successfully. This action is recorded in the audit trail.</p>
        )}
      </Modal>
    </div>
  )
}
