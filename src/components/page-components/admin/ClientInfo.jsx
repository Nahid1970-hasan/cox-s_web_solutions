import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import { Button, Modal, Table, Pagination } from '../../ui'
import { API_PATHS } from '../../../config/env'
import { coreAxios } from '../../../config/axios'
import '../../../css/components/Users.css'

function mapContactFromApi(c) {
  const name =
    c.name ??
    c.full_name ??
    (c.first_name || c.last_name ? [c.first_name, c.last_name].filter(Boolean).join(' ').trim() : '') ??
    ''
  return {
    id: c.id ?? c.contact_id ?? c.pk,
    name: String(name),
    email: c.email ?? '',
    phone: c.phone ?? c.phone_number ?? '',
    subject: c.subject ?? c.topic ?? '',
    message: c.message ?? c.content ?? '',
    createdAt: c.created_at ?? c.created_date ?? c.date ?? '',
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

export default function ClientInfo() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [actionDropdown, setActionDropdown] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await coreAxios.get(API_PATHS.CONTACTS_LIST)
        const list = Array.isArray(data) ? data : data.results ?? []
        const mapped = (Array.isArray(list) ? list : []).map(mapContactFromApi)
        setRows(mapped)
      } catch (err) {
        const msg =
          err.response?.data?.message ??
          err.response?.data?.detail ??
          err.message ??
          'Failed to load client info'
        const text = Array.isArray(msg) ? msg.join(' ') : String(msg)
        setLoadError(text)
        toast.error(text)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage))
  const start = (page - 1) * rowsPerPage
  const pageRows = rows.slice(start, start + rowsPerPage)

  const handleDelete = async (row) => {
    setDeleteError('')
    setDeleting(true)
    try {
      await coreAxios.delete(API_PATHS.deleteContact(row.id))
      setRows((prev) => prev.filter((r) => r.id !== row.id))
      setDeleteConfirm(null)
      setActionDropdown(null)
      toast.success('Client record deleted successfully.')
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        err.response?.data?.detail ??
        err.response?.data?.error ??
        err.message ??
        'Failed to delete client record'
      const text = Array.isArray(msg) ? msg.join(' ') : String(msg)
      setDeleteError(text)
      toast.error(text)
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
                <button
                  type="button"
                  className="users-action-delete"
                  onClick={() => {
                    setActionDropdown(null)
                    setDeleteConfirm(actionDropdown.row)
                  }}
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
    {
      field: 'id',
      header: 'ID',
      width: '60px',
      sortable: true,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'id'),
    },
    {
      field: 'name',
      header: 'Client Name',
      width: '200px',
      sortable: true,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'name'),
    },
    {
      field: 'email',
      header: 'Email',
      width: '200px',
      sortable: false,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'email'),
    },
    {
      field: 'phone',
      header: 'Phone',
      width: '160px',
      sortable: false,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'phone'),
    },
    {
      field: 'subject',
      header: 'Subject',
      width: '220px',
      sortable: false,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'subject'),
    },
    {
      field: 'message',
      header: 'Message',
      width: '260px',
      sortable: false,
      sortableBody: (rowData) => {
        const text = String(rowData?.message ?? '')
        const truncated = text.length > 120 ? `${text.slice(0, 117)}...` : text
        return truncated || '—'
      },
    },
    {
      field: 'createdAt',
      header: 'Date',
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
        <div className="users-loading">Loading client info…</div>
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
      <div className="users-table-section">
        <Table columns={tableColumns} data={pageRows} emptyMessage="No client info found." />
      </div>

      <div className="users-footer">
        <div className="users-footer-right">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onRowsPerPageChange={(n) => {
              setRowsPerPage(n)
              setPage(1)
            }}
          />
        </div>
      </div>

      <Modal
        open={!!deleteConfirm}
        onClose={() => {
          setDeleteConfirm(null)
          setDeleteError('')
        }}
        title="Delete client record?"
        size="sm"
      >
        {deleteConfirm && (
          <>
            <p>
              {deleteConfirm.name} ({deleteConfirm.email})
            </p>
            {deleteError && <div className="users-error users-error-inline">{deleteError}</div>}
            <div className="ui-modal-actions">
              <Button
                variant="ghost"
                onClick={() => {
                  setDeleteConfirm(null)
                  setDeleteError('')
                }}
                disabled={deleting}
              >
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

