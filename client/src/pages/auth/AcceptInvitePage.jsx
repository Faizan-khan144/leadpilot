import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ArrowRight, Loader2, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Field } from '../../components/PageHeader'
import { PasswordField } from '../../components/PasswordField'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { AuthHeading } from './AuthLayout'

const schema = z.object({
  name: z.string().trim().optional(),
  password: z.string().min(1, 'Password is required'),
})

export const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [serverError, setServerError] = useState('')
  const { setSession } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { name: '', password: '' } })

  useEffect(() => {
    if (!token) {
      setLoadError('This invitation link is missing its token.')
      setLoading(false)
      return
    }
    let active = true
    api
      .get(`/auth/invitations/${token}`)
      .then((data) => {
        if (active) setPreview(data)
      })
      .catch((error) => {
        if (active) setLoadError(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token])

  const onSubmit = async (values) => {
    setServerError('')
    try {
      const session = await api.post('/auth/accept-invite', {
        token,
        password: values.password,
        ...(preview?.hasAccount ? {} : { name: values.name || preview?.email?.split('@')[0] }),
      })
      setSession(session)
      toast.success(`Joined ${preview.organization.name}`)
      navigate('/', { replace: true })
    } catch (error) {
      setServerError(error.message)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-7 w-52" />
        <div className="skeleton h-4 w-72" />
        <div className="skeleton h-32 w-full" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div>
        <AuthHeading title="Invitation unavailable" description="The link may be expired or already used." />
        <div className="flex gap-2.5 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] p-3 text-[11.5px] text-[var(--danger)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {loadError}
        </div>
        <a href="/login" className="btn btn-secondary mt-5 w-full">
          Go to sign in
        </a>
      </div>
    )
  }

  return (
    <div>
      <AuthHeading
        eyebrow="Team invitation"
        title={`Join ${preview.organization.name}`}
        description={`You have been invited as ${preview.role.replace('_', ' ')}. Unlock the shared pipeline and start collaborating.`}
      />

      <div className="mb-5 flex items-center gap-3 rounded-xl border border-app bg-surface-2 p-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--accent-soft)] text-orange-500">
          <Mail className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] font-semibold">{preview.organization.name}</p>
          <p className="text-[10.5px] text-muted">{preview.email}</p>
        </div>
      </div>

      {serverError && (
        <div className="mb-4 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-3.5 py-2.5 text-[11.5px] text-[var(--danger)]">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {!preview.hasAccount && (
          <Field label="Your name" htmlFor="name" error={errors.name?.message}>
            <input id="name" className="input" placeholder="Your full name" autoComplete="name" {...register('name')} />
          </Field>
        )}
        <Field
          label={preview.hasAccount ? 'Existing account password' : 'Create a password'}
          htmlFor="password"
          error={errors.password?.message}
          hint={
            preview.hasAccount
              ? 'This email already has a LeadPilot account. Enter its password to accept.'
              : 'At least 8 characters.'
          }
        >
          <PasswordField
            id="password"
            registration={register('password')}
            autoComplete={preview.hasAccount ? 'current-password' : 'new-password'}
          />
        </Field>
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isSubmitting ? 'Joining…' : `Join ${preview.organization.name}`}
          {!isSubmitting && <ArrowRight className="h-3.5 w-3.5" />}
        </button>
      </form>
    </div>
  )
}
