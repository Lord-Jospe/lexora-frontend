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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PARTY_TYPE_OPTIONS = ['DISTRIBUTOR', 'CLIENT', 'SUPPLIER'];

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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  VALIDATED: { label: 'Validado',  color: '#16a34a' },
  PENDING:   { label: 'Pendiente', color: '#a16207' },
  ERROR:     { label: 'Rechazado', color: '#dc2626' },
};

// ─── Clases reutilizables ──────────────────────────────────────────────────────

const inputCls = `w-full px-3 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600
  bg-background text-foreground text-sm outline-none
  focus:border-violet-500 transition-colors`;

const btnPrimary = `flex items-center gap-2 px-4 py-2.5 rounded-xl
  bg-violet-500 text-white text-sm font-semibold
  hover:bg-violet-600 shadow-btn-shadow transition-all cursor-pointer
  disabled:opacity-60 disabled:cursor-not-allowed`;

const btnOutline = `px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700
  text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer`;

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
    <div className="flex flex-col gap-5 w-full pb-16">

      {/* ── Título ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Proveedores</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona tus proveedores y sus facturas</p>
        </div>
        <button onClick={() => setShowCreate(true)} className={btnPrimary}>
          <Icon icon="solar:add-linear" width={18} />
          Nuevo proveedor
        </button>
      </div>

      {/* ── Buscador ── */}
      <div className="relative max-w-sm">
        <Icon icon="solar:magnifer-linear" width={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nombre o NIT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700
                     bg-background text-foreground text-sm outline-none focus:border-violet-500 transition-colors"
        />
      </div>

      {/* ── Tabla ── */}
      <div className="bg-card border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700 font-bold text-foreground">
          Proveedores ({filtered.length})
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Icon icon="solar:refresh-linear" width={28} className="animate-spin" />
            <p className="text-sm">Cargando proveedores...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Icon icon="solar:users-group-rounded-linear" width={40} className="opacity-40" />
            <p className="text-sm">No se encontraron proveedores</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground">NIT</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground">Tipo</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground">Facturas</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((party) => (
                <tr
                  key={party.id}
                  className="border-b border-gray-50 dark:border-gray-800 last:border-0
                             hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">{party.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                    {party.nit ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full
                                     bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                      {party.party_type ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openInvoices(party)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary
                                 hover:underline transition-colors"
                    >
                      <Icon icon="solar:document-text-linear" width={14} />
                      Ver facturas
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(party)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg
                                   text-muted-foreground hover:bg-violet-100 hover:text-violet-600
                                   dark:hover:bg-violet-900/30 transition-colors"
                        title="Editar"
                      >
                        <Icon icon="solar:pen-linear" width={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(party)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg
                                   text-muted-foreground hover:bg-lighterror hover:text-error
                                   transition-colors"
                        title="Eliminar"
                      >
                        <Icon icon="solar:trash-bin-trash-linear" width={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          MODAL — Crear proveedor
      ══════════════════════════════════════════════════════ */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-card border-2 border-gray-200 dark:border-gray-700
                          rounded-2xl p-6 shadow-lg mx-4">
            <h3 className="text-xl font-bold text-foreground mb-1">Nuevo proveedor</h3>
            <p className="text-sm text-muted-foreground mb-5">Completa los datos del proveedor</p>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Nombre *</label>
                <input
                  type="text"
                  placeholder="Ej: Farmacias SAS"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">NIT</label>
                <input
                  type="text"
                  placeholder="Ej: 900123456"
                  value={createForm.nit ?? ''}
                  onChange={(e) => setCreateForm({ ...createForm, nit: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Tipo</label>
                <select
                  value={createForm.party_type ?? 'DISTRIBUTOR'}
                  onChange={(e) => setCreateForm({ ...createForm, party_type: e.target.value })}
                  className={inputCls}
                >
                  {PARTY_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className={btnOutline}>Cancelar</button>
              <button onClick={handleCreate} disabled={saving} className={btnPrimary}>
                {saving
                  ? <><Icon icon="solar:refresh-linear" width={14} className="animate-spin" /> Creando...</>
                  : <><Icon icon="solar:add-linear" width={14} /> Crear proveedor</>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-card border-2 border-gray-200 dark:border-gray-700
                          rounded-2xl p-6 shadow-lg mx-4">
            <h3 className="text-xl font-bold text-foreground mb-1">Editar proveedor</h3>
            <p className="text-sm text-muted-foreground mb-5">{editTarget.name}</p>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Nombre *</label>
                <input
                  type="text"
                  value={editForm.name ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">NIT</label>
                <input
                  type="text"
                  value={editForm.nit ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, nit: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Tipo</label>
                <select
                  value={editForm.party_type ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, party_type: e.target.value })}
                  className={inputCls}
                >
                  {PARTY_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditTarget(null)} className={btnOutline}>Cancelar</button>
              <button onClick={handleEditSave} disabled={saving} className={btnPrimary}>
                {saving
                  ? <><Icon icon="solar:refresh-linear" width={14} className="animate-spin" /> Guardando...</>
                  : <><Icon icon="solar:diskette-linear" width={14} /> Guardar</>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm bg-card border-2 border-gray-200 dark:border-gray-700
                          rounded-2xl p-6 shadow-lg mx-4">
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-lighterror flex items-center justify-center">
                <Icon icon="solar:trash-bin-trash-bold" width={24} className="text-error" />
              </div>
              <h3 className="text-xl font-bold text-foreground">¿Eliminar proveedor?</h3>
              <p className="text-sm text-muted-foreground">
                Se eliminará <strong className="text-foreground">{deleteTarget.name}</strong>.
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className={`flex-1 ${btnOutline}`}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                           rounded-xl bg-error text-white text-sm font-semibold
                           hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {deleting
                  ? <><Icon icon="solar:refresh-linear" width={14} className="animate-spin" /> Eliminando...</>
                  : <><Icon icon="solar:trash-bin-trash-linear" width={14} /> Sí, eliminar</>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl bg-card border-2 border-gray-200 dark:border-gray-700
                          rounded-2xl shadow-lg mx-4 flex flex-col max-h-[85vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4
                            border-b-2 border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Facturas de {invoicesTarget.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  NIT: {invoicesTarget.nit ?? '—'}
                </p>
              </div>
              <button
                onClick={() => setInvoicesTarget(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground
                           hover:bg-muted transition-colors"
              >
                <Icon icon="solar:close-linear" width={20} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-4">
              {loadingInvoices ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                  <Icon icon="solar:refresh-linear" width={26} className="animate-spin" />
                  <p className="text-sm">Cargando facturas...</p>
                </div>
              ) : providerInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                  <Icon icon="solar:inbox-linear" width={36} className="opacity-40" />
                  <p className="text-sm">Este proveedor no tiene facturas registradas</p>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">N° Factura</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Fecha</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Total</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Estado</th>
                      <th className="px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {providerInvoices.map((inv) => {
                      const s = STATUS_MAP[inv.invoice.status?.toUpperCase()] ?? { label: inv.invoice.status, color: '#6b7280' };
                      return (
                        <tr
                          key={inv.invoice.id}
                          className="border-b border-gray-50 dark:border-gray-800 last:border-0
                                     hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-mono text-foreground">
                            #{inv.invoice.invoice_number}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(inv.invoice.issue_date ?? inv.invoice.created_at)}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-foreground">
                            {formatCurrency(inv.invoice.total)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={{
                                background: `${s.color}18`,
                                color: s.color,
                              }}
                            >
                              {s.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setInvoicesTarget(null);
                                navigate(`/admin/historial-facturas/${inv.invoice.id}`);
                              }}
                              className="flex items-center gap-1 text-xs font-semibold text-primary
                                         hover:underline transition-colors"
                            >
                              Ver detalle
                              <Icon icon="solar:alt-arrow-right-linear" width={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            {!loadingInvoices && providerInvoices.length > 0 && (
              <div className="px-6 py-3 border-t-2 border-gray-200 dark:border-gray-700
                              text-xs text-muted-foreground">
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