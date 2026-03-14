import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import { Button, InputField, Modal, Table, Pagination, TextareaField } from '../../ui'
import { apiUrl, API_PATHS } from '../../../config/env'
import { coreAxios } from '../../../config/axios'
import '../../../css/components/Users.css'

function mapCompanyFromApi(p) {
  if (!p || typeof p !== 'object') return null
  return {
    id: p.com_id ?? p.id ?? p.pk,
    com_id: p.com_id ?? p.id ?? p.pk,
    company_name: String(p.own_com_name ?? p.company_name ?? p.name ?? ''),
    title: String(p.own_com_title ?? p.title ?? ''),
    logo: p.own_com_logo ?? p.logo ?? p.logo_url ?? p.img_url ?? '',
    address: String(p.address ?? ''),
    phone: String(p.phone ?? ''),
    email: String(p.email ?? ''),
    description: String(p.description ?? ''),
  }
}

const tableBodyTemp = (rowData, field) => {
  const v = rowData?.[field]
  return v != null && v !== '' ? String(v) : '—'
}

export default function CompanyInfo() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionDropdown, setActionDropdown] = useState(null)
  const [form, setForm] = useState({
    company_name: '',
    title: '',
    logo: '',
    address: '',
    phone: '',
    email: '',
    description: '',
  })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  const loadList = async () => {
    try {
      const { data } = await coreAxios.get(API_PATHS.COMPANYINFO_LIST)
      let list = []
      if (data != null) {
        if (Array.isArray(data)) {
          list = data
        } else if (typeof data === 'object') {
          if (Array.isArray(data.results)) list = data.results
          else if (Array.isArray(data.data)) list = data.data
          else if (Array.isArray(data.items)) list = data.items
          else if (Array.isArray(data.companies)) list = data.companies
          else if (Array.isArray(data.companyinfo)) list = data.companyinfo
          else {
            const values = Object.values(data)
            list = values.filter(
              (v) =>
                v != null &&
                typeof v === 'object' &&
                !Array.isArray(v) &&
                (v.com_id != null || v.id != null || v.own_com_name != null || v.own_com_title != null || v.own_com_logo != null)
            )
          }
        }
      }
      const mapped = list.map(mapCompanyFromApi).filter(Boolean)
      setRows(mapped)
      setLoadError('')
    } catch (err) {
      const msg = err.response?.status === 401 ? 'Unauthorized' : (err.response?.data?.message ?? err.response?.data?.detail ?? err.message ?? 'Failed to load company info')
      const text = Array.isArray(msg) ? msg.join(' ') : String(msg)
      setLoadError(text)
      setRows([])
      toast.error(text)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [])

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage))
  const start = (page - 1) * rowsPerPage
  const pageRows = rows.slice(start, start + rowsPerPage)

  const openNew = () => {
    setEditingRow(null)
    setForm({
      company_name: '',
      title: '',
      logo: '',
      address: '',
      phone: '',
      email: '',
      description: '',
    })
    setImagePreview('')
    setSaveError('')
    setModalOpen(true)
  }

  const openEdit = async (row) => {
    setActionDropdown(null)
    const comId = row.com_id ?? row.id
    if (comId == null && comId !== 0) {
      toast.error('Invalid company: missing com_id')
      return
    }
    setEditLoading(true)
    setEditError('')
    try {
      const { data } = await coreAxios.get(API_PATHS.companyinfoDetail(comId))
      const mapped = mapCompanyFromApi(data)
      setEditingRow(mapped)
      setForm({
        company_name: mapped.company_name,
        title: mapped.title,
        logo: mapped.logo,
        address: mapped.address,
        phone: mapped.phone,
        email: mapped.email,
        description: mapped.description,
      })
      setImagePreview(mapped.logo || '')
      setSaveError('')
      setModalOpen(true)
    } catch (err) {
      const msg = err.response?.status === 404 ? 'Company not found' : (err.response?.data?.message ?? err.response?.data?.detail ?? err.message ?? 'Failed to load company info')
      const text = Array.isArray(msg) ? msg.join(' ') : String(msg)
      setEditError(text)
      toast.error(text)
    } finally {
      setEditLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError('')
    setSaving(true)
    const formData = new FormData()
    formData.append('own_com_name', form.company_name.trim())
    formData.append('own_com_title', form.title.trim())
    formData.append('own_com_logo', form.logo.trim())
    formData.append('address', form.address.trim())
    formData.append('phone', form.phone.trim())
    formData.append('email', form.email.trim())
    formData.append('description', form.description.trim())
    try {
      if (editingRow) {
        const comId = editingRow.com_id ?? editingRow.id
        await coreAxios.patch(API_PATHS.updateCompanyInfo(comId), formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Company info updated successfully.')
        await loadList()
      } else {
        await coreAxios.post(API_PATHS.ADD_COMPANYINFO, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Company info added successfully.')
        await loadList()
      }
      setModalOpen(false)
      setEditingRow(null)
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data?.detail ?? err.response?.data?.error ?? err.message ?? 'Failed to save company info'
      setSaveError(Array.isArray(msg) ? msg.join(' ') : String(msg))
      toast.error(Array.isArray(msg) ? msg.join(' ') : String(msg))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    setDeleteError('')
    setDeleting(true)
    const comId = row.com_id ?? row.id
    try {
      await coreAxios.delete(API_PATHS.deleteCompanyInfo(comId))
      setRows((prev) => prev.filter((r) => (r.com_id ?? r.id) !== comId))
      setDeleteConfirm(null)
      setActionDropdown(null)
      toast.success('Company info deleted successfully.')
    } catch (err) {
      const msg = err.response?.status === 404 ? 'Company not found' : (err.response?.data?.message ?? err.response?.data?.detail ?? err.response?.data?.error ?? err.message ?? 'Failed to delete company info')
      setDeleteError(Array.isArray(msg) ? msg.join(' ') : String(msg))
      toast.error(Array.isArray(msg) ? msg.join(' ') : String(msg))
    } finally {
      setDeleting(false)
    }
  }

  const handleLogoFileChange = async (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) {
      setImagePreview('')
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(apiUrl(API_PATHS.UPLOAD), {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data.message || data.detail || 'Failed to upload image.'
        toast.error(msg)
        return
      }
      const url = data.url || data.img_url || data.path || data.file || ''
      if (url) {
        setForm((f) => ({ ...f, logo: url }))
        setImagePreview(url)
        toast.success('Logo uploaded.')
      } else {
        toast.error('Upload succeeded but no URL returned.')
      }
    } catch (err) {
      toast.error('Failed to upload logo.')
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
                <button type="button" onClick={() => { setActionDropdown(null); openEdit(actionDropdown.row); }}>
                  Edit
                </button>
                <button type="button" className="users-action-delete" onClick={() => { setActionDropdown(null); setDeleteConfirm(actionDropdown.row); }}>
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
    {
      field: 'com_id',
      header: 'ID',
      width: '70px',
      sortable: true,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'com_id'),
    },
    {
      field: 'company_name',
      header: 'Company Name',
      width: '180px',
      sortable: true,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'company_name'),
    },
    {
      field: 'title',
      header: 'Title',
      width: '140px',
      sortable: false,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'title'),
    },
    // {
    //   field: 'phone',
    //   header: 'Phone',
    //   width: '130px',
    //   sortable: false,
    //   sortableBody: (rowData) => tableBodyTemp(rowData, 'phone'),
    // },
    // {
    //   field: 'email',
    //   header: 'Email',
    //   width: '180px',
    //   sortable: false,
    //   sortableBody: (rowData) => tableBodyTemp(rowData, 'email'),
    // },
    {
      field: 'logo',
      header: 'Logo',
      width: '80px',
      sortable: false,
      sortableBody: (rowData) => {
        const url = rowData?.logo
        if (!url) return '—'
        return (
          <img
            src={url}
            alt="Company logo"
            style={{ width: 40, height: 28, objectFit: 'contain', borderRadius: 4, display: 'block' }}
          />
        )
      },
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
        <div className="users-loading">Loading company info…</div>
      </div>
    )
  }

  return (
    <div className="admin-users">
      {loadError && (
        <div className="users-error" style={{ marginBottom: '1rem' }}>
          {loadError}
          <Button variant="secondary" size="sm" onClick={() => { setLoadError(''); setLoading(true); loadList() }} style={{ marginLeft: '0.5rem' }}>
            Retry
          </Button>
        </div>
      )}
      <div className="users-toolbar">
        <div className="users-toolbar-left">
          <Button variant="success" onClick={openNew}>+ New</Button>
        </div>
      </div>

      {editLoading && <div className="users-loading users-loading-inline">Loading company…</div>}
      {editError && <div className="users-error users-error-inline">{editError}</div>}

      <div className="users-table-section">
        <Table
          columns={tableColumns}
          data={pageRows}
          emptyMessage="No company info found."
        />
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

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setSaveError(''); setEditingRow(null) }} title={editingRow ? 'Update Company Info' : 'Add New Company Info'} size="lg" className="users-modal-dialog">
        <form onSubmit={handleSave} className="users-form-grid">
          {saveError && <div className="users-error users-error-inline" style={{ gridColumn: '1 / -1' }}>{saveError}</div>}
          <div className="users-form-field">
            <InputField
              label="Company Name"
              name="own_com_name"
              value={form.company_name ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
              required
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Title"
              name="own_com_title"
              value={form.title ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          {/* <div className="users-form-field">
            <InputField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div> */}
          <div className="users-form-field users-form-field--full">
            <InputField
              label="Address"
              name="address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div className="users-form-field users-form-field--full">
            <label htmlFor="company-logo-file" className="users-form-label">Logo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                id="own-com-logo-file"
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const url = imagePreview || form.logo
                  if (url) window.open(url, '_blank', 'noopener,noreferrer')
                }}
                disabled={!imagePreview && !form.logo}
              >
                Preview
              </Button>
            </div>
          </div>
          <div className="users-form-field users-form-field--full">
            <TextareaField
              label="Description"
              name="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="users-form-actions">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => { setDeleteConfirm(null); setDeleteError('') }} title="Delete company info?" size="sm">
        {deleteConfirm && (
          <>
            <p>{deleteConfirm.company_name}</p>
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
