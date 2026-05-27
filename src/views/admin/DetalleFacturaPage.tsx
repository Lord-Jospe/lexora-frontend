import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import {
  getInvoiceById, exportInvoice,
  updateInvoiceStatus, updateInvoice,
} from '../../api/services/invoice.service';
import { getErrorMessage } from '../../utils/errorHandler';
import type { InvoiceFullRead, InvoiceItemRead, InvoiceUpdateRequest } from '../../types/invoice.type';
import '../../css/pages/detallesFacturas.css';
import { toast } from 'sonner';


// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['PENDING', 'VALIDATED', 'ERROR'];

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  VALIDATED: { label: 'Validado', cls: 'detalle-badge--processed' },
  PENDING:   { label: 'Pendiente', cls: 'detalle-badge--pending'   },
  ERROR:     { label: 'Error',     cls: 'detalle-badge--error'     },
};

const formatCurrency = (n?: number) => {
  if (n === undefined || n === null) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(n);
};

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

// ─── Tipos locales para el formulario de edición ──────────────────────────────

interface EditableItem extends InvoiceItemRead {
  _deleted?: boolean;
  _isNew?:   boolean;
}

// ─── Página ───────────────────────────────────────────────────────────────────

const DetalleFacturaPage = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice]     = useState<InvoiceFullRead | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting]   = useState(false);
  const [saving, setSaving]         = useState(false);

  // ── Modal estado ──
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus]             = useState('');

  // ── Modal editar factura ──
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    category:  '',
    issue_date: '',
    subtotal:  '',
    iva:       '',
    total:     '',
  });
  const [editItems, setEditItems] = useState<EditableItem[]>([]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await getInvoiceById(id);
        setInvoice(data);
        setNewStatus(data.invoice.status);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
        toast.error('Error al cargar la factura');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  
  // ── Abrir modal editar ──
  const openEditModal = () => {
    if (!invoice) return;
    setEditForm({
      category:   invoice.invoice.category  ?? '',
      issue_date: invoice.invoice.issue_date ?? '',
      subtotal:   String(invoice.invoice.subtotal ?? ''),
      iva:        String(invoice.invoice.iva      ?? ''),
      total:      String(invoice.invoice.total    ?? ''),
    });
    setEditItems(invoice.items.map((item) => ({ ...item })));
    setShowEditModal(true);
  };

  // ── Guardar estado ──
  const handleStatusSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await updateInvoiceStatus(id, { status: newStatus });
      setInvoice(updated);
      setShowStatusModal(false);
      toast.success('Estado de factura actualizado');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      toast.error('Error al actualizar el estado de la factura');
    } finally {
      setSaving(false);
    }
  };

  // ── Guardar edición ──
  const handleEditSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      
      // Items existentes modificados (no borrados, no nuevos)
      const itemsToUpdate = editItems
        .filter((i) => !i._deleted && !i._isNew)
        .map(({ id: itemId, description, quantity, unit_price, total }) => ({
          id: itemId, description, quantity, unit_price, total,
        }));

          //Items nuevos — sin ID, el backend los crea
      const newItems = editItems
        .filter((i) => i._isNew && !i._deleted && i.description.trim() !== '')
        .map(({ description, quantity, unit_price, total }) => ({
          description, quantity, unit_price, total,
        }));

      const deleteItems = editItems
        .filter((i) => i._deleted && !i._isNew)
        .map((i) => i.id);

      const payload: InvoiceUpdateRequest = {
        category:     editForm.category   || undefined,
        issue_date:   editForm.issue_date  || undefined,
        subtotal:     parseFloat(editForm.subtotal) || undefined,
        iva:          parseFloat(editForm.iva)      || undefined,
        total:        parseFloat(editForm.total)    || undefined,
        items:        [...itemsToUpdate, ...newItems],
        delete_items: deleteItems.length ? deleteItems : undefined,
      };

      console.log('Payload de actualización:', payload);
      const updated = await updateInvoice(id, payload);
      
      setInvoice(updated);
      setShowEditModal(false);
      toast.success('Factura actualizada correctamente');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      toast.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format: 'csv' | 'xml' | 'pdf') => {
    if (!id) return;
    setExporting(true);
    setExportOpen(false);
    try {
      await exportInvoice(id, format);
      toast.success('Factura exportada correctamente');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      toast.error('Error al exportar la factura');
    } finally {
      setExporting(false);
    }
  };

  // ─── Helpers de items editables ───────────────────────────────────────────

  const updateItem = (index: number, field: keyof EditableItem, value: string | number) =>
    setEditItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));

  const deleteItem = (index: number) =>
    setEditItems((prev) => prev.map((item, i) => i === index ? { ...item, _deleted: true } : item));

  const addItem = () =>
    setEditItems((prev) => [...prev, {
      id: crypto.randomUUID(), description: '', quantity: undefined,
      unit_price: undefined, total: undefined, _isNew: true,
    }]);

  // ── Loading / Error ───────────────────────────────────────────────────────

  if (loading) return (
    <div className="detalle-loading">
      <Icon icon="solar:refresh-linear" width={32} className="animate-spin" />
      <p>Cargando factura...</p>
    </div>
  );

  if (error || !invoice) return (
    <div className="detalle-error-page">
      <Icon icon="solar:danger-triangle-bold" width={36} />
      <p>{error ?? 'Factura no encontrada'}</p>
      <button onClick={() => navigate('/admin/historial-facturas')} className="detalle-back-btn">
        Volver al historial
      </button>
    </div>
  );

  const status    = STATUS_MAP[invoice.invoice.status?.toUpperCase()] ?? { label: invoice.invoice.status, cls: 'detalle-badge--pending' };
  const totalItems = invoice.items.reduce((acc, item) => acc + (item.total ?? 0), 0);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="detalle-page pb-16">

      {/* ── Título ── */}
      <div className="detalle-header">
        <button className="detalle-back" onClick={() => navigate('/admin/historial-facturas')}>
          <Icon icon="solar:alt-arrow-left-linear" width={18} />
          Historial
        </button>
        <div className="flex items-center justify-between">
          <h1 className="detalle-title">Detalles De Factura</h1>
          {/* Botones de edición */}
          <div className="flex gap-2">
            
                        {invoice.document?.file_url && (
              <button
                onClick={() => window.open(invoice.document?.file_url, '_blank')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200
                          text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                title="Ver documento"
              >
                <Icon icon="solar:eye-linear" width={16} />
                Ver factura
              </button>
            )}
            <button
              onClick={() => setShowStatusModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200
                         text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <Icon icon="solar:tag-linear" width={16} />
              Cambiar estado
            </button>
            <button
              onClick={openEditModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-violet-500 text-white text-sm font-semibold
                         hover:bg-violet-600 shadow-btn-shadow transition-all"
            >
              <Icon icon="solar:pen-linear" width={16} />
              Editar factura
            </button>
          </div>
        </div>

        
      </div>

      {/* ── Error inline ── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-lighterror text-error text-sm font-medium mb-2">
          <Icon icon="solar:danger-triangle-bold" width={18} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><Icon icon="solar:close-linear" width={14} /></button>
        </div>
      )}

      {/* ── Info card ── */}
      <div className="detalle-info-card">
        <div className="detalle-info-left">
          <p className="detalle-info-label">Proveedor:</p>
          <div className="detalle-info-main">
            <span className="detalle-provider-name">{invoice.provider?.name ?? '—'}</span>
            {invoice.provider?.nit && (
              <span className="detalle-nit">
                <span className="detalle-nit-label">NIT.</span>
                {invoice.provider.nit}
              </span>
            )}
          </div>
        </div>
        <div className="detalle-info-meta">
          <div className="detalle-meta-item">
            <p className="detalle-info-label">Fecha</p>
            <p className="detalle-meta-value">
              {formatDate(invoice.invoice.issue_date ?? invoice.invoice.created_at)}
            </p>
          </div>
          <div className="detalle-meta-item">
            <p className="detalle-info-label">Total</p>
            <p className="detalle-meta-value">{formatCurrency(invoice.invoice.total)}</p>
          </div>
          <div className="detalle-meta-item">
            <span className={`detalle-status-badge ${status.cls}`}>
              <span className="detalle-status-dot" />
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabla productos ── */}
      <div className="detalle-products">
        <h2 className="detalle-products-title">Productos</h2>
        <div className="detalle-table-wrap">
          <table className="detalle-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Valor Unitario</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.length > 0 ? (
                <>
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td>{item.quantity ?? '—'}</td>
                      <td>{formatCurrency(item.unit_price)}</td>
                      <td>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                  <tr className="detalle-total-row">
                    <td colSpan={3}>TOTAL</td>
                    <td>{formatCurrency(totalItems)}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={4} className="detalle-empty-items">Sin ítems registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Acciones ── */}
      <div className="detalle-actions">
        <div className="detalle-export-wrap">
          <button className="detalle-export-btn" onClick={() => setExportOpen(!exportOpen)} disabled={exporting}>
            {exporting
              ? <><Icon icon="solar:refresh-linear" width={15} className="animate-spin" /> Exportando...</>
              : <> Exportar como... <Icon icon="solar:alt-arrow-down-linear" width={15} /></>
            }
          </button>
          {exportOpen && (
            <div className="detalle-export-menu">
              {([
                { fmt: 'csv', icon: 'solar:file-text-linear',    label: 'CSV' },
                { fmt: 'xml', icon: 'solar:code-square-linear',   label: 'XML' },
                { fmt: 'pdf', icon: 'solar:file-download-linear', label: 'PDF' },
              ] as const).map(({ fmt, icon, label }) => (
                <button key={fmt} className="detalle-export-item" onClick={() => handleExport(fmt)}>
                  <Icon icon={icon} width={16} />{label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-violet-500 text-white text-sm font-semibold
                         hover:bg-violet-600 shadow-btn-shadow transition-all" onClick={() => navigate('/admin/historial-facturas')}>
          Volver al historial
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          MODAL — Cambiar estado
      ══════════════════════════════════════════════════════ */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm bg-card border-2 border-gray-200 dark:border-gray-700
                          rounded-2xl p-6 shadow-lg mx-4">
            <h3 className="text-xl font-bold text-foreground mb-1">Cambiar estado</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Estado actual: <strong>{STATUS_MAP[invoice.invoice.status?.toUpperCase()]?.label ?? invoice.invoice.status}</strong>
            </p>

            <div className="flex flex-col gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold
                    transition-all cursor-pointer
                    ${newStatus === s
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
                      : 'border-gray-200 dark:border-gray-700 text-foreground hover:bg-muted'
                    }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    s === 'VALIDATED' ? 'bg-green-500' :
                    s === 'PENDING'   ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  {STATUS_MAP[s]?.label ?? s}
                  {newStatus === s && <Icon icon="solar:check-circle-bold" width={16} className="ml-auto text-violet-500" />}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700
                           text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleStatusSave}
                disabled={saving || newStatus === invoice.invoice.status}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500 text-white
                           text-sm font-semibold hover:bg-violet-600 transition-colors
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? <><Icon icon="solar:refresh-linear" width={14} className="animate-spin" /> Guardando...</> : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL — Editar factura
      ══════════════════════════════════════════════════════ */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl bg-card border-2 border-gray-200 dark:border-gray-700
                          rounded-2xl shadow-lg mx-4 flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-foreground">Editar factura</h3>
                <p className="text-sm text-muted-foreground">#{invoice.invoice.invoice_number}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground">
                <Icon icon="solar:close-linear" width={20} />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">

              {/* Datos generales */}
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
                  Datos generales
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Categoría',   key: 'category',   type: 'text'   },
                    { label: 'Fecha',       key: 'issue_date', type: 'date'   },
                    { label: 'Subtotal',    key: 'subtotal',   type: 'number' },
                    { label: 'IVA',         key: 'iva',        type: 'number' },
                    { label: 'Total',       key: 'total',      type: 'number' },
                  ].map(({ label, key, type }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-foreground">{label}</label>
                      <input
                        type={type}
                        value={editForm[key as keyof typeof editForm]}
                        onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                        className="px-3 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600
                                   bg-background text-foreground text-sm outline-none
                                   focus:border-violet-500 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Ítems</p>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50
                               dark:bg-violet-900/20 text-violet-600 dark:text-violet-400
                               text-xs font-semibold hover:bg-violet-100 transition-colors"
                  >
                    <Icon icon="solar:add-linear" width={14} />
                    Agregar ítem
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {editItems.filter((i) => !i._deleted).map((item, index) => (
                    <div key={item.id}
                         className="grid grid-cols-[1fr_80px_90px_90px_36px] gap-2 items-center
                                    p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                      <input
                        placeholder="Descripción"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700
                                   bg-background text-foreground text-sm outline-none focus:border-violet-400"
                      />
                      <input
                        type="number" placeholder="Cant."
                        value={item.quantity ?? ''}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                        className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700
                                   bg-background text-foreground text-sm outline-none focus:border-violet-400"
                      />
                      <input
                        type="number" placeholder="V. Unit."
                        value={item.unit_price ?? ''}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                        className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700
                                   bg-background text-foreground text-sm outline-none focus:border-violet-400"
                      />
                      <input
                        type="number" placeholder="Total"
                        value={item.total ?? ''}
                        onChange={(e) => updateItem(index, 'total', parseFloat(e.target.value))}
                        className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700
                                   bg-background text-foreground text-sm outline-none focus:border-violet-400"
                      />
                      <button
                        onClick={() => deleteItem(index)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg
                                   text-muted-foreground hover:bg-lighterror hover:text-error transition-colors"
                      >
                        <Icon icon="solar:trash-bin-trash-linear" width={15} />
                      </button>
                    </div>
                  ))}

                  {editItems.filter((i) => !i._deleted).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Sin ítems — agrega uno arriba
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t-2 border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700
                           text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500 text-white
                           text-sm font-semibold hover:bg-violet-600 transition-colors
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving
                  ? <><Icon icon="solar:refresh-linear" width={14} className="animate-spin" /> Guardando...</>
                  : <><Icon icon="solar:diskette-linear" width={14} /> Guardar cambios</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleFacturaPage;