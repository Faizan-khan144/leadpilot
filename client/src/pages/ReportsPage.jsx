import { useMemo, useState } from 'react'
import { BarChart3, Download, RefreshCw, TrendingUp, Users } from 'lucide-react'
import { PageHeader, Stat } from '../components/PageHeader'
import { RevenueChart } from '../components/Charts'
import { ErrorState, PageSkeleton } from '../components/States'
import { DealStatusBadge } from '../components/StatusBadges'
import { useApi } from '../hooks/useApi'
import { formatMoney, formatNumber, downloadBlob, titleCase } from '../lib/utils'

const isoDay = (date) => date.toISOString().slice(0, 10)
const daysAgo = (days) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return isoDay(date)
}

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

export const ReportsPage = () => {
  const [from, setFrom] = useState(daysAgo(29))
  const [to, setTo] = useState(isoDay(new Date()))
  const [reload, setReload] = useState(0)
  const query = useMemo(() => ({ from, to }), [from, to])
  const { data, loading, error, refetch } = useApi('/analytics/reports', query, [reload])

  const download = () => {
    if (!data) return
    const rows = []
    rows.push(['LeadPilot report', `${from} to ${to}`])
    rows.push([])
    rows.push(['Leads by source'])
    rows.push(['Source', 'Count'])
    data.leadsBySource.forEach((item) => rows.push([item.source, item.count]))
    rows.push([])
    rows.push(['Leads by status'])
    rows.push(['Status', 'Count'])
    data.leadsByStatus.forEach((item) => rows.push([item.status, item.count]))
    rows.push([])
    rows.push(['Deals won / lost'])
    rows.push(['Status', 'Count', 'Amount'])
    data.dealsWonLost.forEach((item) => rows.push([titleCase(item.status), item.count, (item.amountPaise / 100).toFixed(2)]))
    rows.push([])
    rows.push(['Calls by member'])
    rows.push(['Member', 'Email', 'Calls', 'Interested', 'Meetings'])
    data.callsByMember.forEach((item) => rows.push([item.name, item.email, item.calls, item.interested, item.meetings]))
    rows.push([])
    rows.push(['Commissions'])
    rows.push(['Member', 'Calculated', 'Earned', 'Approved', 'Paid'])
    data.commissions.forEach((item) => rows.push([
      item.name,
      (item.calculatedCommissionPaise / 100).toFixed(2),
      (item.earnedCommissionPaise / 100).toFixed(2),
      (item.approvedCommissionPaise / 100).toFixed(2),
      (item.paidCommissionPaise / 100).toFixed(2),
    ]))
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `leadpilot-report-${from}-to-${to}.csv`)
  }

  const callsTotal = data?.callsByMember?.reduce((sum, item) => sum + item.calls, 0) || 0
  const interestedTotal = data?.callsByMember?.reduce((sum, item) => sum + item.interested, 0) || 0
  const revenueTotal = data?.revenueOverTime?.reduce((sum, item) => sum + item.amountPaise, 0) || 0
  const won = data?.dealsWonLost?.find((item) => item.status === 'won')
  const lost = data?.dealsWonLost?.find((item) => item.status === 'lost')
  const maxSource = Math.max(1, ...(data?.leadsBySource?.map((item) => item.count) || [1]))
  const maxStatus = Math.max(1, ...(data?.leadsByStatus?.map((item) => item.count) || [1]))
  const maxCalls = Math.max(1, ...(data?.callsByMember?.map((item) => item.calls) || [1]))

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Business intelligence"
        title="Reports"
        description="Acquisition, conversion, outreach and commission performance for the selected period."
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => refetch()} title="Refresh report">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button type="button" className="btn btn-primary" onClick={download} disabled={!data}>
              <Download className="h-3.5 w-3.5" /> Download CSV
            </button>
          </>
        }
      />

      <div className="panel flex flex-col gap-2 p-3 sm:flex-row sm:items-end">
        <div>
          <label className="label" htmlFor="reportFrom">From</label>
          <input id="reportFrom" type="date" className="input" value={from} max={to} onChange={(event) => setFrom(event.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="reportTo">To</label>
          <input id="reportTo" type="date" className="input" value={to} min={from} max={isoDay(new Date())} onChange={(event) => setTo(event.target.value)} />
        </div>
        <div className="flex gap-1.5 sm:ml-2">
          {[
            { label: '7 days', days: 6 },
            { label: '30 days', days: 29 },
            { label: '90 days', days: 89 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="rounded-md border border-app px-2.5 py-2 text-[9.5px] text-muted transition hover:border-[var(--border-strong)] hover:text-[var(--text)]"
              onClick={() => {
                setFrom(daysAgo(preset.days))
                setTo(isoDay(new Date()))
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <PageSkeleton />
      ) : error && !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Calls made" value={formatNumber(callsTotal)} hint={`${formatNumber(interestedTotal)} interested outcomes`} icon={Users} tone="accent" />
            <Stat label="Revenue collected" value={formatMoney(revenueTotal, { compact: true })} hint="Recorded payments in range" icon={TrendingUp} tone="success" />
            <Stat label="Deals won" value={formatNumber(won?.count || 0)} hint={formatMoney(won?.amountPaise || 0, { compact: true })} icon={BarChart3} tone="success" />
            <Stat label="Deals lost" value={formatNumber(lost?.count || 0)} hint={formatMoney(lost?.amountPaise || 0, { compact: true })} icon={BarChart3} tone="danger" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="panel p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[12px] font-semibold">Revenue over time</h2>
                  <p className="mt-0.5 text-[9.5px] text-subtle">Payments received, by day</p>
                </div>
                <span className="text-[10px] font-semibold">{formatMoney(revenueTotal, { compact: true })}</span>
              </div>
              <div className="mt-4">
                <RevenueChart data={data?.revenueOverTime || []} />
              </div>
            </div>

            <div className="panel p-4">
              <h2 className="text-[12px] font-semibold">Outcome split</h2>
              <p className="mt-0.5 text-[9.5px] text-subtle">Closed deals in this period</p>
              <div className="mt-4 space-y-4">
                {data?.dealsWonLost?.map((item) => {
                  const total = (won?.count || 0) + (lost?.count || 0)
                  const percent = total ? Math.round((item.count / total) * 100) : 0
                  return (
                    <div key={item.status}>
                      <div className="flex items-center justify-between gap-2">
                        <DealStatusBadge status={item.status} />
                        <span className="text-[10px] font-semibold">{item.count} · {percent}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                        <div className={`h-full rounded-full ${item.status === 'won' ? 'bg-emerald-500' : 'bg-red-400'}`} style={{ width: `${percent}%` }} />
                      </div>
                      <p className="mt-1 text-[9.5px] text-subtle">{formatMoney(item.amountPaise)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="panel p-4">
              <h2 className="text-[12px] font-semibold">Leads by source</h2>
              <div className="mt-4 space-y-3">
                {data?.leadsBySource?.length ? data.leadsBySource.map((item) => (
                  <div key={item.source}>
                    <div className="flex justify-between text-[10px]"><span className="text-muted">{item.source}</span><span className="font-semibold">{item.count}</span></div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                      <div className="h-full rounded-full bg-orange-500" style={{ width: `${(item.count / maxSource) * 100}%` }} />
                    </div>
                  </div>
                )) : <p className="text-[10.5px] text-subtle">No leads in this period.</p>}
              </div>
            </div>

            <div className="panel p-4">
              <h2 className="text-[12px] font-semibold">Pipeline distribution</h2>
              <div className="mt-4 space-y-3">
                {data?.leadsByStatus?.map((item) => (
                  <div key={item.status}>
                    <div className="flex justify-between text-[10px]"><span className="text-muted">{item.status}</span><span className="font-semibold">{item.count}</span></div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                      <div className="h-full rounded-full bg-fuchsia-500" style={{ width: `${(item.count / maxStatus) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="table-wrap">
              <div className="border-b border-app px-4 py-3">
                <h2 className="text-[12px] font-semibold">Outreach by teammate</h2>
              </div>
              <table className="data-table">
                <thead><tr><th>Member</th><th>Calls</th><th>Interested</th><th>Meetings</th></tr></thead>
                <tbody>
                  {data?.callsByMember?.length ? data.callsByMember.map((item) => (
                    <tr key={item.userId}>
                      <td><p className="font-semibold">{item.name}</p><p className="text-[9.5px] text-subtle">{item.email}</p></td>
                      <td>
                        <p>{item.calls}</p>
                        <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-[var(--surface-3)]"><div className="h-full bg-orange-500" style={{ width: `${(item.calls / maxCalls) * 100}%` }} /></div>
                      </td>
                      <td>{item.interested}</td>
                      <td>{item.meetings}</td>
                    </tr>
                  )) : <tr><td colSpan={4} className="py-8 text-center text-[10.5px] text-subtle">No call activity.</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="table-wrap">
              <div className="border-b border-app px-4 py-3">
                <h2 className="text-[12px] font-semibold">Commission summary</h2>
              </div>
              <table className="data-table">
                <thead><tr><th>Member</th><th>Calculated</th><th>Earned</th><th>Approved</th><th>Paid</th></tr></thead>
                <tbody>
                  {data?.commissions?.length ? data.commissions.map((item) => (
                    <tr key={item.userId}>
                      <td><p className="font-semibold">{item.name}</p><p className="text-[9.5px] text-subtle">{item.email}</p></td>
                      <td>{formatMoney(item.calculatedCommissionPaise, { compact: true })}</td>
                      <td className="font-medium text-orange-500">{formatMoney(item.earnedCommissionPaise, { compact: true })}</td>
                      <td>{formatMoney(item.approvedCommissionPaise, { compact: true })}</td>
                      <td>{formatMoney(item.paidCommissionPaise, { compact: true })}</td>
                    </tr>
                  )) : <tr><td colSpan={5} className="py-8 text-center text-[10.5px] text-subtle">No commissions.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
