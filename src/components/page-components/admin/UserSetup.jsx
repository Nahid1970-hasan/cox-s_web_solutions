import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import { Button, InputField, Modal, Table, Pagination } from '../../ui'
import { API_PATHS } from '../../../config/env'
import { coreAxios } from '../../../config/axios'
import '../../../css/components/Users.css'

const DROPDOWN_MENU_HEIGHT = 130

const ROLE_OPTIONS = [
  { value: 'superadmin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
]

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]

function mapRowFromApi(u) {
  const name =
    (u.name ?? u.full_name ?? u.username ?? '') ||
    (u.first_name || u.last_name ? [u.first_name, u.last_name].filter(Boolean).join(' ').trim() : '')
  return {
    id: u.user_id ?? u.id,
    name: String(name),
    email: u.email ?? '',
    role: u.role ?? '',
    status: u.status ?? 'Active',
    createdAt: u.created_date ?? u.createdAt ?? '',
  }
}

const tableBodyTemp = (rowData, field) => {
  const v = rowData?.[field]
  return v != null && v !== '' ? String(v) : '—'
}

const dateBodyTemp = (rowData, field) => {
  const v = rowData?.[field]
  if (v == null || v === '') return '—'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function UserSetup() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionDropdown, setActionDropdown] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'superadmin', status: 'Active' })
  const [editLoading, setEditLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await coreAxios.get(API_PATHS.SUPERADMIN_DASHBOARD)
        const list = Array.isArray(data) ? data : (data.results ?? [])
        const mapped = (Array.isArray(list) ? list : []).map(mapRowFromApi)
        setRows(mapped)
      } catch (err) {
        const msg = err.response?.status === 401 ? 'Unauthorized' : (err.response?.data?.message ?? err.response?.data?.detail ?? err.message ?? 'Failed to load data')
        setLoadError(Array.isArray(msg) ? msg.join(' ') : String(msg))
        toast.error(Array.isArray(msg) ? msg.join(' ') : String(msg))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage))
  const start = (page - 1) * rowsPerPage
  const pageRows = rows.slice(start, start + rowsPerPage)

  const openNew = () => {
    setEditingRow(null)
    setForm({ name: '', email: '', password: '', role: 'superadmin', status: 'Active' })
    setSaveError('')
    setModalOpen(true)
  }

  const openEdit = async (row) => {
    setActionDropdown(null)
    setEditLoading(true)
    try {
      const { data } = await coreAxios.get(API_PATHS.allUserDetail(row.id))
      const mapped = mapRowFromApi(data)
      setEditingRow(mapped)
      setForm({
        name: mapped.name,
        email: mapped.email,
        password: '',
        role: mapped.role || 'superadmin',
        status: mapped.status,
      })
      setModalOpen(true)
    } catch (err) {
      const msg = err.response?.status === 404 ? 'Not found' : (err.response?.data?.message ?? err.response?.data?.detail ?? err.message ?? 'Failed to load')
      toast.error(Array.isArray(msg) ? msg.join(' ') : String(msg))
    } finally {
      setEditLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (editingRow) {
      setSaveError('')
      setSaving(true)
      try {
        await coreAxios.patch(API_PATHS.updateUser(editingRow.id), {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          status: form.status,
        })
        setRows((prev) =>
          prev.map((r) =>
            r.id === editingRow.id ? { ...r, name: form.name, email: form.email, role: form.role, status: form.status } : r
          )
        )
        setModalOpen(false)
        toast.success('Updated successfully.')
      } catch (err) {
        const msg = err.response?.data?.message ?? err.response?.data?.detail ?? err.message ?? 'Failed to update'
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
      const body = { name: form.name.trim(), email: form.email.trim(), role: form.role, status: form.status }
      if (form.password && form.password.trim()) body.password = form.password.trim()
      const { data } = await coreAxios.post(API_PATHS.ADD_USERS, body)
      setRows((prev) => [...prev, mapRowFromApi(data)])
      setModalOpen(false)
      toast.success('Added successfully.')
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data?.detail ?? err.message ?? 'Failed to add'
      setSaveError(Array.isArray(msg) ? msg.join(' ') : String(msg))
      toast.error(Array.isArray(msg) ? msg.join(' ') : String(msg))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    setDeleteError('')
    setDeleting(true)
    try {
      await coreAxios.delete(API_PATHS.deleteUser(row.id))
      setRows((prev) => prev.filter((r) => r.id !== row.id))
      setDeleteConfirm(null)
      setActionDropdown(null)
      toast.success('Deleted successfully.')
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data?.detail ?? err.message ?? 'Failed to delete'
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
      const openUp = rect.bottom + DROPDOWN_MENU_HEIGHT > window.innerHeight - 20
      setActionDropdown({
        id: rowData.id,
        row: rowData,
        left: rect.left,
        top: openUp ? rect.top - DROPDOWN_MENU_HEIGHT : rect.bottom + 4,
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
                <button type="button" onClick={() => { setActionDropdown(null); openEdit(actionDropdown.row); }}>
                  Edit
                </button>
                <button
                  type="button"
                  className="users-action-delete"
                  onClick={() => { setActionDropdown(null); setDeleteConfirm(actionDropdown.row); }}
                >
                  Delete
                </button>
              </div>
            </>,
            document.body
          )}
      </div>
    )
  }

  const tableColumns = [
    { field: 'id', header: 'ID', width: '60px', sortableBody: (rowData) => tableBodyTemp(rowData, 'id') },
    { field: 'name', header: 'Name', width: '120px', sortableBody: (rowData) => tableBodyTemp(rowData, 'name') },
    { field: 'email', header: 'Email', width: '160px', sortableBody: (rowData) => tableBodyTemp(rowData, 'email') },
    {
      field: 'role',
      header: 'Role',
      width: '130px',
      sortableBody: (rowData) => <span className="ui-table-badge">{rowData?.role ?? ''}</span>,
    },
    {
      field: 'status',
      header: 'Status',
      width: '120px',
      sortableBody: (rowData) => <span className="ui-table-badge">{rowData?.status ?? ''}</span>,
    },
    {
      field: 'createdAt',
      header: 'Created',
      width: '160px',
      sortableBody: (rowData) => dateBodyTemp(rowData, 'createdAt'),
    },
    { field: 'action', header: 'Action', width: '100px', sortableBody: renderActionCell },
  ]

  if (loading) {
    return (
      <div className="admin-users">
        <div className="users-loading">Loading…</div>
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

      {editLoading && <div className="users-loading users-loading-inline">Loading…</div>}

      <div className="users-table-section">
        <Table columns={tableColumns} data={pageRows} emptyMessage="No users found." />
      </div>

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

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSaveError('') }}
        title={editingRow ? 'Update User Setup' : 'Add User Setup'}
        size="lg"
        className="users-modal-dialog"
      >
        <form onSubmit={handleSave} className="users-form-grid">
          {saveError && (
            <div className="users-error users-error-inline" style={{ gridColumn: '1 / -1' }}>{saveError}</div>
          )}
          <div className="users-form-field">
            <InputField
              label="Name"
              name="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Role"
              name="role"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              options={ROLE_OPTIONS}
            />
          </div>
          {!editingRow && (
            <div className="users-form-field users-form-field--full">
              <InputField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          )}
          <div className="users-form-field">
            <InputField
              label="Status"
              name="status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              options={STATUS_OPTIONS}
            />
          </div>
          <div className="users-form-actions">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteConfirm}
        onClose={() => { setDeleteConfirm(null); setDeleteError('') }}
        title="Delete?"
        size="sm"
      >
        {deleteConfirm && (
          <>
            <p>{deleteConfirm.name} ({deleteConfirm.email})</p>
            {deleteError && <div className="users-error users-error-inline">{deleteError}</div>}
            <div className="ui-modal-actions">
              <Button variant="ghost" onClick={() => { setDeleteConfirm(null); setDeleteError('') }} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleDelete(deleteConfirm)} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
