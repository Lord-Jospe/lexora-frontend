import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { listInvoices, exportInvoice } from '../../api/services/invoice.service';
import { getErrorMessage } from '../../utils/errorHandler';
import type { InvoiceFullRead } from '../../types/invoice.type';
import {useNavigate}  from 'react-router-dom';
import '../../css/pages/historialFacturas.css';

// ─── Badge de estado ──────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PROCESSED: { label: 'Procesado', cls: 'badge--processed' },
  PENDING:   { label: 'Pendiente', cls: 'badge--pending'   },
  ERROR:     { label: 'Error',     cls: 'badge--error'     },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_MAP[status?.toUpperCase()] ?? { label: status, cls: 'badge--pending' };
  return <span className={`status-badge ${s.cls}`}>{s.label}</span>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatCurrency = (n?: number) => {
  if (n === undefined || n === null) return '—';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
};

const PAGE_SIZE = 8;

// ─── Página ───────────────────────────────────────────────────────────────────

const HistorialFacturasPage = () => {
  const [invoices, setInvoices]     = useState<InvoiceFullRead[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate]     = useState('');
  const [page, setPage]             = useState(1);
  const [exporting, setExporting]   = useState<string | null>(null); // invoice id being exported
    const navigate = useNavigate();


  // ── Carga inicial ──
  useEffect(() => {
    const load = async () => {
      try {
        const data = await listInvoices();
        setInvoices(data);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Filtros ──
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        inv.provider?.name?.toLowerCase().includes(q) ||
        inv.provider?.nit?.toLowerCase().includes(q) ||
        inv.invoice.invoice_number?.toLowerCase().includes(q);

      const matchStatus =
        !filterStatus ||
        inv.invoice.status?.toUpperCase() === filterStatus.toUpperCase();

      const matchDate =
        !filterDate ||
        inv.invoice.issue_date?.startsWith(filterDate);

      return matchSearch && matchStatus && matchDate;
    });
  }, [invoices, search, filterStatus, filterDate]);

  // ── Paginación ──
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const handleSearch = () => setPage(1);

  // ── Exportar ──
  const handleExport = async (invoiceId: string, format: 'csv' | 'xml' | 'pdf') => {
    setExporting(invoiceId);
    try {
      await exportInvoice(invoiceId, format);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setExporting(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="historial-page">

      {/* ── Título ── */}
      <div className="historial-header">
        <h1 className="historial-title">Historial De Facturas</h1>
      </div>

      {/* ── Barra de filtros ── */}
      <div className="historial-filters">
        <div className="filter-search">
          <Icon icon="solar:magnifer-linear" width={17} className="filter-search-icon" />
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="filter-search-input"
          />
        </div>

        {/* Fecha */}
        <div className="filter-select-wrap">
          <Icon icon="solar:calendar-linear" width={15} className="filter-select-icon" />
          <input
            type="month"
            value={filterDate}
            onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
            className="filter-select"
            placeholder="Fecha"
          />
          <Icon icon="solar:alt-arrow-down-linear" width={13} className="filter-select-chevron" />
        </div>

        {/* Estado */}
        <div className="filter-select-wrap">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">Estado</option>
            <option value="PROCESSED">Procesado</option>
            <option value="PENDING">Pendiente</option>
            <option value="ERROR">Error</option>
          </select>
          <Icon icon="solar:alt-arrow-down-linear" width={13} className="filter-select-chevron" />
        </div>

        <button className="filter-btn" onClick={handleSearch}>
          Buscar
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="historial-error">
          <Icon icon="solar:danger-triangle-bold" width={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)}><Icon icon="solar:close-linear" width={14} /></button>
        </div>
      )}

      {/* ── Tabla ── */}
      <div className="historial-table-wrap">
        <div className="historial-table-title">Facturas</div>

        {loading ? (
          <div className="historial-loading">
            <Icon icon="solar:refresh-linear" width={28} className="animate-spin" />
            <p>Cargando facturas...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="historial-empty">
            <Icon icon="solar:inbox-linear" width={40} />
            <p>No se encontraron facturas</p>
          </div>
        ) : (
          <table className="historial-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>NIT</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Exportar</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((inv) => (
                <tr key={inv.invoice.id}
                onClick={() => navigate(`/admin/historial-facturas/${inv.invoice.id}`)}
                className="cursor-pointer"  // o agrega cursor: pointer al CSS></tbody>> 
                >
                  <td>{formatDate(inv.invoice.issue_date ?? inv.invoice.created_at)}</td>
                  <td className="td-provider">{inv.provider?.name ?? '—'}</td>
                  <td>{inv.provider?.nit ?? '—'}</td>
                  <td className="td-total">{formatCurrency(inv.invoice.total)}</td>
                  <td><StatusBadge status={inv.invoice.status} /></td>
                  <td>
                    <div className="export-btns">
                      {(['csv', 'xml', 'pdf'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          className="export-btn"
                          disabled={exporting === inv.invoice.id}
                          onClick={() => handleExport(inv.invoice.id, fmt)}
                          title={`Exportar ${fmt.toUpperCase()}`}
                        >
                          {exporting === inv.invoice.id
                            ? <Icon icon="solar:refresh-linear" width={13} className="animate-spin" />
                            : fmt.toUpperCase()
                          }
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Paginación ── */}
      {!loading && filtered.length > PAGE_SIZE && (
        <div className="historial-pagination">
          <button className="page-btn" onClick={() => goTo(page - 1)} disabled={page === 1}>
            <Icon icon="solar:alt-arrow-left-linear" width={16} />
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page - 2 + i;
            if (p < 1 || p > totalPages) return null;
            return (
              <button
                key={p}
                className={`page-btn ${p === page ? 'page-btn--active' : ''}`}
                onClick={() => goTo(p)}
              >
                {p}
              </button>
            );
          })}

          {totalPages > 5 && page < totalPages - 2 && (
            <>
              <span className="page-ellipsis">…</span>
              <button className="page-btn" onClick={() => goTo(totalPages)}>{totalPages}</button>
            </>
          )}

          <button className="page-btn" onClick={() => goTo(page + 1)} disabled={page === totalPages}>
            <Icon icon="solar:alt-arrow-right-linear" width={16} />
          </button>
        </div>
      )}

    </div>
  );
};

export default HistorialFacturasPage;