import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

import { saveInvoice } from '../../api/services/invoice.service';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuth } from '../../context/authContext';
import {
  TransformWrapper,
  TransformComponent,
} from 'react-zoom-pan-pinch';

import type {
  ProcessInvoiceResponse,
  InvoiceSaveRequest,
} from '../../types/invoice.type';

import '../../css/pages/revisionFactura.css';

import { toast } from 'sonner';

// ──────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────

interface EditableItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// ──────────────────────────────────────────────────────────
// CONFIDENCE BADGE
// ──────────────────────────────────────────────────────────

const ConfidenceBadge = ({ value }: { value?: number }) => {
  if (value === undefined || value === null) return null;

  const pct = Math.round(value * 100);

  const color =
    pct >= 90
      ? 'confidence-high'
      : pct >= 75
      ? 'confidence-mid'
      : 'confidence-low';

  return (
    <span className={`confidence-badge ${color}`}>
      {pct}%
    </span>
  );
};

// ──────────────────────────────────────────────────────────
// FIELD ROW
// ──────────────────────────────────────────────────────────

interface FieldRowProps {
  label: string;
  value: string;
  confidence?: number;
  onChange: (val: string) => void;
  readOnly?: boolean;
  type?: string;
}

const FieldRow = ({
  label,
  value,
  confidence,
  onChange,
  readOnly,
  type = 'text',
}: FieldRowProps) => (
  <div className="field-row">
    <p className="field-label">{label}</p>

    <div className="field-input-wrap">
      <input
        type={type}
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
      />

      <ConfidenceBadge value={confidence} />
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────
// PAGE
// ──────────────────────────────────────────────────────────

const RevisionFacturasPage = () => {
  const { state } = useLocation();

  const navigate = useNavigate();

  const { user } = useAuth();

  const data: ProcessInvoiceResponse | null =
    state?.invoice ?? null;

  const fileUrl: string | null =
    state?.fileUrl ?? null;

  const fileType: string | null =
    state?.fileType ?? null;

  const ocr = data?.ocr_result ?? null;

  // ────────────────────────────────────────────────────────
  // STATES
  // ────────────────────────────────────────────────────────

  const [saving, setSaving] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [fields, setFields] = useState({
    invoice_number: String(
      ocr?.invoice?.invoice_number?.value ?? ''
    ),

    issue_date: String(
      ocr?.invoice?.issue_date?.value ?? ''
    ),

    subtotal: String(
      ocr?.invoice?.subtotal?.value ?? ''
    ),

    iva: String(
      ocr?.invoice?.iva?.value ?? ''
    ),

    total: String(
      ocr?.invoice?.total?.value ?? ''
    ),

    category: String(
      ocr?.invoice?.category?.value ?? ''
    ),

    provider_name: String(
      ocr?.provider?.name?.value ?? ''
    ),

    provider_nit: String(
      ocr?.provider?.nit?.value ?? ''
    ),
  });

  const [items, setItems] = useState<EditableItem[]>(
    ocr?.items?.map((item) => ({
      description: String(
        item.description?.value ?? ''
      ),

      quantity: Number(
        item.quantity?.value ?? 1
      ),

      unit_price: Number(
        item.unit_price?.value ?? 0
      ),

      total: Number(
        item.total?.value ?? 0
      ),
    })) ?? []
  );

  // ────────────────────────────────────────────────────────
  // GUARD
  // ────────────────────────────────────────────────────────

  if (!data || !ocr) {
    return (
      <Navigate
        to="/admin/cargar-documentos"
        replace
      />
    );
  }

  // ────────────────────────────────────────────────────────
  // HELPERS
  // ────────────────────────────────────────────────────────

  const updateField =
    (key: keyof typeof fields) =>
    (value: string) => {
      setFields((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

  const updateItem = (
    index: number,
    field: keyof EditableItem,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const updated = {
          ...item,
          [field]:
            field === 'description'
              ? value
              : Number(value),
        };

        if (
          field === 'quantity' ||
          field === 'unit_price'
        ) {
          updated.total =
            Number(updated.quantity) *
            Number(updated.unit_price);
        }

        return updated;
      })
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ────────────────────────────────────────────────────────
  // SAVE
  // ────────────────────────────────────────────────────────

  const handleGuardar = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);

      setError(null);

      const extracted_fields = [
        {
          field_name: 'invoice_number',
          field_value: fields.invoice_number,
          confidence:
            ocr.invoice.invoice_number?.confidence,
        },

        {
          field_name: 'issue_date',
          field_value: fields.issue_date,
          confidence:
            ocr.invoice.issue_date?.confidence,
        },

        {
          field_name: 'subtotal',
          field_value: fields.subtotal,
          confidence:
            ocr.invoice.subtotal?.confidence,
        },

        {
          field_name: 'iva',
          field_value: fields.iva,
          confidence:
            ocr.invoice.iva?.confidence,
        },

        {
          field_name: 'total',
          field_value: fields.total,
          confidence:
            ocr.invoice.total?.confidence,
        },
      ];

      const payload: InvoiceSaveRequest = {
        user_id: user.id,

        invoice_number: fields.invoice_number,

        issue_date:
          fields.issue_date || undefined,

        subtotal:
          parseFloat(fields.subtotal) ||
          undefined,

        iva:
          parseFloat(fields.iva) || undefined,

        total:
          parseFloat(fields.total) ||
          undefined,

        category:
          fields.category || undefined,

        status: 'PENDING',

        file_url: fileUrl ?? undefined,

        file_type: fileType ?? undefined,

        provider: {
          name: fields.provider_name,

          nit:
            fields.provider_nit ||
            undefined,

          party_type:
            ocr.provider.party_type?.value ??
            undefined,
        },

        items,

        extracted_fields,
      };

      await saveInvoice(payload);

      toast.success(
        'Factura guardada exitosamente'
      );

      navigate('/admin/historial-facturas');
    } catch (err: unknown) {
      setError(getErrorMessage(err));

      toast.error(
        'Error al guardar la factura'
      );
    } finally {
      setSaving(false);
    }
  };

  // ────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────

  return (
    <div className="revision-page pb-16">
      {/* HEADER */}
      <div className="revision-title-block">
        <h1 className="revision-title">
          Visualización
        </h1>

        <p className="revision-subtitle">
          Factura / NIT —{' '}
          {fields.provider_nit || '—'}
        </p>
      </div>

      <div className="revision-split">
        {/* ───────────────────────────────────────────── */}
        {/* VIEWER */}
        {/* ───────────────────────────────────────────── */}

        <div className="revision-viewer">
        {fileType === 'pdf' ? (
          <>
            <div className="viewer-toolbar">
              <div className="viewer-toolbar-left">
                <span className="viewer-zoom">
                  Documento PDF
                </span>
              </div>
            </div>

            <div className="viewer-body">
              <iframe
                src={fileUrl ?? ''}
                title="PDF Viewer"
                className="viewer-pdf"
              />
            </div>
          </>
        ) : (
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            centerOnInit
            wheel={{ step: 0.08 }}
          >
            {({
              zoomIn,
              zoomOut,
              resetTransform,
              state,
            }) => (
              <>
                <div className="viewer-toolbar">
                  <div className="viewer-toolbar-left">
                    <button
                      className="viewer-btn"
                      onClick={() => zoomOut()}
                    >
                      <Icon
                        icon="solar:minus-linear"
                        width={18}
                      />
                    </button>

                    <span className="viewer-zoom">
                        {Math.round(state.scale * 100)}% {/* Accede a 'state.scale' directamente */}
                    </span>

                    <button
                      className="viewer-btn"
                      onClick={() => zoomIn()}
                    >
                      <Icon
                        icon="solar:add-linear"
                        width={18}
                      />
                    </button>
                  </div>

                  <div className="viewer-toolbar-right">
                    <button
                      className="viewer-btn"
                      onClick={() => resetTransform()}
                    >
                      <Icon
                        icon="solar:restart-linear"
                        width={18}
                      />
                    </button>
                  </div>
                </div>

                <div className="viewer-body">
                  <TransformComponent
                    wrapperStyle={{
                      width: '100%',
                      height: '100%',
                    }}
                    contentStyle={{
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <div className="viewer-image-wrapper">
                      <img
                        src={fileUrl ?? ''}
                        alt={data.filename}
                        className="viewer-image"
                      />
                    </div>
                  </TransformComponent>
                </div>
              </>
            )}
          </TransformWrapper>
        )}
      </div>

        {/* ───────────────────────────────────────────── */}
        {/* PANEL */}
        {/* ───────────────────────────────────────────── */}

        <div className="revision-panel">
          <h2 className="panel-title">
            Datos Extraídos
          </h2>

          {error && (
            <div className="panel-error">
              <Icon
                icon="solar:danger-triangle-bold"
                width={18}
              />

              <span>{error}</span>
            </div>
          )}

          <div className="panel-fields">
            <FieldRow
              label="Número De Factura"
              value={fields.invoice_number}
              confidence={
                ocr.invoice.invoice_number
                  ?.confidence
              }
              onChange={updateField(
                'invoice_number'
              )}
            />

            <FieldRow
              label="Fecha"
              value={fields.issue_date}
              confidence={
                ocr.invoice.issue_date
                  ?.confidence
              }
              onChange={updateField(
                'issue_date'
              )}
            />

            <FieldRow
              label="Proveedor"
              value={fields.provider_name}
              confidence={
                ocr.provider.name?.confidence
              }
              onChange={updateField(
                'provider_name'
              )}
            />

            <FieldRow
              label="NIT"
              value={fields.provider_nit}
              confidence={
                ocr.provider.nit?.confidence
              }
              onChange={updateField(
                'provider_nit'
              )}
            />

            <FieldRow
              label="Subtotal"
              value={fields.subtotal}
              confidence={
                ocr.invoice.subtotal
                  ?.confidence
              }
              onChange={updateField('subtotal')}
              type="number"
            />

            <FieldRow
              label="IVA"
              value={fields.iva}
              confidence={
                ocr.invoice.iva?.confidence
              }
              onChange={updateField('iva')}
              type="number"
            />

            <FieldRow
              label="Total"
              value={fields.total}
              confidence={
                ocr.invoice.total?.confidence
              }
              onChange={updateField('total')}
              type="number"
            />

            <FieldRow
              label="Categoría"
              value={fields.category}
              confidence={
                ocr.invoice.category
                  ?.confidence
              }
              onChange={updateField('category')}
            />

            {/* ITEMS */}

            <div className="items-header">
              <span className="items-title">
                Ítems
              </span>

              <button
                className="add-item-btn"
                onClick={addItem}
              >
                <Icon
                  icon="solar:add-circle-linear"
                  width={16}
                />

                Agregar
              </button>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="item-card"
              >
                <div className="item-card-top">
                  <span className="item-card-title">
                    Ítem {index + 1}
                  </span>

                  <button
                    className="item-delete-btn"
                    onClick={() =>
                      removeItem(index)
                    }
                  >
                    <Icon
                      icon="solar:trash-bin-trash-linear"
                      width={16}
                    />
                  </button>
                </div>

                <FieldRow
                  label="Descripción"
                  value={item.description}
                  onChange={(v) =>
                    updateItem(
                      index,
                      'description',
                      v
                    )
                  }
                />

                <div className="item-grid">
                  <FieldRow
                    label="Cantidad"
                    type="number"
                    value={String(
                      item.quantity
                    )}
                    onChange={(v) =>
                      updateItem(
                        index,
                        'quantity',
                        v
                      )
                    }
                  />

                  <FieldRow
                    label="Precio"
                    type="number"
                    value={String(
                      item.unit_price
                    )}
                    onChange={(v) =>
                      updateItem(
                        index,
                        'unit_price',
                        v
                      )
                    }
                  />
                </div>

                <FieldRow
                  label="Total"
                  type="number"
                  value={String(item.total)}
                  onChange={(v) =>
                    updateItem(
                      index,
                      'total',
                      v
                    )
                  }
                />
              </div>
            ))}
          </div>

          {/* ACTIONS */}

          <div className="panel-actions">
            <button
              className="panel-btn panel-btn--cancel"
              onClick={() =>
                navigate(
                  '/admin/cargar-documentos'
                )
              }
              disabled={saving}
            >
              CANCELAR
            </button>

            <button
              className="panel-btn panel-btn--save"
              onClick={handleGuardar}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Icon
                    icon="solar:refresh-linear"
                    width={16}
                    className="animate-spin"
                  />

                  GUARDANDO...
                </>
              ) : (
                'GUARDAR'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionFacturasPage;