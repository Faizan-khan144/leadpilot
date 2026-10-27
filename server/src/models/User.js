import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 160,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    avatarColor: {
      type: String,
      default: '#8b5cf6',
    },
    lastLoginAt: Date,
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpiresAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true, versionKey: false },
)

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('passwordHash')) return next()
  this.passwordHash = await bcrypt.hash(this.passwordHash, env.bcryptRounds)
  return next()
})

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash)
}

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash
    delete ret.passwordResetTokenHash
    delete ret.passwordResetExpiresAt
    return ret
  },
})

export const User = mongoose.model('User', userSchema)
