import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { api } from '../lib/api'
import { PAYMENT_METHODS } from '../lib/constants'
import { formatMoney, titleCase } from '../lib/utils'
import { Field } from './PageHeader'
import { Modal } from './Modal'

const schema = z.object({
  amount: z.coerce.number().min(0.01, 'Enter the amount received'),
  method: z.enum(PAYMENT_METHODS),
  receivedAt: z.string().min(1, 'Choose the received date'),
  reference: z.string().max(160).optional(),
  notes: z.string().max(2000).optional(),
})

const today = () => new Date().toISOString().slice(0, 10)

export const PaymentModal = ({ open, onClose, deal, onSaved }) => {
  const [serverError, setServerError] = useState('')
  const outstanding = deal?.outstandingPaise || 0
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: '',
      method: 'bank_transfer',
      receivedAt: today(),
      reference: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        amount: '',
        method: 'bank_transfer',
        receivedAt: today(),
        reference: '',
        notes: '',
      })
      setServerError('')
    }
  }, [open, reset])

  const onSubmit = async (values) => {
    setServerError('')
    try {
      const result = await api.post('/deals/payments', {
        deal: deal._id,
        amountPaise: Math.round(Number(values.amount) * 100),
        method: values.method,
        receivedAt: new Date(`${values.receivedAt}T12:00:00`).toISOString(),
        reference: values.reference || '',
        notes: values.notes || '',
      })
      toast.success('Payment recorded and commission recalculated')
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
      title="Record payment"
      description={deal ? `${deal.businessName} · ${formatMoney(outstanding)} outstanding` : ''}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button type="submit" form="payment-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isSubmitting ? 'Saving…' : 'Record payment'}
          </button>
        </>
      }
    >
      <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-3.5 py-2.5 text-[11.5px] text-[var(--danger)]">{serverError}</div>
        )}
        <Field label="Amount received (₹) *" htmlFor="paymentAmount" error={errors.amount?.message}>
          <input id="paymentAmount" type="number" min="0.01" step="0.01" className="input" placeholder="25000" {...register('amount')} />
          <div className="mt-2 flex gap-1.5">
            {[25, 50, 100].map((percent) => (
              <button
                key={percent}
                type="button"
                className="rounded-md border border-app px-2 py-1 text-[9.5px] text-muted hover:border-[var(--border-strong)] hover:text-[var(--text)]"
                onClick={() => setValue('amount', ((outstanding * percent) / 100 / 100).toFixed(2))}
              >
                {percent === 100 ? 'Full balance' : `${percent}%`}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Method *" htmlFor="paymentMethod" error={errors.method?.message}>
            <select id="paymentMethod" className="input" {...register('method')}>
              {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{titleCase(method)}</option>)}
            </select>
          </Field>
          <Field label="Received on *" htmlFor="receivedAt" error={errors.receivedAt?.message}>
            <input id="receivedAt" type="date" className="input" {...register('receivedAt')} />
          </Field>
        </div>
        <Field label="Reference" htmlFor="paymentReference" error={errors.reference?.message}>
          <input id="paymentReference" className="input" placeholder="UTR, receipt or invoice number" {...register('reference')} />
        </Field>
        <Field label="Notes" htmlFor="paymentNotes" error={errors.notes?.message}>
          <textarea id="paymentNotes" className="input" rows={2} placeholder="Optional payment context…" {...register('notes')} />
        </Field>
      </form>
    </Modal>
  )
}
