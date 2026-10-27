import { Badge } from './Badge'
import {
  commissionStatusTone,
  dealStatusTone,
  leadStatusTone,
  priorityTone,
  titleCase,
} from '../lib/utils'

export const LeadStatusBadge = ({ status }) => (
  <Badge className={leadStatusTone[status] || 'badge-muted'}>{status}</Badge>
)

export const DealStatusBadge = ({ status }) => (
  <Badge className={dealStatusTone[status] || 'badge-muted'}>{titleCase(status)}</Badge>
)

export const PriorityBadge = ({ priority }) => (
  <Badge className={priorityTone[priority] || 'badge-muted'}>{titleCase(priority)}</Badge>
)

export const CommissionStatusBadge = ({ status }) => (
  <Badge className={commissionStatusTone[status] || 'badge-muted'}>
    {titleCase(status)}
  </Badge>
)
