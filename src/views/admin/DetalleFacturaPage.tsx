import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { getInvoiceById, exportInvoice } from '../../api/services/invoice.service';
import { getErrorMessage } from '../../utils/errorHandler';
import type { InvoiceFullRead } from '../../types/invoice.type';
import '../../css/pages/detallesFacturas.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PROCESSED: { label: 'Procesado', cls: 'detalle-badge--processed' },
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

// ─── Página ───────────────────────────────────────────────────────────────────

const DetalleFacturaPage = () => {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();

  const [invoice, setInvoice]   = useState<InvoiceFullRead | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting]   = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await getInvoiceById(id);
        setInvoice(data);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

    const handleExport = async (format: 'csv' | 'xml' | 'pdf') => {
        if (!id) return;
        
        setExporting(true);
        setExportOpen(false);
        try {
            await exportInvoice(id, format);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setExporting(false);
        }
    };

  // ── Loading ──
  if (loading) return (
    <div className="detalle-loading">
      <Icon icon="solar:refresh-linear" width={32} className="animate-spin" />
      <p>Cargando factura...</p>
    </div>
  );

  // ── Error ──
  if (error || !invoice) return (
    <div className="detalle-error-page">
      <Icon icon="solar:danger-triangle-bold" width={36} />
      <p>{error ?? 'Factura no encontrada'}</p>
      <button onClick={() => navigate('/admin/historial-facturas')} className="detalle-back-btn">
        Volver al historial
      </button>
    </div>
  );

  const status = STATUS_MAP[invoice.invoice.status?.toUpperCase()] 
    ?? { label: invoice.invoice.status, cls: 'detalle-badge--pending' };

  const totalItems = invoice.items.reduce((acc, item) => acc + (item.total ?? 0), 0);

  return (
    <div className="detalle-page">

      {/* ── Título ── */}
      <div className="detalle-header">
        <button className="detalle-back" onClick={() => navigate('/admin/historial-facturas')}>
          <Icon icon="solar:alt-arrow-left-linear" width={18} />
          Historial
        </button>
        <h1 className="detalle-title">Detalles De Factura</h1>
      </div>

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

      {/* ── Tabla de productos ── */}
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
                  {/* Fila TOTAL */}
                  <tr className="detalle-total-row">
                    <td colSpan={3}>TOTAL</td>
                    <td>{formatCurrency(totalItems)}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={4} className="detalle-empty-items">
                    Sin ítems registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Acciones ── */}
      <div className="detalle-actions">

        {/* Exportar dropdown */}
        <div className="detalle-export-wrap">
          <button
            className="detalle-export-btn"
            onClick={() => setExportOpen(!exportOpen)}
            disabled={exporting}
          >
            {exporting ? (
              <><Icon icon="solar:refresh-linear" width={15} className="animate-spin" /> Exportando...</>
            ) : (
              <> Exportar como... <Icon icon="solar:alt-arrow-down-linear" width={15} /></>
            )}
          </button>

          {exportOpen && (
            <div className="detalle-export-menu">
              {([
                { fmt: 'csv',  icon: 'solar:file-text-linear',    label: 'CSV'  },
                { fmt: 'xml',  icon: 'solar:code-square-linear',   label: 'XML'  },
                { fmt: 'pdf',  icon: 'solar:file-download-linear', label: 'PDF'  },
              ] as const).map(({ fmt, icon, label }) => (
                <button
                  key={fmt}
                  className="detalle-export-item"
                  onClick={() => handleExport(fmt)}
                >
                  <Icon icon={icon} width={16} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Confirmar y guardar — navega a revisión si aún no está guardada */}
        <button
          className="detalle-confirm-btn"
          onClick={() => navigate('/admin/historial-facturas')}
        >
          Confirmar y guardar
        </button>
      </div>

    </div>
  );
};

export default DetalleFacturaPage;