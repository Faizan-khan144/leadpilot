import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { useMembers } from '../hooks/useMembers'
import { api } from '../lib/api'
import { LEAD_SOURCES, LEAD_STATUSES, PRIORITIES } from '../lib/constants'
import { toDateTimeLocal } from '../lib/utils'
import { Field } from './PageHeader'
import { Modal } from './Modal'

const schema = z.object({
  businessName: z.string().trim().min(2, 'Business name is required').max(160),
  contactPerson: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z.union([z.string().trim().email('Enter a valid email'), z.literal('')]).optional(),
  website: z.union([z.string().trim().url('Enter a full URL, e.g. https://example.com'), z.literal('')]).optional(),
  industry: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
  source: z.enum(LEAD_SOURCES),
  assignedTo: z.string().optional(),
  estimatedValue: z.coerce.number().min(0, 'Value cannot be negative').optional(),
  status: z.enum(LEAD_STATUSES),
  priority: z.enum(PRIORITIES),
  notes: z.string().max(5000).optional(),
  nextFollowUpAt: z.string().optional(),
})

const toDefaults = (lead) => ({
  businessName: lead?.businessName || '',
  contactPerson: lead?.contactPerson || '',
  phone: lead?.phone || '',
  email: lead?.email || '',
  website: lead?.website || '',
  industry: lead?.industry || '',
  city: lead?.city || '',
  country: lead?.country || 'India',
  source: lead?.source || 'Manual',
  assignedTo: lead?.assignedTo?._id || lead?.assignedTo || '',
  estimatedValue: lead ? Number(lead.estimatedValuePaise || 0) / 100 : '',
  status: lead?.status || 'New Lead',
  priority: lead?.priority || 'medium',
  notes: lead?.notes || '',
  nextFollowUpAt: lead?.nextFollowUpAt ? toDateTimeLocal(lead.nextFollowUpAt) : '',
})

export const LeadFormModal = ({ open, onClose, lead = null, onSaved }) => {
  const { isPrivileged, user } = useAuth()
  const { members } = useMembers()
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: toDefaults(lead) })

  useEffect(() => {
    if (open) {
      reset(toDefaults(lead))
      setServerError('')
    }
  }, [open, lead, reset])

  const onSubmit = async (values) => {
    setServerError('')
    const payload = {
      ...values,
      email: values.email || '',
      website: values.website || '',
      estimatedValuePaise: Math.round(Number(values.estimatedValue || 0) * 100),
      nextFollowUpAt: values.nextFollowUpAt ? new Date(values.nextFollowUpAt).toISOString() : null,
      assignedTo: values.assignedTo || user.id,
    }
    delete payload.estimatedValue
    try {
      const result = lead
        ? await api.patch(`/leads/${lead._id}`, payload)
        : await api.post('/leads', payload)
      toast.success(lead ? 'Lead updated' : 'Lead created')
      onSaved?.(result.lead)
      onClose()
    } catch (error) {
      setServerError(error.message)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lead ? 'Edit lead' : 'Add a new lead'}
      description={
        lead ? 'Update the record without losing its activity history.' : 'Capture the business and the next step.'
      }
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" form="lead-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isSubmitting ? 'Saving…' : lead ? 'Save changes' : 'Create lead'}
          </button>
        </>
      }
    >
      <form id="lead-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-3.5 py-2.5 text-[11.5px] text-[var(--danger)]">
            {serverError}
          </div>
        )}

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Business name *" htmlFor="businessName" error={errors.businessName?.message} className="sm:col-span-2">
            <input id="businessName" className="input" placeholder="Northstar Dental Studio" autoFocus {...register('businessName')} />
          </Field>
          <Field label="Contact person" htmlFor="contactPerson" error={errors.contactPerson?.message}>
            <input id="contactPerson" className="input" placeholder="Priya Sharma" {...register('contactPerson')} />
          </Field>
          <Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <input id="phone" className="input" placeholder="+91 98765 43210" {...register('phone')} />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <input id="email" type="email" className="input" placeholder="priya@business.com" {...register('email')} />
          </Field>
          <Field label="Website" htmlFor="website" error={errors.website?.message}>
            <input id="website" className="input" placeholder="https://business.com" {...register('website')} />
          </Field>
          <Field label="Industry" htmlFor="industry" error={errors.industry?.message}>
            <input id="industry" className="input" placeholder="Healthcare" {...register('industry')} />
          </Field>
          <Field label="City" htmlFor="city" error={errors.city?.message}>
            <input id="city" className="input" placeholder="Mumbai" {...register('city')} />
          </Field>
          <Field label="Country" htmlFor="country" error={errors.country?.message}>
            <input id="country" className="input" placeholder="India" {...register('country')} />
          </Field>
          <Field label="Source" htmlFor="source" error={errors.source?.message}>
            <select id="source" className="input" {...register('source')}>
              {LEAD_SOURCES.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </Field>
          <Field label="Estimated value (₹)" htmlFor="estimatedValue" error={errors.estimatedValue?.message}>
            <input id="estimatedValue" type="number" min="0" step="0.01" className="input" placeholder="0" {...register('estimatedValue')} />
          </Field>
          <Field label="Stage" htmlFor="status" error={errors.status?.message}>
            <select id="status" className="input" {...register('status')}>
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority" htmlFor="priority" error={errors.priority?.message}>
            <select id="priority" className="input capitalize" {...register('priority')}>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </Field>
          {isPrivileged && (
            <Field label="Assigned to" htmlFor="assignedTo" error={errors.assignedTo?.message}>
              <select id="assignedTo" className="input" {...register('assignedTo')}>
                <option value="">Assign to me</option>
                {members.map((membership) => (
                  <option key={membership.user?._id} value={membership.user?._id}>
                    {membership.user?.name} · {membership.role.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Next follow-up" htmlFor="nextFollowUpAt" error={errors.nextFollowUpAt?.message}>
            <input id="nextFollowUpAt" type="datetime-local" className="input" {...register('nextFollowUpAt')} />
          </Field>
          <Field label="Notes" htmlFor="notes" error={errors.notes?.message} className="sm:col-span-2">
            <textarea id="notes" className="input" rows={3} placeholder="Context, pain points, buying signals…" {...register('notes')} />
          </Field>
        </div>
      </form>
    </Modal>
  )
}
