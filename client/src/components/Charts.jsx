import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoney, formatNumber } from '../lib/utils'

const TooltipCard = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-app bg-[var(--surface)] px-3 py-2 shadow-soft">
      <p className="text-[9.5px] text-muted">{label}</p>
      <p className="mt-0.5 text-[11.5px] font-semibold">{payload[0].value} leads</p>
    </div>
  )
}

export const AcquisitionChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={230}>
    <AreaChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
      <defs>
        <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="date"
        tick={{ fill: 'var(--text-subtle)', fontSize: 9 }}
        tickLine={false}
        axisLine={false}
        tickFormatter={(value) => {
          const date = new Date(value)
          return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        }}
        minTickGap={28}
      />
      <YAxis
        tick={{ fill: 'var(--text-subtle)', fontSize: 9 }}
        tickLine={false}
        axisLine={false}
        allowDecimals={false}
      />
      <Tooltip content={<TooltipCard />} cursor={{ stroke: 'var(--border-strong)' }} />
      <Area
        type="monotone"
        dataKey="leads"
        stroke="#f97316"
        strokeWidth={2}
        fill="url(#leadGradient)"
        activeDot={{ r: 4, fill: '#f97316', stroke: 'var(--surface)', strokeWidth: 2 }}
      />
    </AreaChart>
  </ResponsiveContainer>
)

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-app bg-[var(--surface)] px-3 py-2 shadow-soft">
      <p className="text-[9.5px] text-muted">{label}</p>
      <p className="mt-0.5 text-[11.5px] font-semibold">{formatMoney(payload[0].value)}</p>
    </div>
  )
}

export const RevenueChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={250}>
    <AreaChart data={data} margin={{ top: 8, right: 4, left: -10, bottom: 0 }}>
      <defs>
        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity={0.26} />
          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="date"
        tick={{ fill: 'var(--text-subtle)', fontSize: 9 }}
        tickLine={false}
        axisLine={false}
        tickFormatter={(value) => {
          const date = new Date(value)
          return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        }}
        minTickGap={30}
      />
      <YAxis
        tick={{ fill: 'var(--text-subtle)', fontSize: 9 }}
        tickLine={false}
        axisLine={false}
        tickFormatter={(value) => formatMoney(value, { compact: true })}
      />
      <Tooltip content={<RevenueTooltip />} cursor={{ stroke: 'var(--border-strong)' }} />
      <Area
        type="monotone"
        dataKey="amountPaise"
        stroke="#10b981"
        strokeWidth={2}
        fill="url(#revenueGradient)"
        activeDot={{ r: 4, fill: '#10b981', stroke: 'var(--surface)', strokeWidth: 2 }}
      />
    </AreaChart>
  </ResponsiveContainer>
)

export const MiniBar = ({ value = 0, max = 1, color = '#f97316' }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
    <div
      className="dashboard-bar h-full rounded-full transition-all duration-500"
      style={{ width: `${Math.max(4, Math.min(100, (value / Math.max(1, max)) * 100))}%`, background: color }}
    />
  </div>
)
