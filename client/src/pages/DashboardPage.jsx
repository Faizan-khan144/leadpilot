import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  PhoneCall,
  Plus,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { AcquisitionChart, MiniBar } from '../components/Charts'
import { PageHeader, Stat } from '../components/PageHeader'
import { Reveal } from '../components/Reveal'
import { PageSkeleton, ErrorState } from '../components/States'
import { LeadStatusBadge, PriorityBadge } from '../components/StatusBadges'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import {
  formatMoney,
  formatNumber,
  formatDate,
  formatDateTime,
  leadStatusTone,
  timeAgo,
} from '../lib/utils'

const rangeOptions = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

const activityIcons = {
  'lead.created': Target,
  'lead.updated': Target,
  'lead.stage_changed': TrendingUp,
  'lead.assigned': Users,
  'lead.imported': UserPlus,
  'lead.deleted': Target,
  'call.logged': PhoneCall,
  'follow_up.created': CalendarClock,
  'follow_up.completed': CheckCircle2,
  'deal.created': CircleDollarSign,
  'deal.updated': CircleDollarSign,
  'deal.won': CheckCircle2,
  'deal.lost': CircleDollarSign,
  'payment.recorded': Wallet,
  'commission.approved': CheckCircle2,
  'commission.paid': Wallet,
  'member.joined': UserPlus,
}

const greeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export const DashboardPage = () => {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const [days, setDays] = useState(30)
  const query = useMemo(() => {
    const to = new Date()
    const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
    return { from: from.toISOString(), to: to.toISOString() }
  }, [days])
  const { data, loading, error, refetch } = useApi('/analytics/dashboard', query)
  const metrics = data?.metrics
  const pipeline = data?.pipeline || []
  const maxPipeline = Math.max(1, ...pipeline.map((stage) => stage.count))

  if (loading && !data) return <PageSkeleton />
  if (error && !data) return <ErrorState error={error} onRetry={refetch} />

  return (
    <div className="dashboard-page space-y-5">
      <Reveal>
        <PageHeader
        eyebrow={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        title={`${greeting()}, ${user.name.split(' ')[0]}`}
        description={
          role === 'lead_generator'
            ? 'Your assigned leads, next conversations and commission progress.'
            : 'A live view of pipeline health, team output and revenue.'
        }
        actions={
          <>
            <div className="flex rounded-lg border border-app bg-[var(--surface)] p-0.5">
              {rangeOptions.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => setDays(option.days)}
                  className={`rounded-md px-2.5 py-1.5 text-[10.5px] font-medium transition ${
                    days === option.days
                      ? 'bg-[var(--surface-3)] text-[var(--text)]'
                      : 'text-muted hover:text-[var(--text)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/leads?new=1')}>
              <Plus className="h-3.5 w-3.5" /> New lead
            </button>
          </>
        }
      />
      </Reveal>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Reveal delay={40}>
          <Stat
            label="Open pipeline"
            value={formatMoney(metrics.openPipelineValuePaise, { compact: true })}
            hint={`${formatNumber(metrics.newLeads)} new in period`}
            icon={Target}
            tone="accent"
          />
        </Reveal>
        <Reveal delay={90}>
          <Stat
            label="Revenue won"
            value={formatMoney(metrics.totalDealValuePaise, { compact: true })}
            hint={`${formatNumber(metrics.dealsWon)} deals closed`}
            icon={TrendingUp}
            tone="success"
          />
        </Reveal>
        <Reveal delay={140}>
          <Stat
            label="Payments received"
            value={formatMoney(metrics.paymentsReceivedPaise, { compact: true })}
            hint={`${formatNumber(metrics.calls)} calls logged`}
            icon={Wallet}
            tone="default"
          />
        </Reveal>
        <Reveal delay={190}>
          <Stat
            label="Lead conversion"
            value={`${metrics.conversionRate}%`}
            hint={`${formatNumber(metrics.totalLeads)} leads in workspace`}
            icon={CheckCircle2}
            tone="warning"
          />
        </Reveal>
      </div>

      <Reveal delay={80}>
      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <section className="panel p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="section-title">Lead acquisition</h2>
              <p className="mt-0.5 text-[10.5px] text-muted">New leads created over the selected period</p>
            </div>
            <span className="badge badge-accent">{formatNumber(metrics.newLeads)} new</span>
          </div>
          <div className="mt-5">
            {data.leadAcquisition.length ? (
              <AcquisitionChart data={data.leadAcquisition} />
            ) : (
              <div className="grid h-[230px] place-items-center text-center">
                <div>
                  <Target className="mx-auto h-6 w-6 text-subtle" />
                  <p className="mt-2 text-[11px] font-medium">No leads in this period</p>
                  <Link to="/leads?new=1" className="mt-1 block text-[10px] text-orange-500">
                    Add your first lead
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="panel p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="section-title">Pipeline snapshot</h2>
              <p className="mt-0.5 text-[10.5px] text-muted">Lead count by current stage</p>
            </div>
            <Link to="/pipeline" className="flex items-center gap-1 text-[10px] font-medium text-orange-500">
              Board <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-5 space-y-3.5">
            {pipeline.map((stage) => (
              <div key={stage.status}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    <p className="text-[10.5px] font-medium">{stage.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] text-subtle">{formatMoney(stage.valuePaise, { compact: true })}</span>
                    <span className="w-5 text-right text-[10px] font-semibold">{stage.count}</span>
                  </div>
                </div>
                <MiniBar value={stage.count} max={maxPipeline} />
              </div>
            ))}
          </div>
        </section>
      </div>
      </Reveal>

      <Reveal delay={140}>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">
            <div>
              <h2 className="section-title">Team leaderboard</h2>
              <p className="mt-0.5 text-[10.5px] text-muted">Based on live activity in the selected period</p>
            </div>
            <Link to="/team" className="text-[10px] font-medium text-orange-500">
              View team
            </Link>
          </div>
          <div className="table-wrap rounded-none border-x-0 border-b-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Calls</th>
                  <th>Meetings</th>
                  <th>Won</th>
                  <th className="text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.leaderboard.length ? (
                  data.leaderboard.map((row) => (
                    <tr key={row.user?._id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar user={row.user} size="xs" />
                          <div>
                            <p className="font-medium">{row.user?.name || 'Former member'}</p>
                            <p className="text-[9.5px] text-subtle capitalize">{row.role.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td>{formatNumber(row.calls)}</td>
                      <td>{formatNumber(row.meetings)}</td>
                      <td>{formatNumber(row.dealsWon)}</td>
                      <td className="text-right font-semibold">{formatMoney(row.revenuePaise, { compact: true })}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-9 text-center text-[11px] text-muted">
                      Team performance appears once activity is logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title">Follow-ups due</h2>
              <p className="mt-0.5 text-[10.5px] text-muted">
                {metrics.followUpsDue} overdue · {formatNumber(metrics.meetingsBooked)} meetings booked
              </p>
            </div>
            <Link to="/follow-ups" className="text-[10px] font-medium text-orange-500">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-2.5">
            {data.upcomingFollowUps.length ? (
              data.upcomingFollowUps.map((followUp) => (
                <Link
                  key={followUp._id}
                  to={`/leads/${followUp.lead?._id}`}
                  className="flex items-start gap-3 rounded-xl border border-app p-3 transition hover:bg-surface-2"
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                      followUp.type === 'meeting'
                        ? 'bg-[var(--accent-soft)] text-orange-500'
                        : 'bg-[var(--warning-soft)] text-[var(--warning)]'
                    }`}
                  >
                    {followUp.type === 'meeting' ? (
                      <CalendarClock className="h-3.5 w-3.5" />
                    ) : (
                      <Clock3 className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold">{followUp.lead?.businessName}</p>
                    <p className="mt-0.5 text-[9.5px] text-muted">{formatDateTime(followUp.dueAt)}</p>
                  </div>
                  <PriorityBadge priority={followUp.priority} />
                </Link>
              ))
            ) : (
              <div className="py-10 text-center">
                <CalendarClock className="mx-auto h-5 w-5 text-subtle" />
                <p className="mt-2 text-[11px] font-medium">No follow-ups scheduled</p>
                <p className="mt-0.5 text-[10px] text-muted">Log a call with a next action to create one.</p>
              </div>
            )}
          </div>
        </section>
      </div>
      </Reveal>

      <Reveal delay={200}>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <section className="panel p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Commission position</h2>
            <Link to="/commissions" className="text-[10px] font-medium text-orange-500">
              Details
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-3 divide-x divide-app rounded-xl border border-app bg-surface-2">
            {[
              ['Earned', metrics.earnedCommissionPaise, 'text-[var(--success)]'],
              ['Pending', metrics.pendingCommissionPaise, 'text-[var(--warning)]'],
              ['Payable', metrics.payableCommissionPaise, 'text-orange-500'],
            ].map(([label, value, color]) => (
              <div key={label} className="p-3.5">
                <p className="text-[9.5px] text-muted">{label}</p>
                <p className={`mt-1 text-[14px] font-bold tracking-[-0.03em] ${color}`}>
                  {formatMoney(value, { compact: true })}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[var(--accent-soft)] p-3 text-[10.5px] leading-relaxed text-muted">
            <CircleDollarSign className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
            Commission rates are captured when each deal is created. New rule changes only affect new deals.
          </div>
        </section>

        <section className="panel p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Recent activity</h2>
            <span className="flex items-center gap-1.5 text-[9.5px] text-subtle">
              <span className="dashboard-live-dot h-1.5 w-1.5 rounded-full bg-orange-500" />
              Live audit stream
            </span>
          </div>
          <div className="mt-3">
            {data.recentActivities.length ? (
              data.recentActivities.slice(0, 6).map((activity) => {
                const Icon = activityIcons[activity.type] || Target
                return (
                  <div key={activity._id} className="flex gap-3 border-b border-app py-2.5 last:border-0">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface-2 text-subtle">
                      <Icon className="h-3 w-3" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10.5px] leading-relaxed">{activity.message}</p>
                      <p className="mt-0.5 text-[9px] text-subtle">
                        {activity.actor?.name || 'System'} · {timeAgo(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="py-9 text-center text-[10.5px] text-muted">No activity yet.</p>
            )}
          </div>
        </section>
      </div>
      </Reveal>
    </div>
  )
}
