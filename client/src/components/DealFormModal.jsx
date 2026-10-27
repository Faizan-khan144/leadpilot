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
import { formatMoney } from '../lib/utils'
import { Field } from './PageHeader'
import { Modal } from './Modal'

const schema = z.object({
  lead: z.string().min(1, 'Choose a lead'),
  amount: z.coerce.number().min(1, 'Enter the deal value'),
  assignedTo: z.string().min(1, 'Choose an owner'),
  proposalDate: z.string().optional(),
  expectedClosingDate: z.string().optional(),
  notes: z.string().max(5000).optional(),
})

export const DealFormModal = ({ open, onClose, lead = null, onSaved }) => {
  const { user, isPrivileged } = useAuth()
  const { members } = useMembers()
  const [serverError, setServerError] = useState('')
  const [preview, setPreview] = useState(null)
  const { data: leadData } = useApi(open && !lead ? '/leads' : null, { limit: 100, sort: 'businessName' })
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      lead: lead?._id || '',
      amount: '',
      assignedTo: lead?.assignedTo?._id || lead?.assignedTo || user.id,
      proposalDate: '',
      expectedClosingDate: '',
      notes: '',
    },
  })
  const amount = watch('amount')

  useEffect(() => {
    if (open) {
      reset({
        lead: lead?._id || '',
        amount: '',
        assignedTo: lead?.assignedTo?._id || lead?.assignedTo || user.id,
        proposalDate: '',
        expectedClosingDate: '',
        notes: '',
      })
      setServerError('')
      setPreview(null)
    }
  }, [open, lead, user.id, reset])

  useEffect(() => {
    const paise = Math.round(Number(amount || 0) * 100)
    if (!open || paise < 1) {
      setPreview(null)
      return
    }
    const timer = setTimeout(() => {
      api
        .get('/commissions/preview', { amountPaise: paise })
        .then(setPreview)
        .catch(() => setPreview(null))
    }, 350)
    return () => clearTimeout(timer)
  }, [amount, open])

  const onLeadChange = async (event) => {
    const leadId = event.target.value
    setValue('lead', leadId)
    if (!leadId) return
    try {
      const list = leadData?.items?.find((item) => item._id === leadId)
      if (list?.assignedTo?._id) setValue('assignedTo', list.assignedTo._id)
    } catch {
      // owner can be selected manually
    }
  }

  const onSubmit = async (values) => {
    setServerError('')
    try {
      const result = await api.post('/deals', {
        lead: values.lead,
        amountPaise: Math.round(Number(values.amount) * 100),
        assignedTo: values.assignedTo,
        proposalDate: values.proposalDate ? new Date(values.proposalDate).toISOString() : null,
        expectedClosingDate: values.expectedClosingDate
          ? new Date(values.expectedClosingDate).toISOString()
          : null,
        notes: values.notes || '',
      })
      toast.success('Deal created with captured commission rate')
      onSaved?.(result.deal)
      onClose()
    } catch (error) {
      setServerError(error.message)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a deal"
      description="The current commission rule is captured at creation and stays with this deal."
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button type="submit" form="deal-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isSubmitting ? 'Creating…' : 'Create deal'}
          </button>
        </>
      }
    >
      <form id="deal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
            <select id="lead" className="input" {...register('lead')} onChange={onLeadChange}>
              <option value="">Choose a lead</option>
              {leadData?.items?.map((item) => <option key={item._id} value={item._id}>{item.businessName}</option>)}
            </select>
          </Field>
        )}
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Deal value (₹) *" htmlFor="amount" error={errors.amount?.message}>
            <input id="amount" type="number" min="1" step="0.01" className="input" placeholder="75000" {...register('amount')} />
          </Field>
          <Field label="Owner" htmlFor="assignedTo" error={errors.assignedTo?.message}>
            <select id="assignedTo" className="input" {...register('assignedTo')} disabled={!isPrivileged}>
              {members.map((membership) => (
                <option key={membership.user?._id} value={membership.user?._id}>{membership.user?.name}</option>
              ))}
              {!members.length && <option value={user.id}>{user.name}</option>}
            </select>
          </Field>
          <Field label="Proposal date" htmlFor="proposalDate" error={errors.proposalDate?.message}>
            <input id="proposalDate" type="date" className="input" {...register('proposalDate')} />
          </Field>
          <Field label="Expected close" htmlFor="expectedClosingDate" error={errors.expectedClosingDate?.message}>
            <input id="expectedClosingDate" type="date" className="input" {...register('expectedClosingDate')} />
          </Field>
        </div>
        {preview && (
          <div className="flex items-center justify-between rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-soft)] p-3">
            <div>
              <p className="text-[9.5px] uppercase tracking-[0.06em] text-muted">Commission preview</p>
              <p className="mt-0.5 text-[10.5px] text-muted">Rate {preview.ratePercent}% · {preview.basis.replace('_', ' ')}</p>
            </div>
            <p className="text-base font-bold text-orange-500">{formatMoney(preview.calculatedCommissionPaise)}</p>
          </div>
        )}
        <Field label="Notes" htmlFor="notes" error={errors.notes?.message}>
          <textarea id="notes" className="input" rows={3} placeholder="Scope, decision makers, proposal context…" {...register('notes')} />
        </Field>
      </form>
    </Modal>
  )
}
