import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { saveInvoice } from '../../api/services/invoice.service';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuth } from '../../context/authContext';
import type { ProcessInvoiceResponse, InvoiceSaveRequest } from '../../types/invoice.type';
import '../../css/pages/revisionFactura.css';

// ─── Badge de confianza ───────────────────────────────────────────────────────

const ConfidenceBadge = ({ value }: { value?: number }) => {
  if (value === undefined || value === null) return null;
  const pct   = Math.round(value * 100);
  const color = pct >= 90 ? 'confidence-high' : pct >= 75 ? 'confidence-mid' : 'confidence-low';
  return <span className={`confidence-badge ${color}`}>{pct}%</span>;
};

// ─── Campo editable ───────────────────────────────────────────────────────────

interface FieldRowProps {
  label:       string;
  value:       string;
  confidence?: number;
  onChange:    (val: string) => void;
  readOnly?:   boolean;
}

const FieldRow = ({ label, value, confidence, onChange, readOnly }: FieldRowProps) => (
  <div className="field-row">
    <p className="field-label">{label}</p>
    <div className="field-input-wrap">
      <input
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
      />
      <ConfidenceBadge value={confidence} />
    </div>
  </div>
);

// ─── Página principal ─────────────────────────────────────────────────────────

const RevisionFacturasPage = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  // Lo que viene del navigate en CargarDocumentosPage
  const data: ProcessInvoiceResponse | null = state?.invoice ?? null;
  const ocr = data?.ocr_result ?? null;

  // ── Hooks antes de cualquier return condicional ──
  const [fields, setFields] = useState({
    invoice_number: String(ocr?.invoice?.invoice_number?.value ?? ''),
    issue_date:     String(ocr?.invoice?.issue_date?.value     ?? ''),
    subtotal:       String(ocr?.invoice?.subtotal?.value       ?? ''),
    iva:            String(ocr?.invoice?.iva?.value            ?? ''),
    total:          String(ocr?.invoice?.total?.value          ?? ''),
    category:       String(ocr?.invoice?.category?.value       ?? ''),
    provider_name:  String(ocr?.provider?.name?.value          ?? ''),
    provider_nit:   String(ocr?.provider?.nit?.value           ?? ''),
  });

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // ── Guard ──
  if (!data || !ocr) return <Navigate to="/admin/cargar-documentos" replace />;

  const updateField = (key: keyof typeof fields) => (val: string) =>
    setFields((prev) => ({ ...prev, [key]: val }));

  // ── Guardar ──────────────────────────────────────────────────────────────

  const handleGuardar = async () => {
    if (!user?.id) return;
    setSaving(true);
    setError(null);

    // Convierte los items del OCR al formato que espera el backend
    const items = ocr.items?.map((item) => ({
      description: String(item.description?.value ?? ''),
      quantity:    item.quantity?.value   ?? undefined,
      unit_price:  item.unit_price?.value ?? undefined,
      total:       item.total?.value      ?? undefined,
    })) ?? [];

    // Convierte todos los campos extraídos a ExtractedFieldCreate
    const extracted_fields = [
      { field_name: 'invoice_number', field_value: fields.invoice_number, confidence: ocr.invoice.invoice_number?.confidence },
      { field_name: 'issue_date',     field_value: fields.issue_date,     confidence: ocr.invoice.issue_date?.confidence     },
      { field_name: 'subtotal',       field_value: fields.subtotal,       confidence: ocr.invoice.subtotal?.confidence       },
      { field_name: 'iva',            field_value: fields.iva,            confidence: ocr.invoice.iva?.confidence            },
      { field_name: 'total',          field_value: fields.total,          confidence: ocr.invoice.total?.confidence          },
      { field_name: 'category',       field_value: fields.category,       confidence: ocr.invoice.category?.confidence       },
      { field_name: 'provider_name',  field_value: fields.provider_name,  confidence: ocr.provider.name?.confidence          },
      { field_name: 'nit',            field_value: fields.provider_nit,   confidence: ocr.provider.nit?.confidence           },
    ];

    const payload: InvoiceSaveRequest = {
      user_id:        user.id,
      invoice_number: fields.invoice_number,
      issue_date:     fields.issue_date     || undefined,
      subtotal:       parseFloat(fields.subtotal) || undefined,
      iva:            parseFloat(fields.iva)      || undefined,
      total:          parseFloat(fields.total)    || undefined,
      category:       fields.category             || undefined,
      status:         'PENDING',
      provider: {
        name:       fields.provider_name,
        nit:        fields.provider_nit        || undefined,
        party_type: ocr.provider.party_type?.value ?? undefined,
      },
      items,
      extracted_fields,
    };

    try {
      await saveInvoice(payload);
      navigate('/admin/historial-facturas');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="revision-page">

      <div className="revision-title-block">
        <h1 className="revision-title">Visualización</h1>
        <p className="revision-subtitle">
          Factura / NIT - {fields.provider_nit || '—'}
        </p>
      </div>

      <div className="revision-split">

        {/* ── Visor izquierdo ── */}
        <div className="revision-viewer">
          <div className="viewer-toolbar">
            <button className="viewer-btn"><Icon icon="solar:add-linear" width={16} /></button>
            <span className="viewer-zoom">100%</span>
            <button className="viewer-btn"><Icon icon="solar:minus-linear" width={16} /></button>
          </div>
          <div className="viewer-body">
            <div className="viewer-empty">
              <Icon icon="solar:file-text-linear" width={48} className="viewer-empty-icon" />
              <p>{data.filename}</p>
            </div>
          </div>
        </div>

        {/* ── Panel derecho ── */}
        <div className="revision-panel">
          <h2 className="panel-title">Datos Extraidos</h2>

          {error && (
            <div className="panel-error">
              <Icon icon="solar:danger-triangle-bold" width={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="panel-fields">
            <FieldRow label="Número De Factura" value={fields.invoice_number} confidence={ocr.invoice.invoice_number?.confidence} onChange={updateField('invoice_number')} />
            <FieldRow label="Fecha"             value={fields.issue_date}     confidence={ocr.invoice.issue_date?.confidence}     onChange={updateField('issue_date')}     />
            <FieldRow label="Proveedor"         value={fields.provider_name}  confidence={ocr.provider.name?.confidence}          onChange={updateField('provider_name')}  />
            <FieldRow label="NIT"               value={fields.provider_nit}   confidence={ocr.provider.nit?.confidence}           onChange={updateField('provider_nit')}   />
            <FieldRow label="Subtotal"          value={fields.subtotal}       confidence={ocr.invoice.subtotal?.confidence}       onChange={updateField('subtotal')}        />
            <FieldRow label="IVA"               value={fields.iva}            confidence={ocr.invoice.iva?.confidence}            onChange={updateField('iva')}             />
            <FieldRow label="Total"             value={fields.total}          confidence={ocr.invoice.total?.confidence}          onChange={updateField('total')}           />
            <FieldRow label="Categoría"         value={fields.category}       confidence={ocr.invoice.category?.confidence}       onChange={updateField('category')}        />

            {/* Items extraídos */}
            {ocr.items?.length > 0 && (
              <>
                <p className="field-label" style={{ marginTop: 8, opacity: 0.5 }}>ÍTEMS</p>
                {ocr.items.map((item, i) => (
                  <FieldRow
                    key={i}
                    label={`Ítem ${i + 1} — ${item.description?.value ?? ''}`}
                    value={`${item.quantity?.value ?? ''} x $${item.unit_price?.value ?? ''}`}
                    confidence={item.description?.confidence}
                    onChange={() => {}}
                    readOnly
                  />
                ))}
              </>
            )}
          </div>

          <div className="panel-actions">
            <button
              className="panel-btn panel-btn--cancel"
              onClick={() => navigate('/admin/cargar-documentos')}
              disabled={saving}
            >
              CANCELAR
            </button>
            <button
              className="panel-btn panel-btn--save"
              onClick={handleGuardar}
              disabled={saving}
            >
              {saving
                ? <><Icon icon="solar:refresh-linear" width={16} className="animate-spin" /> GUARDANDO...</>
                : 'GUARDAR'
              }
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RevisionFacturasPage;