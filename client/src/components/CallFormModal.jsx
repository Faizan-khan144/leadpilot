import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { CALL_OUTCOMES } from '../lib/constants'
import { Field } from './PageHeader'
import { Modal } from './Modal'

const schema = z.object({
  lead: z.string().min(1, 'Choose a lead'),
  outcome: z.enum(CALL_OUTCOMES),
  durationMinutes: z.coerce.number().min(0).max(1440).optional(),
  notes: z.string().max(3000).optional(),
  nextAction: z.string().max(500).optional(),
  followUpAt: z.string().optional(),
})

export const CallFormModal = ({ open, onClose, lead = null, onSaved }) => {
  const [serverError, setServerError] = useState('')
  const { data: leadData } = useApi(open && !lead ? '/leads' : null, { limit: 100, sort: 'businessName' })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      lead: lead?._id || '',
      outcome: 'Interested',
      durationMinutes: '',
      notes: '',
      nextAction: '',
      followUpAt: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        lead: lead?._id || '',
        outcome: 'Interested',
        durationMinutes: '',
        notes: '',
        nextAction: '',
        followUpAt: '',
      })
      setServerError('')
    }
  }, [open, lead, reset])

  const onSubmit = async (values) => {
    setServerError('')
    try {
      const result = await api.post('/calls', {
        lead: values.lead,
        outcome: values.outcome,
        durationSeconds: values.durationMinutes ? Math.round(Number(values.durationMinutes) * 60) : null,
        notes: values.notes || '',
        nextAction: values.nextAction || '',
        followUpAt: values.followUpAt ? new Date(values.followUpAt).toISOString() : null,
        calledAt: new Date().toISOString(),
      })
      toast.success('Call logged')
      onSaved?.(result)
      onClose()
    } catch (error) {
      setServerError(error.message)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log a call"
      description="Record the outcome and set the next action while it is fresh."
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button type="submit" form="call-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isSubmitting ? 'Saving…' : 'Save call'}
          </button>
        </>
      }
    >
      <form id="call-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-3.5 py-2.5 text-[11.5px] text-[var(--danger)]">{serverError}</div>
        )}
        {lead ? (
          <div className="rounded-xl border border-app bg-surface-2 p-3">
            <p className="text-[9.5px] uppercase tracking-[0.06em] text-subtle">Calling</p>
            <p className="mt-1 text-[12px] font-semibold">{lead.businessName}</p>
            <p className="text-[10.5px] text-muted">{lead.contactPerson || lead.phone || lead.email}</p>
          </div>
        ) : (
          <Field label="Lead *" htmlFor="lead" error={errors.lead?.message}>
            <select id="lead" className="input" {...register('lead')}>
              <option value="">Choose a lead</option>
              {leadData?.items?.map((item) => (
                <option key={item._id} value={item._id}>{item.businessName} · {item.status}</option>
              ))}
            </select>
          </Field>
        )}
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Outcome *" htmlFor="outcome" error={errors.outcome?.message}>
            <select id="outcome" className="input" {...register('outcome')}>
              {CALL_OUTCOMES.map((outcome) => <option key={outcome} value={outcome}>{outcome}</option>)}
            </select>
          </Field>
          <Field label="Duration (minutes)" htmlFor="durationMinutes" error={errors.durationMinutes?.message}>
            <input id="durationMinutes" type="number" min="0" step="1" className="input" placeholder="e.g. 8" {...register('durationMinutes')} />
          </Field>
        </div>
        <Field label="Call notes" htmlFor="notes" error={errors.notes?.message}>
          <textarea id="notes" className="input" rows={3} placeholder="What did they say? What matters to them?" {...register('notes')} />
        </Field>
        <Field label="Next action" htmlFor="nextAction" error={errors.nextAction?.message}>
          <input id="nextAction" className="input" placeholder="Send pricing, call back Friday…" {...register('nextAction')} />
        </Field>
        <Field label="Schedule next follow-up" htmlFor="followUpAt" error={errors.followUpAt?.message} hint="A reminder is created automatically and appears in Follow-ups.">
          <input id="followUpAt" type="datetime-local" className="input" {...register('followUpAt')} />
        </Field>
      </form>
    </Modal>
  )
}
