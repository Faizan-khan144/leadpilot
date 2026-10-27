import { Activity } from '../models/Activity.js'

export const logActivity = async ({
  organization,
  actor,
  lead = null,
  deal = null,
  type,
  message,
  metadata = {},
}) => {
  if (!organization || !actor) return null
  return Activity.create({
    organization,
    actor,
    lead,
    deal,
    type,
    message,
    metadata,
  })
}
