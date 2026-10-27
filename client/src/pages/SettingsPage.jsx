import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  Building2,
  Info,
  Loader2,
  Percent,
  Plus,
  Save,
  ScrollText,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '../components/Badge'
import { PageHeader } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { ErrorState, PageSkeleton } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { formatDateTime, titleCase } from '../lib/utils'

const TABS = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'commission', label: 'Commission', icon: Percent },
  { id: 'audit', label: 'Audit log', icon: ScrollText },
]

const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Australia/Sydney',
]

const rupee = (paise) => (Number(paise || 0) / 100).toString()
const paise = (value) => Math.round(Number(value || 0) * 100)

export const SettingsPage = () => {
  const { isOwner, refresh: refreshSession, activeOrganization } = useAuth()
  const [tab, setTab] = useState('general')
  const [reload, setReload] = useState(0)
  const { data, loading, error, refetch } = useApi('/organizations/current', null, [reload])
  const [general, setGeneral] = useState({ name: '', timezone: 'Asia/Kolkata', paymentPolicyNotes: '' })
  const [commission, setCommission] = useState({ basis: 'deal_value', approvalRequired: true, rules: [], notes: '' })
  const [generalWorking, setGeneralWorking] = useState(false)
  const [commissionWorking, setCommissionWorking] = useState(false)
  const [auditPage, setAuditPage] = useState(1)
  const [expanded, setExpanded] = useState(null)
  const [auditReload, setAuditReload] = useState(0)
  const audit = useApi(tab === 'audit' && isOwner ? '/organizations/current/audit-logs' : null, { page: auditPage, limit: 20 }, [auditReload])
  const organization = data?.organization

  useEffect(() => {
    if (!organization) return
    setGeneral({
      name: organization.name || '',
      timezone: organization.timezone || 'Asia/Kolkata',
      paymentPolicyNotes: organization.paymentPolicyNotes || '',
    })
    setCommission({
      basis: organization.commissionBasis || 'deal_value',
      approvalRequired: organization.approvalRequired !== false,
      rules: (organization.commissionRules || []).map((rule) => ({
        max: rule.maxPaise === null || rule.maxPaise === undefined ? '' : rupee(rule.maxPaise),
        rate: String(rule.ratePercent),
      })),
      notes: organization.paymentPolicyNotes || '',
    })
  }, [organization])

  const saveGeneral = async (event) => {
    event.preventDefault()
    setGeneralWorking(true)
    try {
      await api.patch('/organizations/current', {
        name: general.name.trim(),
        timezone: general.timezone,
        paymentPolicyNotes: general.paymentPolicyNotes.trim(),
      })
      toast.success('Organization settings saved')
      await refreshSession()
      setReload((current) => current + 1)
      refetch({ quiet: true })
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setGeneralWorking(false)
    }
  }

  const minOf = (index) => {
    if (index === 0) return 0
    return paise(commission.rules[index - 1]?.max)
  }

  const updateBand = (index, field, value) => {
    setCommission((current) => ({
      ...current,
      rules: current.rules.map((rule, ruleIndex) => (ruleIndex === index ? { ...rule, [field]: value } : rule)),
    }))
  }

  const addBand = () => {
    const rules = commission.rules
    if (!rules.length) {
      setCommission((current) => ({ ...current, rules: [{ max: '', rate: '10' }] }))
      return
    }
    const last = rules[rules.length - 1]
    const lastMinRupees = Number(rules[rules.length - 2]?.max || 0)
    setCommission((current) => ({
      ...current,
      rules: [
        ...current.rules.slice(0, -1),
        { ...last, max: String(lastMinRupees + 50000) },
        { max: '', rate: last.rate },
      ],
    }))
  }

  const removeBand = (index) => {
    setCommission((current) => {
      if (current.rules.length <= 1) return current
      const rules = [...current.rules]
      if (index === rules.length - 1) {
        const previous = { ...rules[index - 1], max: '' }
        rules.splice(index - 1, 2, previous)
      } else if (index === 0) {
        rules.splice(0, 1)
      } else {
        rules[index - 1] = { ...rules[index - 1], max: rules[index].max }
        rules.splice(index, 1)
      }
      return { ...current, rules }
    })
  }

  const rulesValid = useMemo(() => {
    if (!commission.rules.length) return false
    for (let index = 0; index < commission.rules.length; index += 1) {
      const rule = commission.rules[index]
      const rate = Number(rule.rate)
      if (!Number.isFinite(rate) || rate < 0 || rate > 100) return false
      if (index < commission.rules.length - 1) {
        if (!rule.max || Number(rule.max) <= 0) return false
        if (index > 0 && Number(rule.max) <= Number(commission.rules[index - 1].max)) return false
      }
    }
    return true
  }, [commission.rules])

  const saveCommission = async (event) => {
    event.preventDefault()
    if (!rulesValid) {
      toast.error('Each band needs a valid maximum and a continuous range.')
      return
    }
    setCommissionWorking(true)
    try {
      const payload = {
        commissionBasis: commission.basis,
        approvalRequired: commission.approvalRequired,
        paymentPolicyNotes: commission.notes.trim(),
        commissionRules: commission.rules.map((rule, index) => ({
          minPaise: minOf(index),
          maxPaise: index === commission.rules.length - 1 ? null : paise(rule.max),
          ratePercent: Number(rule.rate),
        })),
      }
      await api.put('/organizations/current/commission-rules', payload)
      toast.success('Commission rules saved. Existing deals keep their captured rate.')
      setReload((current) => current + 1)
      refetch({ quiet: true })
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setCommissionWorking(false)
    }
  }

  if (loading && !data) return <PageSkeleton />
  if (error && !data) return <ErrorState error={error} onRetry={refetch} />

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Organization identity, commission policy and the immutable audit trail."
      />

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-app bg-[var(--surface-2)] p-1 scrollbar-none">
        {TABS.filter((item) => item.id !== 'audit' || isOwner).map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[10.5px] font-medium transition ${
                tab === item.id ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-muted hover:text-[var(--text)]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {item.label}
            </button>
          )
        })}
      </div>

      {!isOwner && (
        <div className="flex items-start gap-2 rounded-xl border border-[var(--warning)]/20 bg-[var(--warning-soft)] px-4 py-3 text-[11px] text-[var(--warning)]">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>Only the organization owner can change company or commission settings. You can review the current configuration here.</p>
        </div>
      )}

      {tab === 'general' && (
        <form onSubmit={saveGeneral} className="panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[13px] font-semibold">Organization profile</h2>
              <p className="mt-0.5 text-[10.5px] text-muted">Shown across the workspace, invitations and exports.</p>
            </div>
            <Badge className="badge-accent">{titleCase(activeOrganization?.role || 'member')}</Badge>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="orgName">Organization name *</label>
              <input id="orgName" className="input" value={general.name} onChange={(event) => setGeneral((current) => ({ ...current, name: event.target.value }))} disabled={!isOwner} required minLength={2} maxLength={100} />
            </div>
            <div>
              <label className="label" htmlFor="orgSlug">Workspace slug</label>
              <input id="orgSlug" className="input opacity-70" value={organization?.slug || ''} readOnly disabled />
            </div>
            <div>
              <label className="label" htmlFor="orgTimezone">Timezone</label>
              <select id="orgTimezone" className="input" value={general.timezone} onChange={(event) => setGeneral((current) => ({ ...current, timezone: event.target.value }))} disabled={!isOwner}>
                {TIMEZONES.map((zone) => <option key={zone} value={zone}>{zone.replace('_', ' ')}</option>)}
                {!TIMEZONES.includes(general.timezone) && <option value={general.timezone}>{general.timezone}</option>}
              </select>
              <p className="mt-1.5 text-[9.5px] text-subtle">Today/overdue boundaries and report days use this timezone.</p>
            </div>
            <div>
              <label className="label" htmlFor="orgCurrency">Settlement currency</label>
              <input id="orgCurrency" className="input opacity-70" value="INR — Indian Rupee" readOnly disabled />
              <p className="mt-1.5 text-[9.5px] text-subtle">LeadPilot stores all amounts in integer paise.</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="label" htmlFor="orgPolicy">Payment policy notes</label>
            <textarea id="orgPolicy" className="input" rows={4} value={general.paymentPolicyNotes} onChange={(event) => setGeneral((current) => ({ ...current, paymentPolicyNotes: event.target.value }))} disabled={!isOwner} maxLength={1000} />
            <p className="mt-1.5 text-[9.5px] text-subtle">Visible to the whole team on the commissions page.</p>
          </div>
          {isOwner && (
            <div className="mt-5 flex justify-end border-t border-app pt-4">
              <button type="submit" className="btn btn-primary" disabled={generalWorking || general.name.trim().length < 2}>
                {generalWorking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {generalWorking ? 'Saving…' : 'Save organization'}
              </button>
            </div>
          )}
        </form>
      )}

      {tab === 'commission' && (
        <form onSubmit={saveCommission} className="space-y-4">
          <div className="panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[13px] font-semibold">Commission policy</h2>
                <p className="mt-0.5 text-[10.5px] text-muted">Rules are captured on each new deal. Editing them never changes existing deals.</p>
              </div>
              <Badge className="badge-accent">Owner controlled</Badge>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="commissionBasis">Commission basis</label>
                <select id="commissionBasis" className="input" value={commission.basis} onChange={(event) => setCommission((current) => ({ ...current, basis: event.target.value }))} disabled={!isOwner}>
                  <option value="deal_value">Deal value — releases proportionally with payments</option>
                  <option value="payments_received">Payments received — releases as cash arrives</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-app px-3.5 py-2.5 ${isOwner ? '' : 'cursor-not-allowed opacity-60'}`}>
                  <span>
                    <span className="block text-[10.5px] font-medium">Approval required</span>
                    <span className="block text-[9.5px] text-subtle">Owner must approve before payout</span>
                  </span>
                  <input type="checkbox" checked={commission.approvalRequired} onChange={(event) => setCommission((current) => ({ ...current, approvalRequired: event.target.checked }))} disabled={!isOwner} />
                </label>
              </div>
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-app px-5 py-3.5">
              <div>
                <h2 className="text-[12px] font-semibold">Commission bands</h2>
                <p className="mt-0.5 text-[9.5px] text-subtle">Continuous bands start at zero. The final band is always open-ended.</p>
              </div>
              {isOwner && (
                <button type="button" className="btn btn-secondary h-8 px-2.5 text-[10px]" onClick={addBand}>
                  <Plus className="h-3 w-3" /> Add band
                </button>
              )}
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Band</th><th>From</th><th>Up to</th><th>Rate</th>{isOwner && <th className="text-right">Remove</th>}</tr>
                </thead>
                <tbody>
                  {commission.rules.map((rule, index) => (
                    <tr key={index}>
                      <td className="font-medium">Band {index + 1}</td>
                      <td className="text-muted">₹{(minOf(index) / 100).toLocaleString('en-IN')}</td>
                      <td>
                        {index === commission.rules.length - 1 ? (
                          <span className="text-[10px] text-muted">No limit</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-subtle">₹</span>
                            <input type="number" min="1" step="1" className="input h-8 max-w-[140px]" value={rule.max} onChange={(event) => updateBand(index, 'max', event.target.value)} disabled={!isOwner} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <input type="number" min="0" max="100" step="0.01" className="input h-8 max-w-[90px]" value={rule.rate} onChange={(event) => updateBand(index, 'rate', event.target.value)} disabled={!isOwner} />
                          <span className="text-[10px] text-subtle">%</span>
                        </div>
                      </td>
                      {isOwner && (
                        <td>
                          <div className="flex justify-end">
                            <button type="button" className="icon-button h-7 w-7" onClick={() => removeBand(index)} disabled={commission.rules.length <= 1} title="Remove band">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel p-5">
            <label className="label" htmlFor="commissionNotes">Policy notes</label>
            <textarea id="commissionNotes" className="input" rows={3} value={commission.notes} onChange={(event) => setCommission((current) => ({ ...current, notes: event.target.value }))} disabled={!isOwner} maxLength={1000} />
            <div className="mt-3 flex items-start gap-2 text-[10px] text-muted">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
              <p>Commission is calculated as a percentage of the deal amount. Earned commission grows as payments are recorded, and payouts cannot exceed approved commission.</p>
            </div>
            {isOwner && (
              <div className="mt-4 flex justify-end border-t border-app pt-4">
                <button type="submit" className="btn btn-primary" disabled={commissionWorking || !rulesValid}>
                  {commissionWorking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {commissionWorking ? 'Saving…' : 'Save commission rules'}
                </button>
              </div>
            )}
          </div>
        </form>
      )}

      {tab === 'audit' && isOwner && (
        <div className="table-wrap">
          {audit.loading && !audit.data ? (
            <PageSkeleton />
          ) : audit.error && !audit.data ? (
            <ErrorState error={audit.error} onRetry={audit.refetch} />
          ) : (
            <>
              <div className="border-b border-app px-4 py-3">
                <h2 className="text-[12px] font-semibold">Audit log</h2>
                <p className="mt-0.5 text-[9.5px] text-subtle">Immutable record of sensitive changes. Click a row to inspect before/after values.</p>
              </div>
              <table className="data-table">
                <thead><tr><th>Action</th><th>Entity</th><th>Actor</th><th>When</th></tr></thead>
                <tbody>
                  {audit.data?.items?.length ? audit.data.items.map((log) => (
                    <Fragment key={log._id}>
                      <tr className="cursor-pointer" onClick={() => setExpanded((current) => (current === log._id ? null : log._id))}>
                        <td className="font-semibold">{titleCase(log.action)}</td>
                        <td className="text-muted">{log.entityType || '—'}</td>
                        <td>{log.actor?.name || 'System'}</td>
                        <td className="text-muted">{formatDateTime(log.createdAt)}</td>
                      </tr>
                      {expanded === log._id && (
                        <tr key={`${log._id}-detail`}>
                          <td colSpan={4} className="bg-[var(--surface-2)]">
                            <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-[9.5px] leading-relaxed text-muted">
                              {JSON.stringify({ before: log.before, after: log.after, metadata: log.metadata }, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )) : (
                    <tr><td colSpan={4} className="py-10 text-center text-[10.5px] text-subtle">No audit entries yet.</td></tr>
                  )}
                </tbody>
              </table>
              <Pagination page={auditPage} limit={20} total={audit.data?.total || 0} onPageChange={setAuditPage} />
            </>
          )}
        </div>
      )}
    </div>
  )
}

