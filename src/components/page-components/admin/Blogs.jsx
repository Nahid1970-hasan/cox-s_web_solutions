import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import { Button, InputField, Modal, Table, Pagination, TextareaField } from '../../ui'
import { apiUrl, API_PATHS } from '../../../config/env'
import { coreAxios } from '../../../config/axios'
import '../../../css/components/Users.css'

const STATUS_OPTIONS = [
  { value: 'incoming', label: 'Incoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
]

// Map API blog shape to table row shape
function mapBlogFromApi(p) {
  return {
    id: p.blog_id ?? p.id,
    blog_title: String(p.blog_title ?? ''),
    date: p.date ?? p.created_at ?? p.created_date ?? '',
    blog_content: p.blog_content ?? '',
    blog_link: p.blog_link ?? '',
    img_url: p.img_url ?? '',
    status: (p.status ?? p.blog_status ?? 'incoming').toLowerCase(),
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

export default function Blogs() {
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
    blog_title: '',
    date: '',
    blog_content: '',
    blog_link: '',
    img_url: '',
    status: 'incoming',
  })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await coreAxios.get(API_PATHS.BLOGS_LIST)
        const list = Array.isArray(data) ? data : (data.results ?? [])
        const mapped = (Array.isArray(list) ? list : []).map(mapBlogFromApi)
        setRows(mapped)
      } catch (err) {
        const msg = err.response?.status === 401 ? 'Unauthorized' : (err.response?.data?.message ?? err.response?.data?.detail ?? err.message ?? 'Failed to load blogs')
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
    setForm({
      blog_title: '',
      date: '',
      blog_content: '',
      blog_link: '',
      img_url: '',
      status: 'incoming',
    })
    setSaveError('')
    setModalOpen(true)
  }

  const openEdit = async (row) => {
    setActionDropdown(null)
    setEditLoading(true)
    try {
      const { data } = await coreAxios.get(API_PATHS.blogDetail(row.id))
      const mapped = mapBlogFromApi(data)
      setEditingRow(mapped)
      setForm({
        blog_title: mapped.blog_title,
        date: mapped.date,
        blog_content: mapped.blog_content,
        blog_link: mapped.blog_link,
        img_url: mapped.img_url,
        status: mapped.status || 'incoming',
      })
      setModalOpen(true)
    } catch (err) {
      const msg = err.response?.status === 404 ? 'Blog not found' : (err.response?.data?.message ?? err.response?.data?.detail ?? err.message ?? 'Failed to load blog')
      const text = Array.isArray(msg) ? msg.join(' ') : String(msg)
      setEditError(text)
      toast.error(text)
    } finally {
      setEditLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('blog_title', form.blog_title.trim())
    if (form.date) formData.append('date', form.date)
    formData.append('blog_content', form.blog_content.trim())
    formData.append('blog_link', form.blog_link.trim())
    formData.append('img_url', form.img_url.trim())
    formData.append('status', (form.status || 'incoming').toLowerCase())

    setSaveError('')
    setSaving(true)
    try {
      if (editingRow) {
        const { data } = await coreAxios.patch(API_PATHS.updateBlog(editingRow.id), formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        const mapped = mapBlogFromApi(data)
        setRows((prev) => prev.map((r) => (r.id === editingRow.id ? mapped : r)))
        toast.success('Blog updated successfully.')
      } else {
        const { data } = await coreAxios.post(API_PATHS.ADD_BLOG, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        const mapped = mapBlogFromApi(data)
        setRows((prev) => [...prev, mapped])
        toast.success('Blog added successfully.')
      }
      setModalOpen(false)
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data?.detail ?? err.response?.data?.error ?? err.message ?? 'Failed to save blog'
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
      await coreAxios.delete(API_PATHS.deleteBlog(row.id))
      setRows((prev) => prev.filter((r) => r.id !== row.id))
      setDeleteConfirm(null)
      setActionDropdown(null)
      toast.success('Blog deleted successfully.')
    } catch (err) {
      const msg = err.response?.status === 404 ? 'Blog not found' : (err.response?.data?.message ?? err.response?.data?.detail ?? err.response?.data?.error ?? err.message ?? 'Failed to delete blog')
      setDeleteError(Array.isArray(msg) ? msg.join(' ') : String(msg))
      toast.error(Array.isArray(msg) ? msg.join(' ') : String(msg))
    } finally {
      setDeleting(false)
    }
  }

  const handleImageFileChange = async (e) => {
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
        setForm((f) => ({ ...f, img_url: url }))
        setImagePreview(url)
        toast.success('Image uploaded.')
      } else {
        toast.error('Upload succeeded but no URL returned.')
      }
    } catch (err) {
      toast.error('Failed to upload image.')
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
      field: 'id',
      header: 'ID',
      width: '60px',
      sortable: true,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'id'),
    },
    {
      field: 'blog_title',
      header: 'Title',
      width: '200px',
      sortable: true,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'blog_title'),
    },
    {
      field: 'blog_link',
      header: 'Link',
      width: '220px',
      sortable: false,
      sortableBody: (rowData) => {
        const url = rowData?.blog_link
        if (!url) return '—'
        return (
          <a href={url} target="_blank" rel="noreferrer" className="ui-table-link">
            {rowData?.blog_link}
          </a>
        )
      },
    },
   
    {
      field: 'blog_content',
      header: 'Details',
      width: '260px',
      sortable: false,
      sortableBody: (rowData) => {
        const v = rowData?.blog_content ?? ''
        const text = String(v)
        const truncated = text.length > 120 ? `${text.slice(0, 117)}...` : text
        return truncated || '—'
      },
    },
    {
      field: 'date',
      header: 'Date',
      width: '140px',
      sortable: true,
      sortValue: (row) => row?.date ?? '',
      sortableBody: (rowData) => dateBodyTemp(rowData, 'date'),
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
      field: 'img_url',
      header: 'Image',
      width: '160px',
      sortable: false,
      sortableBody: (rowData) => {
        const url = rowData?.img_url
        if (!url) return '—'
        return (
          <img
            src={url}
            alt={rowData?.blog_title || 'Blog image'}
            style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4, display: 'block' }}
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
        <div className="users-loading">Loading blogs…</div>
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

      {editLoading && <div className="users-loading users-loading-inline">Loading blog…</div>}
      {editError && <div className="users-error users-error-inline">{editError}</div>}

      <div className="users-table-section">
        <Table
          columns={tableColumns}
          data={pageRows}
          emptyMessage="No blogs found."
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

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setSaveError('') }} title={editingRow ? 'Update Blog' : 'Add New Blog'} size="lg" className="users-modal-dialog">
        <form onSubmit={handleSave} className="users-form-grid">
          {saveError && <div className="users-error users-error-inline" style={{ gridColumn: '1 / -1' }}>{saveError}</div>}
          <div className="users-form-field">
            <InputField
              label="Title"
              name="blog_title"
              value={form.blog_title}
              onChange={(e) => setForm((f) => ({ ...f, blog_title: e.target.value }))}
              required
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div className="users-form-field">
            <label htmlFor="blog-status" className="users-form-label">Status</label>
            <select
              id="blog-status"
              value={form.status || 'incoming'}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              style={{ width: '100%', padding: '8px 12px', fontSize: '1rem', borderRadius: 4, border: '1px solid #ccc' }}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="users-form-field">
            <InputField
              label="Blog Link"
              name="blog_link"
              type="url"
              value={form.blog_link}
              onChange={(e) => setForm((f) => ({ ...f, blog_link: e.target.value }))}
              placeholder="https://example.com/blog"
            />
          </div>
          <div className="users-form-field">
            <label htmlFor="blog-image-file" className="users-upload-label">Upload Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                id="blog-image-file"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const url = imagePreview || form.img_url
                  if (url) window.open(url, '_blank', 'noopener,noreferrer')
                }}
                disabled={!imagePreview && !form.img_url}
              >
                Preview
              </Button>
            </div>
          </div>
          <div className="users-form-field users-form-field--full">
            <TextareaField
              label="Content"
              name="blog_content"
              value={form.blog_content}
              onChange={(e) => setForm((f) => ({ ...f, blog_content: e.target.value }))}
            />
          </div>
         
          <div className="users-form-actions">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>Reset</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => { setDeleteConfirm(null); setDeleteError('') }} title="Delete blog?" size="sm">
        {deleteConfirm && (
          <>
            <p>{deleteConfirm.blog_title}</p>
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
