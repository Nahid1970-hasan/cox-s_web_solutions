import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import { Button, Table, Pagination, Modal, InputField, TextareaField } from '../../ui'
import { API_PATHS } from '../../../config/env'
import { coreAxios } from '../../../config/axios'
import '../../../css/components/Users.css'
import logoJpeg from '../../../assets/img/logo.jpeg'

/** Fetch image URL and return as data URL so it displays in blob/print PDF. */
async function fetchImageAsDataUrl(url) {
  if (!url || typeof url !== 'string') return null
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/** Map API invoice (snake_case) to table row. Uses id for API calls, all API fields on row for display. */
function mapApiToInvoice(api) {
  if (!api || typeof api !== 'object') {
    return {
      id: '',
      invoice_id: '',
      own_com_name: '',
      own_com_title: '',
      own_com_logo: '',
      client_name: '',
      client_id: '',
      client_company: '',
      client_phone: '',
      client_address: '',
      unit_price: '',
      total_price: '',
      billing_description: '',
      invoice_date: '',
      subtotal: '',
      discount: '',
      invoice_no: '',
    }
  }
  return {
    id: api.invoice_id ?? api.id ?? api.pk ?? '',
    invoice_id: api.invoice_id ?? api.id ?? api.pk ?? '',
    invoice_no: api.invoice_no ?? '',
    own_com_name: api.own_com_name ?? '',
    own_com_title: api.own_com_title ?? '',
    own_com_logo: api.own_com_logo ?? '',
    client_name: api.client_name ?? '',
    client_id: api.client_id ?? '',
    client_company: api.client_company ?? '',
    client_phone: api.client_phone ?? '',
    client_address: api.client_address ?? '',
    unit_price: api.unit_price ?? '',
    total_price: api.total_price ?? '',
    billing_description: api.billing_description ?? '',
    invoice_date: api.invoice_date ?? '',
    subtotal: api.subtotal ?? '',
    discount: api.discount ?? '',
    invoice_no: api.invoice_no ?? '',
  }
}

/** Format value for input type="date" (YYYY-MM-DD). */
function toDateInputValue(val) {
  if (val == null || val === '') return ''
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

/** Map API invoice detail to form state (camelCase). */
function mapInvoiceDetailToForm(api) {
  if (!api || typeof api !== 'object') {
    return {
      ownComName: '',
      ownComTitle: '',
      ownComLogoFile: null,
      ownComLogoUrl: '',
      clientName: '',
      clientId: '',
      clientCompany: '',
      clientPhone: '',
      clientAddress: '',
      unitPrice: '',
      totalPrice: '',
      billingDescription: '',
      invoiceDate: '',
      subtotal: '',
      discount: '',
      invoice_no: '',
    }
  }
  return {
    ownComName: api.own_com_name ?? '',
    ownComTitle: api.own_com_title ?? '',
    ownComLogoFile: null,
    ownComLogoUrl: api.own_com_logo ?? '',
    clientName: api.client_name ?? '',
    clientId: String(api.client_id ?? ''),
    clientCompany: api.client_company ?? '',
    clientPhone: api.client_phone ?? '',
    clientAddress: api.client_address ?? '',
    unitPrice: String(api.unit_price ?? ''),
    totalPrice: String(api.total_price ?? ''),
    billingDescription: api.billing_description ?? '',
    invoiceDate: toDateInputValue(api.invoice_date),
    subtotal: String(api.subtotal ?? ''),
    discount: String(api.discount ?? ''),
    invoice_no: String(api.invoice_no ?? ''),
  }
}

/** Build API payload (snake_case) from form state. Omits undefined/null. */
function formToApiPayload(form) {
  const raw = {
    own_com_name: form.ownComName || undefined,
    own_com_title: form.ownComTitle || undefined,
    own_com_logo: form.ownComLogoUrl || undefined,
    client_name: form.clientName || undefined,
    client_id: form.clientId || undefined,
    client_company: form.clientCompany || undefined,
    client_phone: form.clientPhone || undefined,
    client_address: form.clientAddress || undefined,
    unit_price: form.unitPrice || undefined,
    total_price: form.totalPrice || undefined,
    billing_description: form.billingDescription || undefined,
    invoice_date: form.invoiceDate || undefined,
    subtotal: form.subtotal || undefined,
    discount: form.discount || undefined,
    invoice_no: form.invoice_no || undefined,
  }
  return Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== undefined && v !== null)
  )
}

