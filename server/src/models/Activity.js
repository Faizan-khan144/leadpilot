import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', default: null },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, maxlength: 60 },
    message: { type: String, required: true, maxlength: 1000 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
)

activitySchema.index({ organization: 1, createdAt: -1 })
activitySchema.index({ organization: 1, lead: 1, createdAt: -1 })
activitySchema.index({ organization: 1, deal: 1, createdAt: -1 })

export const Activity = mongoose.model('Activity', activitySchema)
