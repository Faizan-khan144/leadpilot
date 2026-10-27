import { useRef, useState } from 'react'
import { Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../lib/api'
import { downloadBlob, parseCsv } from '../lib/utils'
import { LEAD_SOURCES, LEAD_STATUSES, PRIORITIES } from '../lib/constants'
import { Modal } from './Modal'

const template = `Business,Contact Person,Phone,Email,Website,Industry,City,Country,Source,Assigned To,Estimated Value (INR),Status,Priority,Notes
Northstar Dental Studio,Priya Sharma,+919876543210,priya@example.com,https://example.com,Healthcare,Mumbai,India,Referral,,75000,New Lead,high,Interested in a follow-up next week
`

const pick = (row, keys, fallback = '') => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== '') return row[key]
  }
  return fallback
}

const normalizeRows = (rawRows) =>
  rawRows
    .map((row) => {
      const businessName = pick(row, ['businessName', 'Business', 'Business Name', 'business_name'])
      if (!businessName) return null
      const source = pick(row, ['source', 'Source'], 'Manual')
      const status = pick(row, ['status', 'Status'], 'New Lead')
      const priority = pick(row, ['priority', 'Priority'], 'medium').toLowerCase()
      const rawValue = pick(row, ['estimatedValuePaise', 'Estimated Value (INR)', 'Estimated Value', 'Value'], '0')
      const numeric = Number(String(rawValue).replace(/[₹,\s]/g, '')) || 0
      return {
        businessName,
        contactPerson: pick(row, ['contactPerson', 'Contact Person', 'Contact']),
        phone: pick(row, ['phone', 'Phone']),
        email: pick(row, ['email', 'Email']),
        website: pick(row, ['website', 'Website']),
        industry: pick(row, ['industry', 'Industry']),
        city: pick(row, ['city', 'City']),
        country: pick(row, ['country', 'Country'], 'India'),
        source: LEAD_SOURCES.includes(source) ? source : 'Manual',
        assignedToEmail: pick(row, ['assignedToEmail', 'Assigned To', 'Assignee Email']),
        estimatedValuePaise: Math.round(numeric * 100),
        status: LEAD_STATUSES.includes(status) ? status : 'New Lead',
        priority: PRIORITIES.includes(priority) ? priority : 'medium',
        notes: pick(row, ['notes', 'Notes']),
      }
    })
    .filter(Boolean)

export const ImportLeadsModal = ({ open, onClose, onImported }) => {
  const [rows, setRows] = useState([])
  const [filename, setFilename] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const inputRef = useRef(null)

  const reset = () => {
    setRows([])
    setFilename('')
    setResult(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError('')
    setResult(null)
    if (file.size > 4 * 1024 * 1024) {
      setError('CSV file must be smaller than 4 MB.')
      return
    }
    const text = await file.text()
    const parsed = normalizeRows(parseCsv(text))
    setFilename(file.name)
    setRows(parsed)
    if (!parsed.length) {
      setError('No valid rows found. Make sure the first column contains businessName or Business.')
    }
  }

  const handleTemplate = () => {
    downloadBlob(new Blob([template], { type: 'text/csv;charset=utf-8;' }), 'leadpilot-import-template.csv')
  }

  const handleImport = async () => {
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/leads/import', { rows, skipDuplicates })
      setResult(data)
      if (data.imported > 0) {
        toast.success(`${data.imported} leads imported`)
        onImported?.()
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import leads from CSV"
      description="Upload up to 1,000 rows. Duplicate email/phone checks run inside your organization."
      size="lg"
      footer={
        result ? (
          <button type="button" className="btn btn-primary" onClick={handleClose}>Done</button>
        ) : (
          <>
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleImport} disabled={!rows.length || loading}>
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? 'Importing…' : `Import ${rows.length || ''} leads`}
            </button>
          </>
        )
      }
    >
      {result ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--success)]/20 bg-[var(--success-soft)] p-4">
              <p className="text-[10px] text-muted">Imported</p>
              <p className="mt-1 text-2xl font-bold text-[var(--success)]">{result.imported}</p>
            </div>
            <div className="rounded-xl border border-app bg-surface-2 p-4">
              <p className="text-[10px] text-muted">Skipped / errors</p>
              <p className="mt-1 text-2xl font-bold">{result.skipped + result.errors.length}</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-xl border border-app">
              {result.errors.slice(0, 30).map((entry, index) => (
                <div key={`${entry.row}-${index}`} className="flex justify-between border-b border-app px-3 py-2 text-[11px] last:border-0">
                  <span>Row {entry.row}</span>
                  <span className="text-[var(--danger)]">{entry.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-surface-2 p-6 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[var(--surface)] text-orange-500">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <p className="mt-3 text-[12px] font-semibold">{filename || 'Choose a CSV file'}</p>
            <p className="mt-1 text-[10.5px] text-muted">
              {rows.length ? `${rows.length} valid rows ready to import` : 'UTF-8 CSV with a header row'}
            </p>
            <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
            <button type="button" className="btn btn-secondary mt-4" onClick={() => inputRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> Choose file
            </button>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-app p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold">Need the right columns?</p>
              <p className="mt-0.5 text-[10px] text-muted">Business, contact, value, stage and assignee.</p>
            </div>
            <button type="button" className="btn btn-secondary h-8" onClick={handleTemplate}>
              <Download className="h-3.5 w-3.5" /> Template
            </button>
          </div>

          <label className="flex items-start gap-2.5 rounded-xl bg-surface-2 p-3 text-[11px]">
            <input
              type="checkbox"
              checked={skipDuplicates}
              onChange={(event) => setSkipDuplicates(event.target.checked)}
              className="mt-0.5 accent-orange-500"
            />
            <span>
              <span className="block font-medium">Skip duplicate leads</span>
              <span className="block text-[10px] text-muted">Matches by email or phone within this workspace.</span>
            </span>
          </label>

          {error && (
            <div className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-3.5 py-2.5 text-[11.5px] text-[var(--danger)]">
              {error}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
