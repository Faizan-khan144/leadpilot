import { AuditLog } from '../models/AuditLog.js'

export const recordAudit = async ({
  req,
  organization,
  action,
  entityType,
  entityId,
  before = null,
  after = null,
}) => {
  if (!organization) return null
  return AuditLog.create({
    organization,
    actor: req?.user?._id || null,
    action,
    entityType,
    entityId: entityId || null,
    before,
    after,
    ip: req?.ip || null,
    userAgent: req?.get?.('user-agent') || null,
  })
}
