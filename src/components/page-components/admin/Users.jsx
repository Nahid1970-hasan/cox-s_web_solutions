import React, { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import { Button, InputField, Modal, Table, Pagination } from '../../ui'
import { API_PATHS } from '../../../config/env'
import { coreAxios } from '../../../config/axios'
import '../../../css/components/Users.css'

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'superadmin', label: 'Super Admin' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

/** Map API user shape (user_id, created_date, etc.) to table shape (id, name, createdAt). */
function mapUserFromApi(u) {
  const name =
    (u.name ?? u.full_name ?? u.username ?? '') ||
    (u.first_name || u.last_name ? [u.first_name, u.last_name].filter(Boolean).join(' ').trim() : '')
  return {
    id: u.user_id,
    name: String(name),
    email: u.email ?? '',
    role: u.role ?? '',
    status: (u.status ?? 'active').toLowerCase(),
    createdAt: u.created_date ?? '',
  }
}

/** Default cell: show value or em dash */
const tableBodyTemp = (rowData, field) => {
  const v = rowData?.[field]
  return v != null && v !== '' ? String(v) : '—'
}

/** Show date as "6 Sept 2019" (day, short month, year) */
const dateBodyTemp = (rowData, field) => {
  const v = rowData?.[field]
  if (v == null || v === '') return '—'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionDropdown, setActionDropdown] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin', status: 'active' })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [filters, setFilters] = useState({ name: '', email: '', role: '', status: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await coreAxios.get(API_PATHS.DASHBOARD_USERS)
        const list = Array.isArray(data) ? data : (data.results ?? [])
        const mapped = (Array.isArray(list) ? list : []).map(mapUserFromApi)
        setUsers(mapped)
      } catch (err) {
        const msg = err.response?.status === 401 ? 'Unauthorized' : (err.response?.data?.message ?? err.response?.data?.detail ?? err.message ?? 'Failed to load users')
        setLoadError(Array.isArray(msg) ? msg.join(' ') : String(msg))
        toast.error(Array.isArray(msg) ? msg.join(' ') : String(msg))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const nameMatch = !filters.name.trim() || (u.name && u.name.toLowerCase().includes(filters.name.toLowerCase()))
      const emailMatch = !filters.email.trim() || (u.email && u.email.toLowerCase().includes(filters.email.toLowerCase()))
      const roleMatch = !filters.role || u.role === filters.role
      const statusMatch = !filters.status || u.status === filters.status
      return nameMatch && emailMatch && roleMatch && statusMatch
    })
  }, [users, filters])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage))
  const start = (page - 1) * rowsPerPage
  const pageUsers = filteredUsers.slice(start, start + rowsPerPage)

  const openNew = () => {
    setEditingUser(null)
    setForm({ name: '', email: '', password: '', role: 'admin', status: 'active' })
    setSaveError('')
    setModalOpen(true)
  }

  const openEdit = async (user) => {
    setActionDropdown(null)
    setEditError('')
    setEditLoading(true)
    try {
      const { data } = await coreAxios.get(API_PATHS.allUserDetail(user.id))
      const mapped = mapUserFromApi(data)
      setEditingUser(mapped)
      setForm({
        name: mapped.name,
        email: mapped.email,
        password: '',
        role: mapped.role,
        status: (mapped.status ?? 'active').toLowerCase(),
      })
      setModalOpen(true)
    } catch (err) {
      const msg = err.response?.status === 404 ? 'User not found' : (err.response?.data?.message ?? err.response?.data?.detail ?? err.message ?? 'Failed to load user')
      setEditError(Array.isArray(msg) ? msg.join(' ') : String(msg))
      toast.error(Array.isArray(msg) ? msg.join(' ') : String(msg))
    } finally {
      setEditLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (editingUser) {
      setSaveError('')
      setSaving(true)
      try {
        const body = {
          username: form.email.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          status: (form.status || 'active').toLowerCase(),
        }
        if (form.password && form.password.trim()) body.password = form.password.trim()
        await coreAxios.patch(API_PATHS.updateUser(editingUser.id), body)
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? { ...u, name: form.name, email: form.email, role: form.role, status: form.status }
              : u
          )
        )
        setModalOpen(false)
        toast.success('User updated successfully.')
      } catch (err) {
        const msg = err.response?.data?.message ?? err.response?.data?.detail ?? err.response?.data?.error ?? err.message ?? 'Failed to update user'
        setSaveError(Array.isArray(msg) ? msg.join(' ') : String(msg))
        toast.error(Array.isArray(msg) ? msg.join(' ') : String(msg))
      } finally {
        setSaving(false)
      }
      return
    }
    setSaveError('')
    setSaving(true)
    try {
      const body = {
        username: form.email.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        status: (form.status || 'active').toLowerCase(),
      }
      if (form.password && form.password.trim()) body.password = form.password.trim()
      const { data } = await coreAxios.post(API_PATHS.ADD_USERS, body)
      const mapped = mapUserFromApi(data)
      setUsers((prev) => [...prev, mapped])
      setModalOpen(false)
      toast.success('User added successfully.')
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data?.detail ?? err.response?.data?.error ?? err.message ?? 'Failed to create user'
      setSaveError(Array.isArray(msg) ? msg.join(' ') : String(msg))
      toast.error(Array.isArray(msg) ? msg.join(' ') : String(msg))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user) => {
    setDeleteError('')
    setDeleting(true)
    try {
      await coreAxios.delete(API_PATHS.deleteUser(user.id))
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      setDeleteConfirm(null)
      setActionDropdown(null)
      toast.success('User deleted successfully.')
    } catch (err) {
      const msg = err.response?.status === 404 ? 'User not found' : (err.response?.data?.message ?? err.response?.data?.detail ?? err.response?.data?.error ?? err.message ?? 'Failed to delete user')
      setDeleteError(Array.isArray(msg) ? msg.join(' ') : String(msg))
      toast.error(Array.isArray(msg) ? msg.join(' ') : String(msg))
    } finally {
      setDeleting(false)
    }
  }

  const renderActionCell = (rowData) => {
    const open = actionDropdown && actionDropdown.id === rowData.id
    const openDropdown = (e) => {
      if (open) {
        setActionDropdown(null)
        return
      }
      const rect = e.currentTarget.getBoundingClientRect()
      setActionDropdown({
        id: rowData.id,
        row: rowData,
        left: rect.left,
        top: rect.bottom + 4,
      })
    }
    return (
      <div className="users-action-cell">
      <Button variant="secondary" size="sm" onClick={openDropdown}>
        Action ▾
      </Button>
    
      {open &&
        createPortal(
          <>
            <div className="users-action-backdrop" onClick={() => setActionDropdown(null)} aria-hidden />
            <div
              className="users-action-dropdown users-action-dropdown--fixed"
              style={{ left: actionDropdown.left, top: actionDropdown.top }}
            >
              {/* Superadmin: Edit + Delete */}
              {actionDropdown.row.role === 'superadmin' && (
                <>
                  <button
                    type="button"
                    onClick={() => { setActionDropdown(null); openEdit(actionDropdown.row); }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="users-action-delete"
                    onClick={() => { setActionDropdown(null); setDeleteConfirm(actionDropdown.row); }}
                  >
                    Delete
                  </button>
                </>
              )}
    
              {/* Admin: Delete only */}
              {actionDropdown.row.role === 'admin' && (
                <button
                  type="button"
                  className="users-action-delete"
                  onClick={() => { setActionDropdown(null); setDeleteConfirm(actionDropdown.row); }}
                >
                  Delete
                </button>
              )}
    
              {/* User: View only */}
              {actionDropdown.row.role === 'user' && (
                <button
                  type="button"
                  onClick={() => { setActionDropdown(null); openView(actionDropdown.row); }}
                >
                  View
                </button>
              )}
            </div>
          </>,
          document.body
        )}
    </div>
    )
  }

  // Customize column widths via width (e.g. "80px", "10rem", "15%") or style
  const tableColumns = [
    {
      field: 'id',
      header: 'ID',
      width: '50px',
      sortable: true,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'id'),
    },
    {
      field: 'name',
      header: 'Name',
      width: '150px',
      sortable: true,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'name'),
    },
    {
      field: 'email',
      header: 'Email',
      width: '170px',
      sortable: false,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'email'),
    },
    {
      field: 'role',
      header: 'Role',
      width: '120px',
      sortable: false,
      sortableBody: (rowData) => <span className="ui-table-badge">{rowData?.role ?? ''}</span>,
    },
    {
      field: 'status',
      header: 'Status',
      width: '120px',
      sortable: false,
      sortableBody: (rowData) => {
        const s = rowData?.status ?? ''
        const label = s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
        return <span className="ui-table-badge">{label}</span>
      },
    },
    {
      field: 'createdAt',
      header: 'Created',
      width: '150px',
      sortable: true,
      sortValue: (row) => row?.createdAt ?? '',
      sortableBody: (rowData) => dateBodyTemp(rowData, 'createdAt'),
    },
    {
      field: 'action',
      header: 'Action',
      width: '100px',
      sortableBody: renderActionCell,
    },
  ]

  if (loading) {
    return (
      <div className="admin-users">
        <div className="users-loading">Loading users…</div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="admin-users">
        <div className="users-error">{loadError}</div>
      </div>
    )
  }

  return (
    <div className="admin-users">

      <div className="users-toolbar">
        <div className="users-toolbar-left">
          <Button variant="success" onClick={openNew}>+ New</Button>
        </div>
      </div>

      {editLoading && <div className="users-loading users-loading-inline">Loading user…</div>}
      {editError && <div className="users-error users-error-inline">{editError}</div>}

      {/* Table */}
      <div className="users-table-section">
        <Table
          columns={tableColumns}
          data={pageUsers}
          emptyMessage="No users found."
        />
      </div>

      {/* Pagination */}
      <div className="users-footer">
        <div className="users-footer-right">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(1) }}
          />
        </div>
      </div>

      {/* Create / Edit modal – dialog-style form in 2-column grid */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditError(''); setSaveError('') }} title={editingUser ? 'Update User' : 'Add New User'} size="lg" className="users-modal-dialog">
        <form onSubmit={handleSave} className="users-form-grid">
          {saveError && <div className="users-error users-error-inline" style={{ gridColumn: '1 / -1' }}>{saveError}</div>}
          <div className="users-form-field">
            <InputField label="Name" name="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="users-form-field">
            <InputField label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="users-form-field">
            <InputField label="Role" name="role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} options={ROLES} />
          </div>
          <div className="users-form-field">
            <InputField label="Status" name="status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} options={STATUS_OPTIONS} />
          </div>
          {!editingUser && (
            <div className="users-form-field users-form-field--full">
              <InputField label="Password" name="password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Optional" />
            </div>
          )}

          <div className="users-form-actions">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>Reset</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => { setDeleteConfirm(null); setDeleteError('') }} title="Delete user?" size="sm">
        {deleteConfirm && (
          <>
            <p>{deleteConfirm.name} ({deleteConfirm.email})</p>
            {deleteError && <div className="users-error users-error-inline">{deleteError}</div>}
            <div className="ui-modal-actions">
              <Button variant="ghost" onClick={() => { setDeleteConfirm(null); setDeleteError('') }} disabled={deleting}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(deleteConfirm)} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</Button>
            </div>
          </>
        )}
      </Modal>

    </div>
  )
}
