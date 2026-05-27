import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  getAllParties, createParty, updateParty, deleteParty,
} from '../../api/services/party.service';
import { getInvoicesByProvider } from '../../api/services/invoice.service';
import { getErrorMessage } from '../../utils/errorHandler';
import type { PartyRead, PartyCreate, PartyUpdate } from '../../types/party.type';
import type { InvoiceFullRead } from '../../types/invoice.type';
import '../../css/pages/proveedorPage.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PARTY_TYPE_OPTIONS = ['DISTRIBUTOR', 'CLIENT'];

const PARTY_TYPE_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  DISTRIBUTOR: { label: 'Distribuidor', color: '#0891b2', bgColor: 'rgba(6,182,212,0.1)' },
  CLIENT:      { label: 'Cliente', color: '#16a34a', bgColor: 'rgba(22,163,74,0.1)' },
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

const STATUS_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  VALIDATED: { label: 'Validado', color: '#16a34a', bgColor: 'rgba(22,163,74,0.1)' },
  PENDING:   { label: 'Pendiente', color: '#a16207', bgColor: 'rgba(161,98,7,0.1)' },
  ERROR:     { label: 'Rechazado', color: '#dc2626', bgColor: 'rgba(220,38,38,0.1)' },
};

// ─── Página ───────────────────────────────────────────────────────────────────

