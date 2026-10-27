import { Lead } from '../models/Lead.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { LEAD_STATUSES } from '../config/constants.js'
import { leadScope, isPrivileged } from '../utils/permissions.js'

export const getPipelineBoard = asyncHandler(async (req, res) => {
  const filter = {
    organization: req.organizationId,
    deletedAt: null,
    ...leadScope(req),
  }
  if (req.query.search) {
    const search = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [
      { businessName: search },
      { contactPerson: search },
      { email: search },
      { phone: search },
    ]
  }
  if (req.query.priority) filter.priority = req.query.priority
  if (req.query.source) filter.source = req.query.source
  if (req.query.assignedTo && isPrivileged(req.membership)) {
    filter.assignedTo = req.query.assignedTo
  }

  const leads = await Lead.find(filter)
    .populate('assignedTo', 'name email avatarColor')
    .sort('-createdAt')
    .limit(500)

  const columns = LEAD_STATUSES.map((status) => {
    const items = leads.filter((lead) => lead.status === status)
    return {
      status,
      count: items.length,
      valuePaise: items.reduce((sum, lead) => sum + lead.estimatedValuePaise, 0),
      items,
    }
  })

  res.json({
    columns,
    total: leads.length,
    truncated: leads.length === 500,
  })
})
