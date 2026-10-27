import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Field } from '../../components/PageHeader'
import { api } from '../../lib/api'
import { AuthHeading, AuthSuccessNote } from './AuthLayout'

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
})

export const ForgotPasswordPage = () => {
  const [result, setResult] = useState(null)
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  const onSubmit = async (values) => {
    setServerError('')
    try {
      setResult(await api.post('/auth/forgot-password', values))
    } catch (error) {
      setServerError(error.message)
    }
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
        eyebrow="Account recovery"
        title="Reset your password"
        description="Enter your work email and we will send a time-limited reset link."
      />

      {result ? (
        <div className="space-y-4">
          <AuthSuccessNote>
            {result.message}
            {result.devResetToken && (
              <span className="mt-1 block">
                Development mode:{' '}
                <Link
                  className="font-semibold underline"
                  to={`/reset-password?token=${result.devResetToken}`}
                >
                  open the reset link
                </Link>
                .
              </span>
            )}
          </AuthSuccessNote>
          <div className="flex justify-center text-[var(--success)]">
            <MailCheck className="h-10 w-10" strokeWidth={1.4} />
          </div>
        </div>
      ) : (
        <>
          {serverError && (
            <div className="mb-4 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-3.5 py-2.5 text-[11.5px] text-[var(--danger)]">
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Field label="Work email" htmlFor="email" error={errors.email?.message}>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@company.com"
                autoComplete="email"
                {...register('email')}
              />
            </Field>
            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