const ProveedorPage = () => {
  const navigate = useNavigate();

  const [parties, setParties]   = useState<PartyRead[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [saving, setSaving]     = useState(false);

  // ── Modal crear ──
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<PartyCreate>({
    name: '', nit: '', party_type: 'DISTRIBUTOR',
  });

  // ── Modal editar ──
  const [editTarget, setEditTarget] = useState<PartyRead | null>(null);
  const [editForm, setEditForm]     = useState<PartyUpdate>({
    name: '', nit: '', party_type: '',
  });

  // ── Modal eliminar ──
  const [deleteTarget, setDeleteTarget] = useState<PartyRead | null>(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Modal facturas del proveedor ──
  const [invoicesTarget, setInvoicesTarget]   = useState<PartyRead | null>(null);
  const [providerInvoices, setProviderInvoices] = useState<InvoiceFullRead[]>([]);
  const [loadingInvoices, setLoadingInvoices]   = useState(false);

  // ── Carga inicial ──
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllParties();
        setParties(data);
      } catch (err: unknown) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Filtro por búsqueda ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return parties;
    return parties.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.nit?.toLowerCase().includes(q)
    );
  }, [parties, search]);

  // ── Crear proveedor ──
  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      toast.error('El nombre es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      const created = await createParty(createForm);
      setParties((prev) => [created, ...prev]);
      setShowCreate(false);
      setCreateForm({ name: '', nit: '', party_type: 'DISTRIBUTOR' });
      toast.success(`Proveedor "${created.name}" creado`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Abrir modal editar ──
  const openEdit = (party: PartyRead) => {
    setEditTarget(party);
    setEditForm({ name: party.name, nit: party.nit ?? '', party_type: party.party_type ?? '' });
  };

  // ── Guardar edición ──
  const handleEditSave = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const updated = await updateParty(editTarget.id, editForm);
      setParties((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      setEditTarget(null);
      toast.success(`Proveedor "${updated.name}" actualizado`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Eliminar ──
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteParty(deleteTarget.id);
      setParties((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success(`Proveedor "${deleteTarget.name}" eliminado`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  // ── Ver facturas del proveedor ──
  const openInvoices = async (party: PartyRead) => {
    setInvoicesTarget(party);
    setLoadingInvoices(true);
    setProviderInvoices([]);
    try {
      const data = await getInvoicesByProvider(party.id);
      setProviderInvoices(data);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingInvoices(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="proveedores-page pb-16">

      {/* ── Header ── */}
      <div className="proveedores-header">
        <h1 className="proveedores-title">Proveedores</h1>
        <p className="proveedores-subtitle">Gestiona tus proveedores y sus facturas</p>

        <div className="proveedores-header-top" style={{ marginTop: '20px' }}>
          <div className="proveedores-search-wrap">
            <Icon icon="mdi:magnify" width={17} className="proveedores-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o NIT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="proveedores-search-input"
            />
          </div>

          <button onClick={() => setShowCreate(true)} 
          className="flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-violet-500 text-white text-sm font-semibold
                         hover:bg-violet-600 shadow-btn-shadow transition-all">
            
            Nuevo proveedor
          </button>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="proveedores-table-wrap">
        <div className="proveedores-table-header">
          Proveedores ({filtered.length})
        </div>

        {loading ? (
          <div className="proveedores-loading">
            <Icon icon="mdi:refresh" width={28} className="animate-spin" />
            <p>Cargando proveedores...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="proveedores-empty">
            <Icon icon="mdi:account-group" width={40} className="opacity-40" />
            <p>No se encontraron proveedores</p>
          </div>
        ) : (
          <table className="proveedores-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>NIT</th>
                <th>Tipo</th>
                <th>Facturas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((party) => {
                const partyType = PARTY_TYPE_MAP[party.party_type ?? 'DISTRIBUTOR'] ?? PARTY_TYPE_MAP.DISTRIBUTOR;
                return (
                  <tr key={party.id}>
                    <td className="proveedores-table-name">{party.name}</td>
                    <td className="proveedores-table-nit">{party.nit ?? '—'}</td>
                    <td>
                      <span
                        className="proveedores-table-type"
                        style={{
                          background: partyType.bgColor,
                          color: partyType.color,
                        }}
                      >
                        {partyType.label}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => openInvoices(party)}
                        className="proveedores-table-invoice-btn"
                      >
                        <Icon icon="mdi:file-document-outline" width={14} />
                        Ver facturas
                      </button>
                    </td>
                    <td>
                      <div className="proveedores-table-actions">
                        <button
                          onClick={() => openEdit(party)}
                          className="proveedores-btn-icon"
                          title="Editar"
                        >
                          <Icon icon="mdi:pencil" width={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(party)}
                          className="proveedores-btn-icon proveedores-btn-icon--delete"
                          title="Eliminar"
                        >
                          <Icon icon="mdi:trash-can" width={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          MODAL — Crear proveedor
      ══════════════════════════════════════════════════════ */}
      {showCreate && (
        <div className="proveedores-modal-overlay">
          <div className="proveedores-modal">
            <div className="proveedores-modal-header">
              <div>
                <h3 className="proveedores-modal-title">Nuevo proveedor</h3>
                <p className="proveedores-modal-subtitle">Completa los datos del proveedor</p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="proveedores-modal-close"
              >
                <Icon icon="mdi:close" width={18} />
              </button>
            </div>

            <div className="proveedores-modal-body">
              <div className="proveedores-form-group">
                <label className="proveedores-form-label">Nombre *</label>
                <input
                  type="text"
                  placeholder="Ej: Farmacias SAS"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="proveedores-form-input"
                />
              </div>

              <div className="proveedores-form-group">
                <label className="proveedores-form-label">NIT</label>
                <input
                  type="text"
                  placeholder="Ej: 900123456"
                  value={createForm.nit ?? ''}
                  onChange={(e) => setCreateForm({ ...createForm, nit: e.target.value })}
                  className="proveedores-form-input"
                />
              </div>

              <div className="proveedores-form-group">
                <label className="proveedores-form-label">Tipo</label>
                <select
                  value={createForm.party_type ?? 'DISTRIBUTOR'}
                  onChange={(e) => setCreateForm({ ...createForm, party_type: e.target.value })}
                  className="proveedores-form-select"
                >
                  {PARTY_TYPE_OPTIONS.map((t) => {
                    const typeInfo = PARTY_TYPE_MAP[t];
                    return (
                      <option key={t} value={t}>{typeInfo.label}</option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="proveedores-modal-footer">
              <button
                onClick={() => setShowCreate(false)}
                className="proveedores-btn-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="proveedores-btn-confirm"
              >
                {saving
                  ? <><Icon icon="mdi:refresh" width={14} className="animate-spin" /> Creando...</>
                  : <><Icon icon="mdi:plus" width={14} /> Crear proveedor</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL — Editar proveedor
      ══════════════════════════════════════════════════════ */}
      {editTarget && (
        <div className="proveedores-modal-overlay">
          <div className="proveedores-modal">
            <div className="proveedores-modal-header">
              <div>
                <h3 className="proveedores-modal-title">Editar proveedor</h3>
                <p className="proveedores-modal-subtitle">{editTarget.name}</p>
              </div>
              <button
                onClick={() => setEditTarget(null)}
                className="proveedores-modal-close"
              >
                <Icon icon="mdi:close" width={18} />
              </button>
            </div>

            <div className="proveedores-modal-body">
              <div className="proveedores-form-group">
                <label className="proveedores-form-label">Nombre *</label>
                <input
                  type="text"
                  value={editForm.name ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="proveedores-form-input"
                />
              </div>

              <div className="proveedores-form-group">
                <label className="proveedores-form-label">NIT</label>
                <input
                  type="text"
                  value={editForm.nit ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, nit: e.target.value })}
                  className="proveedores-form-input"
                />
              </div>

              <div className="proveedores-form-group">
                <label className="proveedores-form-label">Tipo</label>
                <select
                  value={editForm.party_type ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, party_type: e.target.value })}
                  className="proveedores-form-select"
                >
                  {PARTY_TYPE_OPTIONS.map((t) => {
                    const typeInfo = PARTY_TYPE_MAP[t];
                    return (
                      <option key={t} value={t}>{typeInfo.label}</option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="proveedores-modal-footer">
              <button
                onClick={() => setEditTarget(null)}
                className="proveedores-btn-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="proveedores-btn-confirm"
              >
                {saving
                  ? <><Icon icon="mdi:refresh" width={14} className="animate-spin" /> Guardando...</>
                  : <><Icon icon="mdi:content-save" width={14} /> Guardar</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL — Eliminar proveedor
      ══════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="proveedores-modal-overlay">
          <div className="proveedores-modal proveedores-delete-modal">
            <div className="proveedores-modal-header">
              <div className="proveedores-delete-content">
                <div className="proveedores-delete-icon">
                  <Icon icon="mdi:trash-can" width={24} />
                </div>
                <h3 className="proveedores-delete-title">¿Eliminar proveedor?</h3>
                <p className="proveedores-delete-desc">
                  Se eliminará <strong>{deleteTarget.name}</strong>.
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="proveedores-modal-footer">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="proveedores-btn-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="proveedores-btn-delete"
              >
                {deleting
                  ? <><Icon icon="mdi:refresh" width={14} className="animate-spin" /> Eliminando...</>
                  : <><Icon icon="mdi:trash-can" width={14} /> Sí, eliminar</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL — Facturas del proveedor
      ══════════════════════════════════════════════════════ */}
      {invoicesTarget && (
        <div className="proveedores-modal-overlay">
          <div className="proveedores-modal proveedores-invoices-modal">
            <div className="proveedores-modal-header">
              <div>
                <h3 className="proveedores-modal-title">
                  Facturas de {invoicesTarget.name}
                </h3>
                <p className="proveedores-modal-subtitle">
                  NIT: {invoicesTarget.nit ?? '—'}
                </p>
              </div>
              <button
                onClick={() => setInvoicesTarget(null)}
                className="proveedores-modal-close"
              >
                <Icon icon="mdi:close" width={18} />
              </button>
            </div>

            <div className="proveedores-modal-body" style={{ padding: 0 }}>
              {loadingInvoices ? (
                <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                  <Icon icon="mdi:refresh" width={26} className="animate-spin" />
                  <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--muted-foreground)' }}>
                    Cargando facturas...
                  </p>
                </div>
              ) : providerInvoices.length === 0 ? (
                <div className="proveedores-invoices-empty">
                  <Icon icon="mdi:inbox" width={36} className="opacity-40" />
                  <p style={{ marginTop: '12px' }}>
                    Este proveedor no tiene facturas registradas
                  </p>
                </div>
              ) : (
                <div className="proveedores-invoices-list">
                  {providerInvoices.map((inv) => {
                    const s = STATUS_MAP[inv.invoice.status?.toUpperCase()] ?? {
                      label: inv.invoice.status,
                      color: '#6b7280',
                      bgColor: 'rgba(107,114,128,0.1)',
                    };
                    return (
                      <div key={inv.invoice.id} className="proveedores-invoices-item">
                        <span className="proveedores-invoices-number">
                          #{inv.invoice.invoice_number}
                        </span>
                        <span className="proveedores-invoices-date">
                          {formatDate(inv.invoice.issue_date ?? inv.invoice.created_at)}
                        </span>
                        <span className="proveedores-invoices-total">
                          {formatCurrency(inv.invoice.total)}
                        </span>
                        <span
                          className="proveedores-invoices-status"
                          style={{
                            background: s.bgColor,
                            color: s.color,
                          }}
                        >
                          <span className="proveedores-status-dot" style={{ background: s.color }} />
                          {s.label}
                        </span>
                        <button
                          onClick={() => {
                            setInvoicesTarget(null);
                            navigate(`/admin/historial-facturas/${inv.invoice.id}`);
                          }}
                          className="proveedores-invoices-link"
                        >
                          Ver detalle
                          <Icon icon="mdi:arrow-right" width={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {!loadingInvoices && providerInvoices.length > 0 && (
              <div className="proveedores-invoices-footer">
                {providerInvoices.length} factura{providerInvoices.length !== 1 ? 's' : ''} encontrada{providerInvoices.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProveedorPage;
