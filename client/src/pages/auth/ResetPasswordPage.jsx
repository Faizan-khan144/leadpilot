import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Field } from '../../components/PageHeader'
import { PasswordField } from '../../components/PasswordField'
import { api } from '../../lib/api'
import { AuthHeading } from './AuthLayout'

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Za-z]/, 'Include a letter')
      .regex(/\d/, 'Include a number'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async ({ password }) => {
    setServerError('')
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
    } catch (error) {
      setServerError(error.message)
    }
  }

  if (!token) {
    return (
      <div>
        <AuthHeading title="Reset link is missing" description="Open the complete link from your email." />
        <Link to="/forgot-password" className="btn btn-secondary w-full">
          Request a new link
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/login"
        className="mb-7 inline-flex items-center gap-1.5 text-[11px] font-medium text-muted transition hover:text-[var(--text)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
      </Link>
      <AuthHeading
        eyebrow="Choose a new password"
        title={done ? 'Password updated' : 'Secure your account'}
        description={
          done
            ? 'Your password has been changed. Sign in with your new credentials.'
            : 'Use a password you do not reuse anywhere else.'
        }
      />

      {done ? (
        <div className="space-y-5 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--success)]" strokeWidth={1.4} />
          <Link to="/login" className="btn btn-primary w-full">
            Continue to sign in
          </Link>
        </div>
      ) : (
        <>
          {serverError && (
            <div className="mb-4 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-3.5 py-2.5 text-[11.5px] text-[var(--danger)]">
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Field label="New password" htmlFor="password" error={errors.password?.message}>
              <PasswordField id="password" registration={register('password')} autoComplete="new-password" />
            </Field>
            <Field
              label="Confirm new password"
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
            >
              <PasswordField
                id="confirmPassword"
                registration={register('confirmPassword')}
                autoComplete="new-password"
              />
            </Field>
            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isSubmitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