/** Parse a numeric value from form input; returns 0 if invalid. */
function parseNum(v) {
  if (v == null || v === '') return 0
  const n = parseFloat(String(v).replace(/,/g, ''))
  return Number.isNaN(n) ? 0 : n
}

/** Calculate total_price from subtotal and discount %: total = subtotal × (1 − discount/100). */
function calcTotalPrice(subtotal, discountPercent) {
  const sub = parseNum(subtotal)
  const pct = Math.min(100, Math.max(0, parseNum(discountPercent)))
  const total = sub * (1 - pct / 100)
  const rounded = Math.max(0, Math.round(total * 100) / 100)
  return sub === 0 && pct === 0 ? '' : rounded.toFixed(2)
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
  const [editingRow, setEditingRow] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [actionDropdown, setActionDropdown] = useState(null)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [pdfModalLoading, setPdfModalLoading] = useState(false)
  const [pdfModalError, setPdfModalError] = useState('')
  const [pdfModalInvoiceId, setPdfModalInvoiceId] = useState(null)
  const [pdfForm, setPdfForm] = useState(null)
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [pdfUpdating, setPdfUpdating] = useState(false)
  const [form, setForm] = useState({
    ownComName: '',
    ownComTitle: '',
    ownComLogoFile: null,
    ownComLogoUrl: '',
    clientName: '',
    clientId: '',
    clientCompany: '',
    clientPhone: '',
    clientAddress: '',
    unitPrice: '',
    totalPrice: '',
    billingDescription: '',
    invoiceDate: '',
    subtotal: '',
    discount: '',
    invoice_no: '',
  })

  const openEdit = async (row) => {
    setActionDropdown(null)
    const invoiceId = row.invoice_id ?? row.id
    if (!invoiceId && invoiceId !== 0) {
      toast.error('Invalid invoice: missing invoice_id')
      return
    }
    setEditLoading(true)
    setEditError('')
    try {
      const { data } = await coreAxios.get(API_PATHS.invoiceDetail(invoiceId))
      const raw =
        data != null && typeof data === 'object' && !Array.isArray(data) && (data.data ?? data.invoice ?? data.result)
          ? data.data ?? data.invoice ?? data.result
          : data
      const mapped = mapApiToInvoice(raw)
      setEditingRow(mapped)
      setForm(mapInvoiceDetailToForm(raw))
      setSaveError('')
      setModalOpen(true)
    } catch (err) {
      const msg =
        err.response?.status === 404
          ? 'Invoice not found'
          : err.response?.data?.message ??
            err.response?.data?.detail ??
            err.message ??
            'Failed to load invoice'
      const text = Array.isArray(msg) ? msg.join(' ') : String(msg)
      setEditError(text)
      toast.error(text)
    } finally {
      setEditLoading(false)
    }
  }

  const handleEditRow = (row) => {
    openEdit(row)
  }

  const handleDeleteRow = (row) => {
    setActionDropdown(null)
    setDeleteConfirm(row)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    setDeleteError('')
    setDeleting(true)
    try {
      await coreAxios.delete(API_PATHS.deleteInvoice(deleteConfirm.id))
      setRows((prev) => prev.filter((r) => r.id !== deleteConfirm.id))
      setDeleteConfirm(null)
      toast.success('Invoice deleted successfully.')
    } catch (err) {
      const msg =
        err.response?.status === 404
          ? 'Invoice not found'
          : err.response?.data?.message ??
            err.response?.data?.detail ??
            err.message ??
            'Failed to delete invoice'
      const text = Array.isArray(msg) ? msg.join(' ') : String(msg)
      setDeleteError(text)
      toast.error(text)
    } finally {
      setDeleting(false)
    }
  }

  const handleInvoiceRow = async (row) => {
    const invoiceId = row.invoice_id ?? row.id
    if (invoiceId == null && invoiceId !== 0) {
      toast.error('Invalid invoice: missing invoice_id')
      return
    }
    setActionDropdown(null)
    setPdfModalInvoiceId(invoiceId)
    setPdfModalOpen(true)
    setPdfModalLoading(true)
    setPdfModalError('')
    setPdfForm(null)
    try {
      const { data } = await coreAxios.get(API_PATHS.invoiceGenerate(invoiceId))
      const raw = data != null && typeof data === 'object' && (data.data ?? data.invoice ?? data.result)
        ? (data.data ?? data.invoice ?? data.result)
        : data
      if (!raw || typeof raw !== 'object') {
        setPdfModalError('Invalid response from invoice generate API')
        toast.error('Invalid response from invoice generate API')
        return
      }
      setPdfForm(mapInvoiceDetailToForm(raw))
      setPdfModalError('')
    } catch (err) {
      const msg = err.response?.status === 404
        ? 'Invoice not found'
        : err.response?.data?.message ?? err.response?.data?.detail ?? err.message ?? 'Failed to load invoice'
      const text = Array.isArray(msg) ? msg.join(' ') : String(msg)
      setPdfModalError(text)
      toast.error(text)
    } finally {
      setPdfModalLoading(false)
    }
  }

  const pdfFormToSafeRow = (f, invoiceId) => {
    const id = String(invoiceId ?? f?.invoice_no ?? 'INV-000001')
    const defaultCompany = 'COX WEB SOLUTIONS'
    return {
      invoice_id: id,
      invoice_no: (f?.invoice_no ?? id).toString(),
      ownComName: (f?.ownComName ?? '').trim() || defaultCompany,
      ownComTitle: (f?.ownComTitle ?? '').trim() || 'Innovate. Integrate. Elevate',
      clientName: f?.clientName ?? '',
      clientId: String(f?.clientId ?? ''),
      clientCompany: f?.clientCompany ?? '',
      clientPhone: f?.clientPhone ?? '',
      clientAddress: f?.clientAddress ?? '',
      billingDescription: f?.billingDescription ?? '',
      unitPrice: Number(f?.unitPrice) || 0,
      subtotal: Number(f?.subtotal) || 0,
      discount: Number(f?.discount) || 0,
      totalPrice: Number(f?.totalPrice) || 0,
      invoiceDate: f?.invoiceDate ?? '',
      createdAt: f?.invoiceDate ?? f?.createdAt ?? '',
      logoUrl: f?.ownComLogoUrl ?? '',
    }
  }

  const buildPdfHtml = (safeRow, logoImgSrc) => {
    const amount = safeRow.totalPrice > 0 ? safeRow.totalPrice : (safeRow.subtotal > 0 ? safeRow.subtotal : safeRow.unitPrice) || 0
    const invoiceDate = (safeRow.invoiceDate || safeRow.createdAt) ? new Date(safeRow.invoiceDate || safeRow.createdAt) : new Date()
    const dateStr = invoiceDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const monthYearStr = invoiceDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    const unitPriceVal = safeRow.unitPrice > 0 ? safeRow.unitPrice : amount
    const subtotalVal = Number(safeRow.totalPrice) || 0
    const discountPercent = Number(safeRow.discount) || 0
    const totalPayable = subtotalVal
    const logoHtml = logoImgSrc
      ? `<img src="${logoImgSrc}" alt="${safeRow.ownComName}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" />`
      : `<span class="logo-c">C</span><span>${safeRow.ownComName}</span><span>${safeRow.ownComTitle}</span>`
    return `
      <html>
        <head>
          <title>Invoice #${safeRow.invoice_no}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 32px 40px; color: #333; background: #fff; }
            .invoice-toolbar { position: fixed; top: 16px; right: 24px; display: flex; gap: 8px; z-index: 1000; }
            .invoice-toolbar button { padding: 6px 12px; font-size: 12px; border-radius: 4px; border: 1px solid #1e3a5f; background: #1e3a5f; color: #fff; cursor: pointer; }
            .invoice-toolbar button.secondary { background: #fff; color: #1e3a5f; }
            .header-center { text-align: center; margin-bottom: 8px; }
            .company-name { font-size: 22px; font-weight: 700; color: #000; letter-spacing: 0.5px; margin: 0; }
            .tagline { font-size: 13px; color: #000; margin: 4px 0 0 0; }
            .doc-title { font-size: 18px; font-weight: 700; color: #000; margin: 12px 0 0 0; }
            .header-row { display: flex; justify-content: flex-start; align-items: flex-start; margin-bottom: 24px; }
            .logo-box { width: 150px; height: 150px; border-radius: 50%; background:#a0522d; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 10px; font-size: 10px; line-height: 1.3; overflow: hidden; flex-shrink: 0; }
            .logo-box .logo-c { font-size: 28px; font-weight: 700; margin-bottom: 2px; }
            .logo-box img { width: 100%; height: 100%; object-fit: cover; border-radius: 5%; }
            .bill-invoice-wrap { display: flex; justify-content: space-between; align-items: flex-start; gap: 40px; margin-bottom: 24px; }
            .bill-to-block { flex: 1; max-width: 50%; }
            .bill-to-header { background: #a0522d; color: #000; font-weight: 700; font-size: 14px; padding: 10px 14px; text-align: center; border: 1px solid #000; margin-bottom: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .bill-to-content { padding: 14px; border: 1px solid #000; border-top: none; font-size: 13px; line-height: 1.7; color: #000; }
            .bill-to-content .bill-to-line { margin: 0 0 4px 0; }
            .invoice-meta-table { border-collapse: collapse; font-size: 13px; min-width: 260px; border: 1px solid #ddd; }
            .invoice-meta-table th { background: #a0522d; color: #fff; padding: 10px 14px; text-align: left; font-weight: 700; border: 1px solid #8b4512; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .invoice-meta-table td { background: #fff; color: #444; padding: 10px 14px; border: 1px solid #ddd; }
            .service-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            .service-table thead th { background: #a0522d; color: #fff; padding: 12px 14px; text-align: left; font-weight: 700; border: 1px solid #a0522d; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .service-table td { padding: 10px 14px; border: 1px solid #ddd; background: #fff; }
            .totals-box { margin-top: 20px; text-align: right; width: 280px; margin-left: auto; font-size: 13px; }
            .totals-box .row { display: flex; justify-content: space-between; padding: 4px 0; }
            .totals-box .row.total { font-weight: 700; font-size: 14px; margin-top: 6px; padding-top: 6px; border-top: 1px solid #333; }
            .signature-section { margin-top: 32px; }
            .signature-line { width: 100%; max-width: 280px; height: 0; border: none; border-bottom: 2px solid #000; margin-bottom: 16px; }
            .signature-label { font-weight: 700; font-size: 13px; margin-bottom: 8px; }
            .signature-details { font-size: 13px; line-height: 1.6; }
            @media print {
              .invoice-toolbar { display: none !important; }
              body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .bill-to-header { background: #a0522d !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .invoice-meta-table th { background: #a0522d !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .service-table thead th { background: #a0522d !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-toolbar">
            <button class="secondary" onclick="window.print()">Print</button>
           
          </div>

          <div class="header-row">
            <div class="logo-box">
              ${logoHtml}
            </div>
            <div class="header-center" style="flex: 1; margin-bottom: 0; margin-left: 24px;">
              <p class="company-name">${safeRow.ownComName}</p>
              <p class="tagline">${safeRow.ownComTitle}</p>
              <p class="doc-title">CWS Invoice</p>
            </div>
          </div>

          <div class="bill-invoice-wrap">
            <div class="bill-to-block">
              <div class="bill-to-header">Bill To:</div>
              <div class="bill-to-content">
                <div class="bill-to-line">Client Name: ${safeRow.clientName || '—'}</div>
                <div class="bill-to-line">Company Name: ${safeRow.clientCompany || '—'}</div>
                <div class="bill-to-line">Phone: ${safeRow.clientPhone || '—'}</div>
                <div class="bill-to-line">Address: ${safeRow.clientAddress || '—'}</div>
              </div>
            </div>
            <table class="invoice-meta-table">
              <tr>
                <th>Invoice#</th>
                <td>${safeRow.invoice_no}</td>
              </tr>
              <tr>
                <th>Invoice Date</th>
                <td>${dateStr}</td>
              </tr>
              <tr>
                <th>Terms</th>
                <td>Due on Receipt</td>
              </tr>
             
            </table>
          </div>

          <table class="service-table">
            <thead>
              <tr>
                <th style="width: 40px;">SL</th>
                <th>Service Description</th>
                <th style="width: 100px;">Month</th>
                <th style="width: 110px;">Unit Price (BDT)</th>
                <th style="width: 110px;">Total (BDT)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>${safeRow.billingDescription || 'Services'}</td>
                <td>${monthYearStr}</td>
                <td>${unitPriceVal.toFixed(2)}</td>
                <td>${subtotalVal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals-box">
            <div class="row"><span>Unit Price:</span><span>${unitPriceVal.toFixed(2)}</span></div>
            <div class="row"><span>Subtotal:</span><span>${subtotalVal.toFixed(2)}</span></div>
            <div class="row"><span>Discount:</span><span>${discountPercent > 0 ? discountPercent + '%' : '0'}</span></div>
            <div class="row total"><span>Total Payable:</span><span>${totalPayable.toFixed(2)}</span></div>
          </div>

          <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-label">Signature:</div>
            <div class="signature-details">
              <div>Ahad Noor Sobhan Zihadi</div>
              <div>Managing Director</div>
              <div>${safeRow.ownComName}</div>
              <div>8801840452081</div>
            </div>
          </div>
        </body>
      </html>`
  }

  const handleGeneratePdfFromModal = async () => {
    if (!pdfForm || pdfModalInvoiceId == null) return
    setPdfGenerating(true)
    try {
      const safeRow = pdfFormToSafeRow(pdfForm, pdfModalInvoiceId)
      let logoImgSrc = null
      const logoSource = safeRow.logoUrl || logoJpeg
      if (logoSource) {
        logoImgSrc = await fetchImageAsDataUrl(logoSource)
        if (!logoImgSrc && safeRow.logoUrl) logoImgSrc = await fetchImageAsDataUrl(logoJpeg)
      }
      if (!logoImgSrc && logoJpeg) logoImgSrc = logoJpeg
      const html = buildPdfHtml(safeRow, logoImgSrc)
      const blob = new Blob([html], { type: 'text/html' })
      window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer')
    } catch (err) {
      toast.error(err?.message ?? 'Failed to generate PDF')
    } finally {
      setPdfGenerating(false)
    }
  }

  const handlePdfModalUpdate = async () => {
    if (!pdfForm || pdfModalInvoiceId == null) return
    setPdfUpdating(true)
    try {
      const payload = formToApiPayload(pdfForm)
      await coreAxios.patch(API_PATHS.updateInvoice(pdfModalInvoiceId), payload)
      toast.success('Invoice updated successfully.')
      setPdfModalOpen(false)
      setPdfModalInvoiceId(null)
      setPdfForm(null)
      const { data } = await coreAxios.get(API_PATHS.INVOICES_LIST)
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.results)) ? data.results : []
      setRows(list.map((item) => mapApiToInvoice(item)))
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data?.detail ?? err.message ?? 'Failed to update invoice'
      toast.error(Array.isArray(msg) ? msg.join(' ') : String(msg))
    } finally {
      setPdfUpdating(false)
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
                {/* <button
                  type="button"
                  onClick={() => {
                    setActionDropdown(null)
                    handleEditRow(actionDropdown.row)
                  }}
                >
                  Edit
                </button> */}
                <button
                  type="button"
                  onClick={() => {
                    setActionDropdown(null)
                    handleInvoiceRow(actionDropdown.row)
                  }}
                >
                  Invoice
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
        const { data } = await coreAxios.get(API_PATHS.INVOICES_LIST)
        const list = Array.isArray(data)
          ? data
          : (data && Array.isArray(data.results))
            ? data.results
            : []
        const mapped = list.map((item) => mapApiToInvoice(item))
        setRows(mapped)
        setLoadError('')
      } catch (err) {
        setRows([])
        const status = err.response?.status
        const msg =
          status === 404
            ? 'Invoice API not found. Table is empty until the backend provides /api/invoices/.'
            : err.response?.data?.message ??
              err.response?.data?.detail ??
              err.message ??
              'Failed to load invoices'
        const text = Array.isArray(msg) ? msg.join(' ') : String(msg)
        setLoadError(text)
        if (status !== 404) toast.error(text)
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
      ownComName: '',
      ownComTitle: '',
      ownComLogoFile: null,
      ownComLogoUrl: '',
      clientName: '',
      clientId: '',
      clientCompany: '',
      clientPhone: '',
      clientAddress: '',
      unitPrice: '',
      totalPrice: '',
      billingDescription: '',
      invoiceDate: '',
      subtotal: '',
      discount: '',
    })
    setSaveError('')
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    const payload = formToApiPayload(form)
    try {
      if (editingRow) {
        const { data } = await coreAxios.patch(
          API_PATHS.updateInvoice(editingRow.id),
          payload
        )
        const mapped = mapApiToInvoice(data)
        setRows((prev) => prev.map((r) => (r.id === editingRow.id ? mapped : r)))
        toast.success('Invoice updated successfully.')
      } else {
        const { data } = await coreAxios.post(API_PATHS.ADD_INVOICE, payload)
        const mapped = mapApiToInvoice(data)
        setRows((prev) => [...prev, mapped])
        toast.success('Invoice created successfully.')
      }
      setModalOpen(false)
      setEditingRow(null)
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        err.response?.data?.detail ??
        err.message ??
        'Failed to save invoice'
      const text = Array.isArray(msg) ? msg.join(' ') : String(msg)
      setSaveError(text)
      toast.error(text)
    } finally {
      setSaving(false)
    }
  }

  const tableColumns = [
    {
      field: 'invoice_id',
      header: 'ID',
      width: '90px',
      sortable: true,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'invoice_id'),
    },
    // {
    //   field: 'own_com_name',
    //   header: 'Company',
    //   width: '140px',
    //   sortable: false,
    //   sortableBody: (rowData) => tableBodyTemp(rowData, 'own_com_name'),
    // },
    {
      field: 'client_name',
      header: 'Client Name',
      width: '150px',
      sortable: true,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'client_name'),
    },
    // {
    //   field: 'client_id',
    //   header: 'Client ID',
    //   width: '90px',
    //   sortable: false,
    //   sortableBody: (rowData) => tableBodyTemp(rowData, 'client_id'),
    // },
    {
      field: 'client_company',
      header: 'Company',
      width: '180px',
      sortable: false,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'client_company'),
    },
    {
      field: 'client_phone',
      header: 'Mobile No. ',
      width: '130px',
      sortable: false,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'client_phone'),
    },
    {
      field: 'invoice_no',
      header: 'Invoice No',
      width: '120px',
      sortable: true,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'invoice_no'),
    },
    {
      field: 'unit_price',
      header: 'Unit Price',
      width: '100px',
      sortable: true,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'unit_price'),
    },
    {
      field: 'total_price',
      header: 'Total Price',
      width: '100px',
      sortable: true,
      sortableBody: (rowData) => tableBodyTemp(rowData, 'total_price'),
    },
    // {
    //   field: 'billing_description',
    //   header: 'Description',
    //   width: '180px',
    //   sortable: false,
    //   sortableBody: (rowData) => {
    //     const v = rowData?.billing_description ?? ''
    //     const s = String(v)
    //     return s.length > 40 ? `${s.slice(0, 37)}…` : (s || '—')
    //   },
    // },
    {
      field: 'invoice_date',
      header: 'Date',
      width: '110px',
      sortable: true,
      sortValue: (row) => row?.invoice_date ?? '',
      sortableBody: (rowData) => dateBodyTemp(rowData, 'invoice_date'),
    },
    // {
    //   field: 'subtotal',
    //   header: 'Subtotal',
    //   width: '90px',
    //   sortable: false,
    //   sortableBody: (rowData) => tableBodyTemp(rowData, 'subtotal'),
    // },
    // {
    //   field: 'discount',
    //   header: 'Discount',
    //   width: '90px',
    //   sortable: false,
    //   sortableBody: (rowData) => tableBodyTemp(rowData, 'discount'),
    // },
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

  return (
    <div className="admin-users">
      <div className="users-toolbar">
        <div className="users-toolbar-left">
          <Button variant="success" onClick={openNew}>+ New</Button>
        </div>
      </div>

      {loadError && (
        <div className="users-error users-error-inline" style={{ marginBottom: 16 }}>
          {loadError}
        </div>
      )}

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

      {editLoading && (
        <div className="users-loading users-loading-inline">Loading invoice…</div>
      )}
      {editError && (
        <div className="users-error users-error-inline">{editError}</div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSaveError('')
          setEditingRow(null)
        }}
        title={editingRow ? 'Update Invoice' : 'New Invoice'}
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

          {/* <div className="users-form-field">
            <InputField
              label="Company Name"
              name="ownComName"
              value={form.ownComName ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, ownComName: e.target.value }))}
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Company Title"
              name="ownComTitle"
              value={form.ownComTitle ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, ownComTitle: e.target.value }))}
            />
          </div>
          <div className="users-form-field users-form-field--full">
            <label className="users-form-label">Company Logo</label>
            <input
              id="own-com-logo-file"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                setForm((prev) => ({ ...prev, ownComLogoFile: file || null }))
              }}
            />
            {form.ownComLogoUrl && (
              <div style={{ marginTop: 8, fontSize: 12 }}>Current: {form.ownComLogoUrl}</div>
            )}
          </div> */}

          <div className="users-form-field">
            <InputField
              label="Client Name"
              name="clientName"
              value={form.clientName ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, clientName: e.target.value }))}
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Invoice No"
              name="invoice_no"
              value={form.invoice_no ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, invoice_no: e.target.value }))}
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Client Company"
              name="clientCompany"
              value={form.clientCompany ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, clientCompany: e.target.value }))}
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Client Phone"
              name="clientPhone"
              value={form.clientPhone ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, clientPhone: e.target.value }))}
            />
          </div>
          <div className="users-form-field users-form-field--full">
            <InputField
              label="Client Address"
              name="clientAddress"
              value={form.clientAddress ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, clientAddress: e.target.value }))}
            />
          </div>

          <div className="users-form-field">
            <InputField
              label="Unit Price"
              name="unitPrice"
              value={form.unitPrice ?? ''}
              onChange={(e) => {
                const unitPrice = e.target.value
                const subtotal = unitPrice
                setForm((prev) => ({
                  ...prev,
                  unitPrice,
                  subtotal,
                  totalPrice: calcTotalPrice(subtotal, prev.discount),
                }))
              }}
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Subtotal"
              name="subtotal"
              value={form.subtotal ?? ''}
              onChange={(e) => {
                const subtotal = e.target.value
                setForm((prev) => ({
                  ...prev,
                  subtotal,
                  totalPrice: calcTotalPrice(subtotal, prev.discount),
                }))
              }}
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Discount (%)"
              name="discount"
              value={form.discount ?? ''}
              placeholder="e.g. 10"
              onChange={(e) => {
                const discount = e.target.value
                setForm((prev) => ({
                  ...prev,
                  discount,
                  totalPrice: calcTotalPrice(prev.subtotal, discount),
                }))
              }}
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Total Price (auto)"
              name="totalPrice"
              value={form.totalPrice ?? ''}
              readOnly
              title="Subtotal × (1 − Discount % ÷ 100)"
            />
          </div>
          <div className="users-form-field">
            <InputField
              label="Invoice Date"
              name="invoiceDate"
              type="date"
              value={form.invoiceDate ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, invoiceDate: e.target.value }))}
            />
          </div>
          <div className="users-form-field ">
            <TextareaField
              label="Billing Description"
              name="billingDescription"
              value={form.billingDescription ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, billingDescription: e.target.value }))}
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

      <Modal
        open={pdfModalOpen}
        onClose={() => {
          setPdfModalOpen(false)
          setPdfModalInvoiceId(null)
          setPdfForm(null)
          setPdfModalError('')
        }}
        title="Edit Invoice PDF"
        size="lg"
        width="900px"
        className="users-modal-dialog"
      >
        {pdfModalLoading && (
          <div className="users-loading users-loading-inline">Loading invoice…</div>
        )}
        {pdfModalError && !pdfModalLoading && (
          <div className="users-error users-error-inline" style={{ marginBottom: 16 }}>
            {pdfModalError}
          </div>
        )}
        {pdfForm && !pdfModalLoading && (
          <>
            <div className="users-form-grid" style={{ marginBottom: 20 }}>
            <div className="users-form-field">
                <InputField
                  label="Company (Owner)"
                  placeholder="COX WEB SOLUTIONS"
                  value={pdfForm.ownComName ?? ''}
                  onChange={(e) => setPdfForm((f) => ({ ...f, ownComName: e.target.value }))}
                />
              </div>
              <div className="users-form-field">
                <InputField
                  label="Company Title "
                  placeholder="Innovate, Integrate, Elevate"
                  value={pdfForm.ownComTitle ?? ''}
                  onChange={(e) => setPdfForm((f) => ({ ...f, ownComTitle: e.target.value }))}
                />
              </div>
              <div className="users-form-field">
                <InputField
                  label="Invoice No"
                  value={pdfForm.invoice_no ?? ''}
                  onChange={(e) => setPdfForm((f) => ({ ...f, invoice_no: e.target.value }))}
                />
              </div>
              <div className="users-form-field">
                <InputField
                  label="Date"
                  type="date"
                  value={pdfForm.invoiceDate ?? ''}
                  onChange={(e) => setPdfForm((f) => ({ ...f, invoiceDate: e.target.value }))}
                />
              </div>
              <div className="users-form-field">
                <InputField
                  label="Client Name"
                  value={pdfForm.clientName ?? ''}
                  onChange={(e) => setPdfForm((f) => ({ ...f, clientName: e.target.value }))}
                />
              </div>
              {/* <div className="users-form-field">
                <InputField
                  label="Client ID"
                  value={pdfForm.clientId ?? ''}
                  onChange={(e) => setPdfForm((f) => ({ ...f, clientId: e.target.value }))}
                />
              </div> */}
              <div className="users-form-field">
                <InputField
                  label="Company Name"
                  value={pdfForm.clientCompany ?? ''}
                  onChange={(e) => setPdfForm((f) => ({ ...f, clientCompany: e.target.value }))}
                />
              </div>
              <div className="users-form-field">
                <InputField
                  label="Phone"
                  value={pdfForm.clientPhone ?? ''}
                  onChange={(e) => setPdfForm((f) => ({ ...f, clientPhone: e.target.value }))}
                />
              </div>
              <div className="users-form-field ">
                <InputField
                  label="Address"
                  value={pdfForm.clientAddress ?? ''}
                  onChange={(e) => setPdfForm((f) => ({ ...f, clientAddress: e.target.value }))}
                />
              </div>
             
             
              <div className="users-form-field">
                <InputField
                  label="Unit Price"
                  value={pdfForm.unitPrice ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    setPdfForm((f) => ({
                      ...f,
                      unitPrice: v,
                      totalPrice: calcTotalPrice(v, f.discount) || f.totalPrice,
                    }))
                  }}
                />
              </div>
              {/* <div className="users-form-field">
                <InputField
                  label="Subtotal"
                  value={pdfForm.subtotal ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    setPdfForm((f) => ({
                      ...f,
                      subtotal: v,
                      totalPrice: calcTotalPrice(v, f.discount) || f.totalPrice,
                    }))
                  }}
                />
              </div> */}
              <div className="users-form-field">
                <InputField
                  label="Discount (%)"
                  value={pdfForm.discount ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    setPdfForm((f) => ({
                      ...f,
                      discount: v,
                      totalPrice: calcTotalPrice(f.subtotal, v) || f.totalPrice,
                    }))
                  }}
                />
              </div>
              <div className="users-form-field">
                <InputField
                  label="Total Price"
                  value={pdfForm.totalPrice ?? ''}
                  onChange={(e) => setPdfForm((f) => ({ ...f, totalPrice: e.target.value }))}
                />
              </div>
              <div className="users-form-field ">
                <TextareaField
                  label="Service Description"
                  value={pdfForm.billingDescription ?? ''}
                  onChange={(e) => setPdfForm((f) => ({ ...f, billingDescription: e.target.value }))}
                />
              </div>
            </div>
            <div className="users-form-actions" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setPdfModalOpen(false)
                  setPdfModalInvoiceId(null)
                  setPdfForm(null)
                  setPdfModalError('')
                }}
                disabled={pdfGenerating || pdfUpdating}
              >
                Cancel
              </Button>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handlePdfModalUpdate}
                  disabled={pdfGenerating || pdfUpdating}
                >
                  {pdfUpdating ? 'Updating…' : '+ Update invoice'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGeneratePdfFromModal}
                  disabled={pdfGenerating || pdfUpdating}
                >
                  {pdfGenerating ? 'Generating…' : 'Generate PDF'}
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={!!deleteConfirm}
        onClose={() => {
          setDeleteConfirm(null)
          setDeleteError('')
        }}
        title="Delete invoice?"
        size="sm"
      >
        {deleteConfirm && (
          <>
            <p>
              Invoice #{deleteConfirm.invoice_id ?? deleteConfirm.id} –{' '}
              {deleteConfirm.client_name ?? deleteConfirm.clientName}
            </p>
            {deleteError && (
              <div className="users-error users-error-inline">{deleteError}</div>
            )}
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
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

