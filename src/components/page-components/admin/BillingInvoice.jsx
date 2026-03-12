import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import { Button, Table, Pagination, Modal, InputField, TextareaField } from '../../ui'
import { API_PATHS } from '../../../config/env'
import { coreAxios } from '../../../config/axios'
import '../../../css/components/Users.css'

function mapContactToInvoice(c) {
  const name =
    c.name ??
    c.full_name ??
    (c.first_name || c.last_name ? [c.first_name, c.last_name].filter(Boolean).join(' ').trim() : '') ??
    ''
  return {
    id: c.id ?? c.contact_id ?? c.pk,
    clientName: String(name),
    email: c.email ?? '',
    phone: c.phone ?? c.phone_number ?? '',
    project: c.project ?? c.subject ?? '',
    amount: c.amount ?? c.total ?? '',
    status: (c.status ?? 'pending').toString().toLowerCase(),
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

export default function BillingInvoice() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [actionDropdown, setActionDropdown] = useState(null)
  const [form, setForm] = useState({
    companyName: '',
    companyPhone: '',
    companyLogoFile: null,
    invoiceNumber: '',
    invoiceDate: '',
    terms: '',
    dueDate: '',
    billToName: '',
    billToPhone: '',
    billToAddress: '',
    items: [
      { description: '', details: '', qty: '1', rate: '0', amount: '0' },
    ],
    subTotal: '',
    taxRate: '',
    total: '',
    balanceDue: '',
    termsConditions: '',
  })

  const handleEditRow = (row) => {
    toast.info(`Edit invoice #${row.id} coming soon.`)
  }

  const handleDeleteRow = (row) => {
    toast.info(`Delete invoice #${row.id} coming soon.`)
  }

  const handleInvoiceRow = (row) => {
    const safeRow = {
      clientName: row.clientName || "Jack Little",
      email: row.email || "jack.little@example.com",
      phone: row.phone || "+1 (555) 123-4567",
      project: row.project || "Web Design packages (Simple)",
      amount: row.amount && !Number.isNaN(Number(row.amount)) ? Number(row.amount) : 19320,
      id: row.id || "INV-000001",
      createdAt: row.createdAt,
    }

    const invoiceDate = safeRow.createdAt ? new Date(safeRow.createdAt) : new Date()

    const dateStr = invoiceDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    const amount = Number(safeRow.amount || 0)
    const taxRate = 5
    const taxAmount = (amount * taxRate) / 100
    const total = amount + taxAmount

    const html = `
      <html>
        <head>
          <title>Invoice #${safeRow.id}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 32px 40px; color: #333; background: #ffffff; }
            .invoice-toolbar { position: fixed; top: 16px; right: 24px; display: flex; gap: 8px; z-index: 1000; }
            .invoice-toolbar button { padding: 6px 10px; font-size: 12px; border-radius: 4px; border: 1px solid #b15a17; background: #b15a17; color: #fff; cursor: pointer; }
            .invoice-toolbar button.secondary { background: #fff; color: #b15a17; }
            .top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; margin-top: 16px; }
            .brand { display: flex; align-items: center; gap: 16px; }
            .brand-circle { width: 56px; height: 56px; border-radius: 50%; background: #b15a17; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; }
            .brand-text { font-size: 14px; line-height: 1.4; }
            .brand-text strong { display: block; font-size: 16px; }
            .company-address { text-align: right; font-size: 13px; line-height: 1.5; }
            .title-row { text-align: center; margin: 16px 0 32px; font-size: 20px; letter-spacing: 1px; color: #b15a17; font-weight: 600; }
            .meta-grid { display: flex; justify-content: space-between; gap: 32px; margin-bottom: 32px; }
            .bill-ship { font-size: 13px; line-height: 1.5; }
            .bill-ship-title { font-weight: 600; margin-bottom: 4px; }
            .bill-name { font-weight: 700; margin-bottom: 2px; }
            .invoice-meta-table { border-collapse: collapse; font-size: 12px; }
            .invoice-meta-table th { background: #b15a17; color: #fff; padding: 6px 10px; text-align: left; font-weight: 600; }
            .invoice-meta-table td { border: 1px solid #e3e3e3; padding: 6px 10px; }
            .line-items { margin-top: 8px; border-collapse: collapse; width: 100%; font-size: 13px; }
            .line-items th { background: #b15a17; color: #fff; padding: 8px 10px; text-align: left; font-weight: 600; }
            .line-items td { border: 1px solid #e3e3e3; padding: 8px 10px; vertical-align: top; }
            .line-items tbody tr:nth-child(even) { background: #fafafa; }
            .note { font-size: 12px; margin-top: 16px; }
            .totals-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
            .totals { width: 260px; font-size: 13px; }
            .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
            .totals-row.total { font-weight: 700; font-size: 14px; margin-top: 4px; }
            .balance-due { margin-top: 12px; background: #b15a17; color: #fff; padding: 8px 12px; display: flex; justify-content: space-between; font-weight: 700; font-size: 14px; }
            .terms { font-size: 12px; margin-top: 24px; }
            .terms-title { font-weight: 600; margin-bottom: 4px; }
            @media print {
              .invoice-toolbar { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-toolbar">
            <button class="secondary" onclick="window.print()">Print</button>
         
          </div>
          <div class="top-bar">
            <div class="brand">
              <img src={logo} alt="Cox's Web Solutions" style={{ width: '220px', height: 'auto' }} />
            </div>
            <div class="company-address">
              Cox's Web Solutions<br/>
              14B, Northern Street<br/>
              Greater South Avenue<br/>
              New York 10001<br/>
              U.S.A
            </div>
          </div>

          <div class="title-row">PROFORMA INVOICE</div>

          <div class="meta-grid">
            <div class="bill-ship">
              <div class="bill-ship-title">Bill To</div>
              <div class="bill-name">${safeRow.clientName}</div>
              <div>${safeRow.email}</div>
              <div>${safeRow.phone}</div>
            </div>
            <table class="invoice-meta-table">
              <tr>
                <th>Invoice#</th>
                <td>${safeRow.id}</td>
              </tr>
              <tr>
                <th>Invoice Date</th>
                <td>${dateStr}</td>
              </tr>
              <tr>
                <th>Terms</th>
                <td>Due on Receipt</td>
              </tr>
              <tr>
                <th>Due Date</th>
                <td>${dateStr}</td>
              </tr>
            </table>
          </div>

          <table class="line-items">
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Item & Description</th>
                <th style="width: 70px;">Qty</th>
                <th style="width: 90px;">Rate</th>
                <th style="width: 110px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  ${safeRow.project}
                  <div style="font-size: 11px; color: #666; margin-top: 2px;">
                    Auto-generated invoice based on contact record.
                  </div>
                </td>
                <td>1.00</td>
                <td>${amount.toFixed(2)}</td>
                <td>${amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="note">
            Thanks for your business.
          </div>

          <div class="totals-wrap">
            <div class="totals">
              <div class="totals-row">
                <span>Sub Total</span>
                <span>${amount.toFixed(2)}</span>
              </div>
              <div class="totals-row">
                <span>Tax Rate</span>
                <span>${taxRate.toFixed(1)}%</span>
              </div>
              <div class="totals-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="balance-due">
            <span>Balance Due</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div style="margin-top: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div class="terms" style="max-width: 60%; font-size: 12px;">
              <div class="terms-title">Terms &amp; Conditions</div>
              <div>All payments must be made in full before the commencement of any design work.</div>
            </div>
            <div style="width: 260px; text-align: right; font-size: 12px;">
              <div style="height: 40px; border-bottom: 1px solid #999;"></div>
              <div style="margin-top: 4px; font-weight: 600;">Founder Signature</div>
              <div style="color: #666; margin-top: 2px;">Cox's Web Solutions</div>
            </div>
          </div>
        </body>
      </html>`

    try {
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      toast.error('Unable to open invoice preview.')
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
        Invoice ▾
        </Button>
        {open &&
          createPortal(
            <>
              <div
                className="users-action-backdrop"
                onClick={() => setActionDropdown(null)}
                aria-hidden
              />
              <div
                className="users-action-dropdown users-action-dropdown--fixed"
                style={{ left: actionDropdown.left, top: actionDropdown.top }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActionDropdown(null)
                    handleEditRow(actionDropdown.row)
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="users-action-delete"
                  onClick={() => {
                    setActionDropdown(null)
                    handleDeleteRow(actionDropdown.row)
                  }}
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActionDropdown(null)
                    handleInvoiceRow(actionDropdown.row)
                  }}
                >
                  Invoice
                </button>
              </div>
            </>,
            document.body
          )}
      </div>
    )
  }

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await coreAxios.get(API_PATHS.CONTACTS_LIST)
        const list = Array.isArray(data) ? data : data.results ?? []
        const mapped = (Array.isArray(list) ? list : []).map(mapContactToInvoice)
        setRows(mapped)
      } catch (err) {
        const msg =
          err.response?.data?.message ??
          err.response?.data?.detail ??
          err.message ??
          'Failed to load billing invoices'
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

  const openNew = () => {
    setForm((prev) => ({
      ...prev,
      companyName: '',
      companyPhone: '',
      companyLogoFile: null,
      invoiceNumber: '',
      invoiceDate: '',
      terms: 'Due on Receipt',
      dueDate: '',
      billToName: '',
      billToPhone: '',
      billToAddress: '',
      items: [
        { description: '', details: '', qty: '1', rate: '0', amount: '0' },
      ],
      subTotal: '',
      taxRate: '5',
      total: '',
      balanceDue: '',
      termsConditions: 'All payments must be made in full before the commencement of any design work.',
    }))
    setSaveError('')
    setModalOpen(true)
  }

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const items = prev.items.map((it, i) => (i === index ? { ...it, [field]: value } : it))
      return { ...prev, items }
    })
  }

  const addItemRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', details: '', qty: '1', rate: '0', amount: '0' }],
    }))
  }

  const removeItemRow = (index) => {
    setForm((prev) => {
      if (prev.items.length === 1) return prev
      const items = prev.items.filter((_, i) => i !== index)
      return { ...prev, items }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      // For now just simulate save and push a simple row into table,
      // wired similar to Blogs/Users pages. You can replace with real API.
      const newRow = {
        id: rows.length ? Math.max(...rows.map((r) => Number(r.id) || 0)) + 1 : 1,
        clientName: form.billToName || 'New Client',
        email: '',
        phone: form.billToPhone || '',
        project: form.items[0]?.description || 'New Project',
        amount: form.total || form.balanceDue || '0',
        status: 'pending',
        createdAt: form.invoiceDate || new Date().toISOString(),
      }
      setRows((prev) => [...prev, newRow])
      toast.success('Invoice draft created (front-end only).')
      setModalOpen(false)
    } catch (err) {
      setSaveError('Failed to save invoice.')
      toast.error('Failed to save invoice.')
    } finally {
      setSaving(false)
    }
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
      field: 'clientName',
      header: 'Client Name',
      width: '200px',
      sortable: true,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'clientName'),
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
      field: 'project',
      header: 'Project / Subject',
      width: '220px',
      sortable: false,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'project'),
    },
    {
      field: 'amount',
      header: 'Amount',
      width: '140px',
      sortable: false,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'amount'),
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
        <div className="users-loading">Loading invoices…</div>
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

      <div className="users-table-section">
        <Table columns={tableColumns} data={pageRows} emptyMessage="No invoices found." />
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
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSaveError('')
        }}
        title="New Invoice"
        size="lg"
        width="900px"
        className="users-modal-dialog"
      >
        <form onSubmit={handleSave} className="users-form-grid">
          {saveError && (
            <div className="users-error users-error-inline" style={{ gridColumn: '1 / -1' }}>
              {saveError}
            </div>
          )}

          <div className="users-form-field users-form-field--full">
            <div className="invoice-company-row">
              <div className="invoice-company-col">
                <InputField
                  label="Company Name"
                  name="companyName"
                  value={form.companyName}
                  onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
                />
              </div>
              <div className="invoice-company-col">
                <InputField
                  label="Company Phone"
                  name="companyPhone"
                  value={form.companyPhone}
                  onChange={(e) => setForm((prev) => ({ ...prev, companyPhone: e.target.value }))}
                />
              </div>
              <div className="invoice-company-col invoice-company-logo">
                <label className="users-form-label" htmlFor="company-logo-file" style={{ marginBottom: '10px' }}>Company Logo</label>
                <input
                  id="company-logo-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0]
                    setForm((prev) => ({ ...prev, companyLogoFile: file || null }))
                  }}
                />
              </div>
            </div>
          </div>

          <div className="users-form-field users-form-field--full">
            <InputField
              label="Invoice Number"
              name="invoiceNumber"
              value={form.invoiceNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
            />
          </div>

          <div className="users-form-field">
            <InputField
              label="Invoice Date"
              name="invoiceDate"
              type="date"
              value={form.invoiceDate}
              onChange={(e) => setForm((prev) => ({ ...prev, invoiceDate: e.target.value }))}
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Terms"
              name="terms"
              value={form.terms}
              onChange={(e) => setForm((prev) => ({ ...prev, terms: e.target.value }))}
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Due Date"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <div className="users-form-field">
            <InputField
              label="Bill To - Name"
              name="billToName"
              value={form.billToName}
              onChange={(e) => setForm((prev) => ({ ...prev, billToName: e.target.value }))}
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Bill To - Phone"
              name="billToPhone"
              value={form.billToPhone}
              onChange={(e) => setForm((prev) => ({ ...prev, billToPhone: e.target.value }))}
            />
          </div>
          <div className="users-form-field users-form-field--full">
            <TextareaField
              label="Bill To - Address"
              name="billToAddress"
              value={form.billToAddress}
              onChange={(e) => setForm((prev) => ({ ...prev, billToAddress: e.target.value }))}
            />
          </div>

         
         

          <div className="users-form-field users-form-field--full">
            <label className="users-form-label">Items</label>
            <div className="invoice-items-grid">
              <div className="invoice-items-header">
                <span>#</span>
                <span>Item & Description</span>
                <span>Qty</span>
                <span>Rate</span>
                <span>Amount</span>
                <span>Actions</span>
              </div>
              {form.items.map((item, index) => (
                <div className="invoice-items-row" key={index}>
                  <span>{index + 1}</span>
                  <div className="invoice-items-desc">
                    <InputField
                      label=""
                      placeholder="Item name"
                      name={`item-${index}-description`}
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    />
                    <TextareaField
                      label=""
                      placeholder="Short details"
                      name={`item-${index}-details`}
                      value={item.details}
                      onChange={(e) => handleItemChange(index, 'details', e.target.value)}
                    />
                  </div>
                  <InputField
                    label=""
                    name={`item-${index}-qty`}
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                  />
                  <InputField
                    label=""
                    name={`item-${index}-rate`}
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                  />
                  <InputField
                    label=""
                    name={`item-${index}-amount`}
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                  />
                  <div className="invoice-items-actions">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addItemRow}
                    >
                      +
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItemRow(index)}
                      disabled={form.items.length === 1}
                    >
                      −
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="users-form-field">
            <InputField
              label="Sub Total"
              name="subTotal"
              value={form.subTotal}
              onChange={(e) => setForm((prev) => ({ ...prev, subTotal: e.target.value }))}
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Tax Rate (%)"
              name="taxRate"
              value={form.taxRate}
              onChange={(e) => setForm((prev) => ({ ...prev, taxRate: e.target.value }))}
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Total"
              name="total"
              value={form.total}
              onChange={(e) => setForm((prev) => ({ ...prev, total: e.target.value }))}
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Balance Due"
              name="balanceDue"
              value={form.balanceDue}
              onChange={(e) => setForm((prev) => ({ ...prev, balanceDue: e.target.value }))}
            />
          </div>

          <div className="users-form-field users-form-field--full">
            <TextareaField
              label="Terms & Conditions"
              name="termsConditions"
              value={form.termsConditions}
              onChange={(e) => setForm((prev) => ({ ...prev, termsConditions: e.target.value }))}
            />
          </div>

          <div className="users-form-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setModalOpen(false)
                setSaveError('')
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

