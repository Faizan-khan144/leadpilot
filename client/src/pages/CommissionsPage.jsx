import { useMemo, useState } from 'react'
import { BadgeCheck, Coins, Loader2, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Avatar } from '../components/Avatar'
import { Modal } from '../components/Modal'
import { PageHeader, Stat } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { EmptyState, ErrorState, PageSkeleton } from '../components/States'
import { CommissionStatusBadge } from '../components/StatusBadges'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { useMembers } from '../hooks/useMembers'
import { api } from '../lib/api'
import { formatMoney, titleCase } from '../lib/utils'

const STATUSES = ['pending', 'partially_approved', 'approved', 'paid']

export const CommissionsPage = () => {
  const { isOwner, isPrivileged } = useAuth()
  const { members } = useMembers()
  const [status, setStatus] = useState('')
  const [member, setMember] = useState('')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [action, setAction] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [method, setMethod] = useState('bank_transfer')
  const [reference, setReference] = useState('')
  const [working, setWorking] = useState(false)
  const query = useMemo(() => ({ page, limit: 20, status, member }), [page, status, member])
  const { data, loading, error, refetch } = useApi('/commissions', query, [reload])
  const items = data?.items || []
  const summary = data?.summary || {}

  const openAction = (type, commission) => {
    const available = type === 'approve'
      ? commission.earnedCommissionPaise - commission.approvedCommissionPaise
      : commission.approvedCommissionPaise - commission.paidCommissionPaise
    setAction({ type, commission })
    setAmount((Math.max(0, available) / 100).toFixed(2))
    setNote('')
    setMethod('bank_transfer')
    setReference('')
  }

  const submitAction = async () => {
    const paise = Math.round(Number(amount) * 100)
    if (!paise) return
    setWorking(true)
    try {
      const path = action.type === 'approve' ? 'approve' : 'payout'
      const body = action.type === 'approve'
        ? { amountPaise: paise, note: note.trim() }
        : { amountPaise: paise, method, reference: reference.trim(), note: note.trim() }
      await api.post(`/commissions/${action.commission._id}/${path}`, body)
      toast.success(action.type === 'approve' ? 'Commission approved' : 'Payout recorded')
      setAction(null)
      setReload((current) => current + 1)
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
        eyebrow="Finance"
        title="Commissions"
        description="Commission is earned from recorded payments. Owner approval is required before any payout is released."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Calculated" value={formatMoney(summary.calculatedCommissionPaise || 0, { compact: true })} hint="Full deal commission at captured rates" icon={Coins} tone="default" />
        <Stat label="Earned" value={formatMoney(summary.earnedCommissionPaise || 0, { compact: true })} hint="Released by payments received" icon={BadgeCheck} tone="accent" />
        <Stat label="Approved" value={formatMoney(summary.approvedCommissionPaise || 0, { compact: true })} hint="Cleared by the owner" icon={Wallet} tone="success" />
        <Stat label="Paid out" value={formatMoney(summary.paidCommissionPaise || 0, { compact: true })} hint="Recorded payouts" icon={Wallet} tone="success" />
      </div>

      <div className="panel flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className="input max-w-[190px]">
          <option value="">All commission statuses</option>
          {STATUSES.map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}
        </select>
        {isPrivileged && (
          <select value={member} onChange={(event) => { setMember(event.target.value); setPage(1) }} className="input max-w-[200px]">
            <option value="">All teammates</option>
            {members.map((membership) => <option key={membership.user?._id} value={membership.user?._id}>{membership.user?.name}</option>)}
          </select>
        )}
        {!isOwner && <p className="ml-auto text-[10px] text-subtle">Approval and payout actions are owner-only.</p>}
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
                <th>Member</th>
                <th>Rate</th>
                <th>Calculated</th>
                <th>Received</th>
                <th>Earned</th>
                <th>Approved</th>
                <th>Paid</th>
                <th>Status</th>
                {isOwner && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((commission) => {
                  const approvable = commission.earnedCommissionPaise - commission.approvedCommissionPaise
                  const payable = commission.approvedCommissionPaise - commission.paidCommissionPaise
                  return (
                    <tr key={commission._id}>
                      <td>
                        {commission.deal?._id ? (
                          <Link to={`/deals/${commission.deal._id}`} className="font-semibold hover:text-orange-500">{commission.deal.businessName}</Link>
                        ) : (
                          <span className="font-semibold">Deleted deal</span>
                        )}
                        <p className="text-[9.5px] capitalize text-subtle">{commission.basis.replace('_', ' ')}</p>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar user={commission.member} size="xs" />
                          <span>{commission.member?.name}</span>
                        </div>
                      </td>
                      <td className="font-medium">{commission.ratePercent}%</td>
                      <td>{formatMoney(commission.calculatedCommissionPaise)}</td>
                      <td className="text-muted">{formatMoney(commission.receivedPaise)}</td>
                      <td className="font-semibold text-orange-500">{formatMoney(commission.earnedCommissionPaise)}</td>
                      <td>{formatMoney(commission.approvedCommissionPaise)}</td>
                      <td>{formatMoney(commission.paidCommissionPaise)}</td>
                      <td><CommissionStatusBadge status={commission.status} /></td>
                      {isOwner && (
                        <td>
                          <div className="flex justify-end gap-1">
                            {approvable > 0 && (
                              <button type="button" className="btn btn-secondary h-7 px-2 text-[10px]" onClick={() => openAction('approve', commission)}>
                                Approve
                              </button>
                            )}
                            {payable > 0 && (
                              <button type="button" className="btn btn-primary h-7 px-2 text-[10px]" onClick={() => openAction('payout', commission)}>
                                Pay
                              </button>
                            )}
                            {approvable <= 0 && payable <= 0 && <span className="text-[9.5px] text-subtle">—</span>}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={isOwner ? 10 : 9}>
                    <EmptyState icon={Coins} title="No commission records" description="Commissions are created automatically when a deal is created and grow as payments are recorded." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} limit={20} total={data?.pagination?.total || 0} onPageChange={setPage} />
        </div>
      )}

      <Modal
        open={Boolean(action)}
        onClose={() => setAction(null)}
        title={action?.type === 'approve' ? 'Approve commission' : 'Record commission payout'}
        description={action ? `${action.commission.deal?.businessName} · ${action.commission.member?.name}` : ''}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setAction(null)} disabled={working}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={submitAction} disabled={working || !Number(amount)}>
              {working && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {working ? 'Saving…' : action?.type === 'approve' ? 'Approve' : 'Record payout'}
            </button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div>
            <label className="label" htmlFor="commissionAmount">
              {action?.type === 'approve' ? 'Approval amount (₹) *' : 'Payout amount (₹) *'}
            </label>
            <input id="commissionAmount" type="number" min="0.01" step="0.01" className="input" value={amount} onChange={(event) => setAmount(event.target.value)} />
            <p className="mt-1.5 text-[10px] text-subtle">
              Available: {formatMoney(
                !action
                  ? 0
                  : action.type === 'approve'
                    ? Math.max(0, action.commission.earnedCommissionPaise - action.commission.approvedCommissionPaise)
                    : Math.max(0, action.commission.approvedCommissionPaise - action.commission.paidCommissionPaise),
              )}
            </p>
          </div>
          {action?.type === 'payout' && (
            <>
              <div>
                <label className="label" htmlFor="payoutMethod">Method *</label>
                <select id="payoutMethod" className="input" value={method} onChange={(event) => setMethod(event.target.value)}>
                  {['bank_transfer', 'upi', 'cash', 'cheque', 'other'].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="payoutReference">Reference</label>
                <input id="payoutReference" className="input" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="UTR or receipt number" />
              </div>
            </>
          )}
          <div>
            <label className="label" htmlFor="commissionNote">Note</label>
            <textarea id="commissionNote" className="input" rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
