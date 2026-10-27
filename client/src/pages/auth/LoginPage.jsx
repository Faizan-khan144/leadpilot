import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ArrowRight, Loader2, Lock, ShieldCheck, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Field } from '../../components/PageHeader'
import { PasswordField } from '../../components/PasswordField'
import { useAuth } from '../../context/AuthContext'
import { AuthHeading } from './AuthLayout'

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

export const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '', remember: true } })

  const onSubmit = async (values) => {
    setServerError('')
    try {
      await login(values)
      toast.success('Welcome back')
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (error) {
      setServerError(error.message)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-orange-600 transition hover:text-orange-700 lg:hidden">
          <ArrowRight className="h-3 w-3 rotate-180" /> Back to LeadPilot
        </Link>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.08em] text-orange-700">
          <ShieldCheck className="h-2.5 w-2.5" /> Secure access
        </span>
      </div>

      <AuthHeading
        eyebrow="Welcome back"
        title="Sign in to LeadPilot"
        description="Pick up where your team left off and keep the pipeline moving."
      />

      {serverError && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-red-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Work email" htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            className="input h-11 rounded-xl border-orange-100 bg-[#fffaf5] text-[13px]"
            placeholder="you@company.com"
            {...register('email')}
          />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordField id="password" registration={register('password')} autoComplete="current-password" />
        </Field>

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-[11px] text-slate-500">
            <input type="checkbox" className="h-3.5 w-3.5 rounded border-orange-200 accent-orange-500" {...register('remember')} />
            Keep me signed in
          </label>
          <Link to="/forgot-password" className="text-[11px] font-semibold text-orange-600 transition hover:text-orange-700">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="btn btn-primary h-11 w-full rounded-xl text-[12.5px] font-bold" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {isSubmitting ? 'Signing in…' : 'Sign in'}
          {!isSubmitting && <ArrowRight className="h-3.5 w-3.5" />}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-orange-100" />
        <span className="text-[8.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">New to LeadPilot?</span>
        <span className="h-px flex-1 bg-orange-100" />
      </div>

      <Link
        to="/register"
        className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-white text-[12px] font-bold text-orange-700 transition hover:border-orange-300 hover:bg-orange-50"
      >
        Create your workspace <ArrowRight className="h-3.5 w-3.5" />
      </Link>

      <div className="mt-6 grid grid-cols-3 gap-2 border-t border-orange-100 pt-5">
        {[
          { icon: Lock, text: 'Private session' },
          { icon: ShieldCheck, text: 'Tenant isolated' },
          { icon: Users, text: 'Role aware' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex flex-col items-center gap-1.5 text-center">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-50 text-orange-600"><Icon className="h-3.5 w-3.5" /></span>
            <span className="text-[8.5px] font-medium text-slate-400">{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
