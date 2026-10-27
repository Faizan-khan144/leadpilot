import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { useMembers } from '../hooks/useMembers'
import { api } from '../lib/api'
import { Field } from './PageHeader'
import { Modal } from './Modal'

const schema = z.object({
  amount: z.coerce.number().min(0.01, 'Enter the deal value'),
  assignedTo: z.string().min(1, 'Choose an owner'),
  proposalDate: z.string().optional(),
  expectedClosingDate: z.string().optional(),
  notes: z.string().max(5000).optional(),
})

const dateValue = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '')

export const EditDealModal = ({ open, onClose, deal, onSaved }) => {
  const { isPrivileged } = useAuth()
  const { members } = useMembers()
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open && deal) {
      reset({
        amount: (deal.amountPaise / 100).toString(),
        assignedTo: deal.assignedTo?._id || deal.assignedTo || '',
        proposalDate: dateValue(deal.proposalDate),
        expectedClosingDate: dateValue(deal.expectedClosingDate),
        notes: deal.notes || '',
      })
      setServerError('')
    }
  }, [open, deal, reset])

  const onSubmit = async (values) => {
    setServerError('')
    try {
      const result = await api.patch(`/deals/${deal._id}`, {
        amountPaise: Math.round(Number(values.amount) * 100),
        ...(isPrivileged ? { assignedTo: values.assignedTo } : {}),
        proposalDate: values.proposalDate ? new Date(`${values.proposalDate}T12:00:00`).toISOString() : null,
        expectedClosingDate: values.expectedClosingDate ? new Date(`${values.expectedClosingDate}T12:00:00`).toISOString() : null,
        notes: values.notes || '',
      })
      toast.success('Deal updated')
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
      title="Edit deal"
      description="Changing the value recalculates the captured commission rate on the new amount."
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button type="submit" form="edit-deal-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </button>
        </>
      }
    >
      <form id="edit-deal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-3.5 py-2.5 text-[11.5px] text-[var(--danger)]">{serverError}</div>
        )}
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Deal value (₹) *" htmlFor="editAmount" error={errors.amount?.message}>
            <input id="editAmount" type="number" min="0.01" step="0.01" className="input" {...register('amount')} />
          </Field>
          <Field label="Owner" htmlFor="editAssignedTo" error={errors.assignedTo?.message}>
            <select id="editAssignedTo" className="input" {...register('assignedTo')} disabled={!isPrivileged}>
              {members.map((membership) => (
                <option key={membership.user?._id} value={membership.user?._id}>{membership.user?.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Proposal date" htmlFor="editProposalDate" error={errors.proposalDate?.message}>
            <input id="editProposalDate" type="date" className="input" {...register('proposalDate')} />
          </Field>
          <Field label="Expected close" htmlFor="editExpectedClosingDate" error={errors.expectedClosingDate?.message}>
            <input id="editExpectedClosingDate" type="date" className="input" {...register('expectedClosingDate')} />
          </Field>
        </div>
        <Field label="Notes" htmlFor="editNotes" error={errors.notes?.message}>
          <textarea id="editNotes" className="input" rows={3} {...register('notes')} />
        </Field>
      </form>
    </Modal>
  )
}
