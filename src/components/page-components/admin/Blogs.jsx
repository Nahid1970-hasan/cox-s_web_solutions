import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import { Button, InputField, Modal, Table, Pagination } from '../../ui'
import { API_PATHS } from '../../../config/env'
import { coreAxios } from '../../../config/axios'
import '../../../css/components/Users.css'

// Map API project/blog shape to table row shape
function mapBlogFromApi(p) {
  return {
    id: p.project_id ?? p.id,
    project_name: String(p.project_name ?? ''),
    date: p.date ?? p.created_at ?? p.created_date ?? '',
    project_details: p.project_details ?? '',
    project_link: p.project_link ?? '',
    img_url: p.img_url ?? '',
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
    project_name: '',
    date: '',
    project_details: '',
    project_link: '',
    img_url: '',
  })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await coreAxios.get(API_PATHS.PROJECTS_LIST)
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
      project_name: '',
      date: '',
      project_details: '',
      project_link: '',
      img_url: '',
    })
    setSaveError('')
    setModalOpen(true)
  }

  const openEdit = async (row) => {
    setActionDropdown(null)
    setEditLoading(true)
    try {
      const { data } = await coreAxios.get(API_PATHS.projectDetail(row.id))
      const mapped = mapBlogFromApi(data)
      setEditingRow(mapped)
      setForm({
        project_name: mapped.project_name,
        date: mapped.date,
        project_details: mapped.project_details,
        project_link: mapped.project_link,
        img_url: mapped.img_url,
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
    formData.append('project_name', form.project_name.trim())
    if (form.date) formData.append('date', form.date)
    formData.append('project_details', form.project_details.trim())
    formData.append('project_link', form.project_link.trim())
    formData.append('img_url', form.img_url.trim())

    setSaveError('')
    setSaving(true)
    try {
      if (editingRow) {
        const { data } = await coreAxios.patch(API_PATHS.updateProject(editingRow.id), formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        const mapped = mapBlogFromApi(data)
        setRows((prev) => prev.map((r) => (r.id === editingRow.id ? mapped : r)))
        toast.success('Blog updated successfully.')
      } else {
        const { data } = await coreAxios.post(API_PATHS.ADD_PROJECT, formData, {
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
      await coreAxios.delete(API_PATHS.deleteProject(row.id))
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
      sortableBody: (rowData) => tableBodyTemp(rowData, 'id'),
    },
    {
      field: 'project_name',
      header: 'Title',
      width: '200px',
      sortableBody: (rowData) => tableBodyTemp(rowData, 'project_name'),
    },
    {
      field: 'date',
      header: 'Date',
      width: '140px',
      sortableBody: (rowData) => dateBodyTemp(rowData, 'date'),
    },
    {
      field: 'project_details',
      header: 'Details',
      width: '260px',
      sortableBody: (rowData) => {
        const v = rowData?.project_details ?? ''
        const text = String(v)
        const truncated = text.length > 120 ? `${text.slice(0, 117)}...` : text
        return truncated || '—'
      },
    },
    {
      field: 'project_link',
      header: 'Link',
      width: '160px',
      sortableBody: (rowData) => {
        const url = rowData?.project_link
        if (!url) return '—'
        return (
          <a href={url} target="_blank" rel="noreferrer" className="ui-table-link">
            {rowData?.project_link}
          </a>
        )
      },
    },
    {
      field: 'img_url',
      header: 'Image',
      width: '160px',
      sortableBody: (rowData) => {
        const url = rowData?.img_url
        if (!url) return '—'
        return (
          <img
            src={url}
            alt={rowData?.project_name || 'Blog image'}
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
    </div>
  )
}
