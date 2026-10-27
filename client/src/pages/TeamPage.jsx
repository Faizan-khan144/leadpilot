import { useMemo, useState } from 'react'
import {
  Check,
  Copy,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar } from '../components/Avatar'
import { Modal } from '../components/Modal'
import { PageHeader, Stat } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { EmptyState, ErrorState, PageSkeleton } from '../components/States'
import { Badge } from '../components/Badge'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { useDebounce } from '../hooks/useDebounce'
import { api } from '../lib/api'
import { ROLES } from '../lib/constants'
import { formatDate, formatMoney, formatNumber, titleCase } from '../lib/utils'

const roleLabel = (role) => ROLES.find((item) => item.value === role)?.label || titleCase(role)

export const TeamPage = () => {
  const { isOwner } = useAuth()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteResult, setInviteResult] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [deactivateTarget, setDeactivateTarget] = useState(null)
  const [invite, setInvite] = useState({ email: '', name: '', role: 'lead_generator', managerId: '' })
  const [edit, setEdit] = useState({ role: 'lead_generator', managerId: '', status: 'active' })
  const [working, setWorking] = useState(false)
  const [copied, setCopied] = useState(false)
  const debouncedSearch = useDebounce(search, 350)
  const query = useMemo(() => ({ page, limit: 20, search: debouncedSearch, role, status }), [page, debouncedSearch, role, status])
  const { data, loading, error, refetch } = useApi('/members', query, [reload])
  const { data: allMembers } = useApi('/members', { limit: 100 }, [reload])
  const items = data?.items || []
  const managers = (allMembers?.items || []).filter((item) => ['owner', 'manager'].includes(item.role) && item.status === 'active')

  const refresh = () => {
    setReload((current) => current + 1)
    refetch({ quiet: true })
  }

  const openInvite = () => {
    setInvite({ email: '', name: '', role: 'lead_generator', managerId: managers.find((item) => item.role === 'manager')?.user?._id || '' })
    setInviteOpen(true)
  }

  const submitInvite = async (event) => {
    event.preventDefault()
    setWorking(true)
    try {
      const result = await api.post('/members/invite', {
        email: invite.email.trim(),
        ...(invite.name.trim() ? { name: invite.name.trim() } : {}),
        role: invite.role,
        ...(invite.managerId ? { managerId: invite.managerId } : {}),
      })
      setInviteOpen(false)
      setInviteResult(result)
      toast.success('Invitation created')
      refresh()
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setWorking(false)
    }
  }

  const openEdit = (membership) => {
    setEditTarget(membership)
    setEdit({
      role: membership.role,
      managerId: membership.manager?._id || membership.manager || '',
      status: membership.status,
    })
  }

  const submitEdit = async () => {
    setWorking(true)
    try {
      await api.patch(`/members/${editTarget._id}`, {
        role: edit.role,
        managerId: edit.managerId || null,
        status: edit.status,
      })
      toast.success('Team member updated')
      setEditTarget(null)
      refresh()
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setWorking(false)
    }
  }

  const deactivate = async () => {
    setWorking(true)
    try {
      await api.delete(`/members/${deactivateTarget._id}`)
      toast.success('Team member deactivated')
      setDeactivateTarget(null)
      refresh()
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setWorking(false)
    }
  }

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteResult.inviteUrl)
      setCopied(true)
      toast.success('Invite link copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy automatically. Select the link manually.')
    }
  }

  const stats = useMemo(() => {
    const all = allMembers?.items || []
    return {
      total: allMembers?.total ?? all.length,
      active: all.filter((item) => item.status === 'active').length,
      pending: all.filter((item) => item.status === 'pending').length,
      revenue: all.reduce((sum, item) => sum + (item.performance?.revenuePaise || 0), 0),
    }
  }, [allMembers])

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="People"
        title="Team"
        description="Roles, reporting lines and live performance across the workspace."
        actions={isOwner && (
          <button type="button" className="btn btn-primary" onClick={openInvite}>
            <UserPlus className="h-3.5 w-3.5" /> Invite member
          </button>
        )}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Team size" value={formatNumber(stats.total)} hint="Members and invitations" icon={Users} />
        <Stat label="Active" value={formatNumber(stats.active)} hint="Can access the workspace" icon={Check} tone="success" />
        <Stat label="Pending invites" value={formatNumber(stats.pending)} hint="Waiting to accept" icon={Mail} tone="warning" />
        <Stat label="Won revenue" value={formatMoney(stats.revenue, { compact: true })} hint="Closed-won deals" icon={Trophy} tone="accent" />
      </div>

      <div className="panel flex flex-col gap-2 p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} className="input pl-9" placeholder="Search name or email…" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1) }} className="input min-w-[150px]">
            <option value="">All roles</option>
            {ROLES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className="input min-w-[130px]">
            <option value="">All statuses</option>
            {['active', 'pending', 'inactive'].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}
          </select>
        </div>
      </div>

      {loading && !data ? (
        <PageSkeleton />
      ) : error && !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Reports to</th>
                <th>Leads</th>
                <th>Calls</th>
                <th>Won</th>
                <th>Revenue</th>
                <th>Status</th>
                {isOwner && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((membership) => {
                  const person = membership.user || { name: membership.invitedName || membership.invitedEmail, email: membership.invitedEmail }
                  return (
                    <tr key={membership._id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar user={membership.user} name={person.name} size="sm" />
                          <div>
                            <p className="font-semibold">{person.name || 'Unnamed member'}</p>
                            <p className="text-[9.5px] text-subtle">{person.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><Badge className={membership.role === 'owner' ? 'badge-accent' : membership.role === 'manager' ? 'badge-info' : 'badge-muted'}>{roleLabel(membership.role)}</Badge></td>
                      <td className="text-muted">{membership.manager?.name || '—'}</td>
                      <td>{formatNumber(membership.performance?.leads)}</td>
                      <td>
                        <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3 text-subtle" />{formatNumber(membership.performance?.calls)}</span>
                      </td>
                      <td>{formatNumber(membership.performance?.dealsWon)}</td>
                      <td className="font-medium">{formatMoney(membership.performance?.revenuePaise || 0, { compact: true })}</td>
                      <td>
                        <Badge className={membership.status === 'active' ? 'badge-success' : membership.status === 'pending' ? 'badge-warning' : 'badge-muted'}>
                          {titleCase(membership.status)}
                        </Badge>
                        {membership.status === 'pending' && <p className="mt-1 text-[9px] text-subtle">Invited {formatDate(membership.createdAt)}</p>}
                      </td>
                      {isOwner && (
                        <td>
                          <div className="flex justify-end">
                            {membership.role === 'owner' ? (
                              <span className="text-[9.5px] text-subtle">Owner</span>
                            ) : (
                              <button type="button" className="icon-button h-7 w-7" onClick={() => openEdit(membership)} title="Manage member">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={isOwner ? 9 : 8}>
                    <EmptyState
                      icon={Users}
                      title={search || role || status ? 'No members match these filters' : 'No team members yet'}
                      description="Invite managers and lead generators to divide the pipeline and track performance."
                      action={isOwner ? <button type="button" className="btn btn-primary" onClick={openInvite}>Invite a teammate</button> : null}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} limit={20} total={data?.pagination?.total || 0} onPageChange={setPage} />
        </div>
      )}

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite a teammate"
        description="They will receive a link to join this workspace. The invitation expires in 7 days."
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setInviteOpen(false)} disabled={working}>Cancel</button>
            <button type="submit" form="invite-form" className="btn btn-primary" disabled={working || !invite.email.trim() || (invite.role === 'lead_generator' && !invite.managerId)}>
              {working ? 'Sending…' : 'Create invitation'}
            </button>
          </>
        }
      >
        <form id="invite-form" onSubmit={submitInvite} className="space-y-3.5" noValidate>
          <div>
            <label className="label" htmlFor="inviteEmail">Email *</label>
            <input id="inviteEmail" type="email" className="input" value={invite.email} onChange={(event) => setInvite((current) => ({ ...current, email: event.target.value }))} placeholder="teammate@company.com" autoFocus />
          </div>
          <div>
            <label className="label" htmlFor="inviteName">Name</label>
            <input id="inviteName" className="input" value={invite.name} onChange={(event) => setInvite((current) => ({ ...current, name: event.target.value }))} placeholder="Optional display name" />
          </div>
          <div>
            <label className="label" htmlFor="inviteRole">Role *</label>
            <select id="inviteRole" className="input" value={invite.role} onChange={(event) => setInvite((current) => ({ ...current, role: event.target.value }))}>
              {ROLES.filter((item) => item.value !== 'owner').map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="inviteManager">Manager {invite.role === 'lead_generator' ? '*' : ''}</label>
            <select id="inviteManager" className="input" value={invite.managerId} onChange={(event) => setInvite((current) => ({ ...current, managerId: event.target.value }))}>
              <option value="">{invite.role === 'lead_generator' ? 'Choose a manager' : 'No manager'}</option>
              {managers.map((membership) => <option key={membership.user?._id} value={membership.user?._id}>{membership.user?.name} ({titleCase(membership.role)})</option>)}
            </select>
            {invite.role === 'lead_generator' && !managers.length && <p className="mt-1.5 text-[10px] text-[var(--danger)]">Promote a manager first; lead generators must report to someone.</p>}
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(inviteResult)}
        onClose={() => setInviteResult(null)}
        title="Invitation created"
        description={inviteResult?.membership?.invitedEmail}
        size="sm"
        footer={<button type="button" className="btn btn-primary" onClick={() => setInviteResult(null)}>Done</button>}
      >
        {inviteResult?.inviteUrl ? (
          <div className="space-y-2">
            <p className="text-[11px] text-muted">Development mode returns the invite link directly. In production, this is emailed instead.</p>
            <div className="flex items-center gap-2 rounded-xl border border-app bg-surface-2 p-2">
              <input readOnly value={inviteResult.inviteUrl} className="min-w-0 flex-1 bg-transparent px-1 text-[10px] outline-none" />
              <button type="button" className="btn btn-secondary h-7 shrink-0 px-2 text-[10px]" onClick={copyInvite}>
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-muted">The invitation email has been sent and the member now appears as pending.</p>
        )}
      </Modal>

      <Modal
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title="Manage team member"
        description={editTarget?.user?.name || editTarget?.invitedEmail}
        size="sm"
        footer={
          <>
            {editTarget?.status !== 'inactive' && (
              <button
                type="button"
                className="btn btn-danger mr-auto"
                onClick={() => {
                  setDeactivateTarget(editTarget)
                  setEditTarget(null)
                }}
                disabled={working}
              >
                Deactivate
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={() => setEditTarget(null)} disabled={working}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={submitEdit} disabled={working}>Save</button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div>
            <label className="label" htmlFor="editRole">Role</label>
            <select id="editRole" className="input" value={edit.role} onChange={(event) => setEdit((current) => ({ ...current, role: event.target.value }))}>
              {ROLES.filter((item) => item.value !== 'owner').map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="editManager">Manager</label>
            <select id="editManager" className="input" value={edit.managerId} onChange={(event) => setEdit((current) => ({ ...current, managerId: event.target.value }))}>
              <option value="">No manager</option>
              {managers.filter((membership) => membership._id !== editTarget?._id).map((membership) => <option key={membership.user?._id} value={membership.user?._id}>{membership.user?.name} ({titleCase(membership.role)})</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="editStatus">Status</label>
            <select id="editStatus" className="input" value={edit.status} onChange={(event) => setEdit((current) => ({ ...current, status: event.target.value }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        title="Deactivate teammate"
        description={`${deactivateTarget?.user?.name || deactivateTarget?.invitedEmail || 'This member'} will immediately lose access to the workspace. Their historical records remain.`}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setDeactivateTarget(null)} disabled={working}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={deactivate} disabled={working}>{working ? 'Deactivating…' : 'Deactivate'}</button>
          </>
        }
      >
        <p className="text-[11px] leading-relaxed text-muted">You can reactivate this person later from the same menu.</p>
      </Modal>
    </div>
  )
}
