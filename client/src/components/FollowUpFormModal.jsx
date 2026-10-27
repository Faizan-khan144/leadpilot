import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { useMembers } from '../hooks/useMembers'
import { api } from '../lib/api'
import { PRIORITIES } from '../lib/constants'
import { Field } from './PageHeader'
import { Modal } from './Modal'

const schema = z.object({
  lead: z.string().min(1, 'Choose a lead'),
  assignedTo: z.string().min(1, 'Choose an owner'),
  type: z.enum(['follow_up', 'meeting']),
  dueAt: z.string().min(1, 'Choose a date and time'),
  priority: z.enum(PRIORITIES),
  notes: z.string().max(3000).optional(),
})

export const FollowUpFormModal = ({ open, onClose, lead = null, onSaved }) => {
  const { user, isPrivileged } = useAuth()
  const { members } = useMembers()
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
      assignedTo: user.id,
      type: 'follow_up',
      dueAt: '',
      priority: lead?.priority || 'medium',
      notes: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        lead: lead?._id || '',
        assignedTo: lead?.assignedTo?._id || lead?.assignedTo || user.id,
        type: 'follow_up',
        dueAt: '',
        priority: lead?.priority || 'medium',
        notes: '',
      })
      setServerError('')
    }
  }, [open, lead, user.id, reset])

  const onSubmit = async (values) => {
    setServerError('')
    try {
      const result = await api.post('/follow-ups', {
        ...values,
        dueAt: new Date(values.dueAt).toISOString(),
        meetingAt: values.type === 'meeting' ? new Date(values.dueAt).toISOString() : null,
        notes: values.notes || '',
      })
      toast.success(values.type === 'meeting' ? 'Meeting scheduled' : 'Follow-up scheduled')
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
      title="Schedule a follow-up"
      description="Create a reminder or meeting so the next step does not slip."
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button type="submit" form="follow-up-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isSubmitting ? 'Scheduling…' : 'Schedule'}
          </button>
        </>
      }
    >
      <form id="follow-up-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-3.5 py-2.5 text-[11.5px] text-[var(--danger)]">{serverError}</div>
        )}
        {lead ? (
          <div className="rounded-xl border border-app bg-surface-2 p-3">
            <p className="text-[9.5px] uppercase tracking-[0.06em] text-subtle">Lead</p>
            <p className="mt-1 text-[12px] font-semibold">{lead.businessName}</p>
          </div>
        ) : (
          <Field label="Lead *" htmlFor="lead" error={errors.lead?.message}>
            <select id="lead" className="input" {...register('lead')}>
              <option value="">Choose a lead</option>
              {leadData?.items?.map((item) => <option key={item._id} value={item._id}>{item.businessName}</option>)}
            </select>
          </Field>
        )}
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Type" htmlFor="type" error={errors.type?.message}>
            <select id="type" className="input" {...register('type')}>
              <option value="follow_up">Follow-up</option>
              <option value="meeting">Meeting</option>
            </select>
          </Field>
          <Field label="Priority" htmlFor="priority" error={errors.priority?.message}>
            <select id="priority" className="input capitalize" {...register('priority')}>
              {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
          </Field>
          <Field label="Date & time *" htmlFor="dueAt" error={errors.dueAt?.message}>
            <input id="dueAt" type="datetime-local" className="input" {...register('dueAt')} />
          </Field>
          <Field label="Owner" htmlFor="assignedTo" error={errors.assignedTo?.message}>
            <select id="assignedTo" className="input" {...register('assignedTo')} disabled={!isPrivileged}>
              {members.map((membership) => (
                <option key={membership.user?._id} value={membership.user?._id}>{membership.user?.name}</option>
              ))}
              {!members.length && <option value={user.id}>{user.name}</option>}
            </select>
          </Field>
        </div>
        <Field label="Notes" htmlFor="notes" error={errors.notes?.message}>
          <textarea id="notes" className="input" rows={3} placeholder="Agenda, context or what to prepare…" {...register('notes')} />
        </Field>
      </form>
    </Modal>
  )
}
