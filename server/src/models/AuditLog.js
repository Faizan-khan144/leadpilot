import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true, maxlength: 100 },
    entityType: { type: String, required: true, maxlength: 80 },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },
    ip: { type: String, maxlength: 64, default: '' },
    userAgent: { type: String, maxlength: 500, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
)

auditLogSchema.index({ organization: 1, createdAt: -1 })
auditLogSchema.index({ organization: 1, action: 1, createdAt: -1 })
auditLogSchema.index({ organization: 1, entityType: 1, entityId: 1 })

export const AuditLog = mongoose.model('AuditLog', auditLogSchema)
