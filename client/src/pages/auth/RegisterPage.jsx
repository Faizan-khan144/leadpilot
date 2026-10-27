import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Field } from '../../components/PageHeader'
import { PasswordField } from '../../components/PasswordField'
import { useAuth } from '../../context/AuthContext'
import { AuthHeading } from './AuthLayout'

const schema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name'),
    email: z.string().trim().email('Enter a valid email address'),
    organizationName: z.string().trim().min(2, 'Enter your organization name'),
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

export const RegisterPage = () => {
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', organizationName: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async ({ confirmPassword, ...values }) => {
    setServerError('')
    try {
      await createAccount(values)
      toast.success('Workspace created')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setServerError(error.message)
    }
  }

  return (
    <div>
      <AuthHeading
        eyebrow="Start free"
        title="Build your revenue workspace"
        description="Create the organization, invite your team, and bring every lead into one clear pipeline."
      />

      {serverError && (
        <div className="mb-4 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-3.5 py-2.5 text-[11.5px] text-[var(--danger)]">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Your name" htmlFor="name" error={errors.name?.message}>
            <input id="name" className="input h-11 rounded-xl border-orange-100 bg-[#fffaf5] text-[13px]" placeholder="Aarav Mehta" autoComplete="name" {...register('name')} />
          </Field>
          <Field label="Organization" htmlFor="organizationName" error={errors.organizationName?.message}>
            <input
              id="organizationName"
              className="input h-11 rounded-xl border-orange-100 bg-[#fffaf5] text-[13px]"
              placeholder="Northstar Studio"
              autoComplete="organization"
              {...register('organizationName')}
            />
          </Field>
        </div>

        <Field label="Work email" htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            className="input h-11 rounded-xl border-orange-100 bg-[#fffaf5] text-[13px]"
            placeholder="you@company.com"
            autoComplete="email"
            {...register('email')}
          />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password?.message} hint="8+ characters with a letter and a number.">
          <PasswordField id="password" registration={register('password')} autoComplete="new-password" />
        </Field>

        <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <PasswordField
            id="confirmPassword"
            registration={register('confirmPassword')}
            autoComplete="new-password"
          />
        </Field>

        <button type="submit" className="btn btn-primary h-11 w-full rounded-xl text-[12.5px] font-bold" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {isSubmitting ? 'Creating workspace…' : 'Create workspace'}
          {!isSubmitting && <ArrowRight className="h-3.5 w-3.5" />}
        </button>
      </form>

      <p className="mt-6 text-center text-[11.5px] text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700">
          Sign in
        </Link>
      </p>
    </div>
  )
}
