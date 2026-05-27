import type { PartyRead, PartyCreate } from './party.type';
export type { PartyRead, PartyCreate };

// ─── Estructura del OCR (lo que devuelve /invoices/process) ──────────────────

interface ConfidenceField<T> {
  value: T | null;
  confidence: number;
}

export interface OCRInvoice {
  invoice_number: ConfidenceField<string>;
  issue_date:     ConfidenceField<string>;
  subtotal:       ConfidenceField<number>;
  iva:            ConfidenceField<number>;
  total:          ConfidenceField<number>;
  category:       ConfidenceField<string>;
}

export interface OCRProvider {
  name:       ConfidenceField<string>;
  nit:        ConfidenceField<string>;
  party_type: ConfidenceField<string>;
}

export interface OCRItem {
  description: ConfidenceField<string>;
  quantity:    ConfidenceField<number>;
  unit_price:  ConfidenceField<number>;
  total:       ConfidenceField<number>;
}

export interface OCRResult {
  invoice:  OCRInvoice;
  provider: OCRProvider;
  items:    OCRItem[];
}

// Lo que devuelve POST /invoices/process
export interface ProcessInvoiceResponse {
  filename:   string;
  file_url:   string;  
  ocr_result: OCRResult;
}

// ─── Requests (para /invoices/save) ──────────────────────────────────────────

export interface InvoiceItemCreate {
  description: string;
  quantity?:   number;
  unit_price?: number;
  total?:      number;
}

export interface ExtractedFieldCreate {
  field_name:  string;
  field_value?: string;
  confidence?: number;
}

export interface InvoiceSaveRequest {
  user_id:          string;
  invoice_number:   string;
  issue_date?:      string;
  subtotal?:        number;
  iva?:             number;
  total?:           number;
  category?:        string;
  status?:          string;
  file_url?:        string;  
  file_type?:       string;  
  provider:         PartyCreate;
  items?:           InvoiceItemCreate[];
  extracted_fields?: ExtractedFieldCreate[];
}

// ─── Responses (para /invoices/save y GET) ────────────────────────────────────

export interface InvoiceRead {
  id:             string;
  user_id:        string;
  invoice_number: string;
  issue_date?:    string;
  subtotal?:      number;
  iva?:           number;
  total?:         number;
  category?:      string;
  status:         string;
  created_at:     string;
}

export interface InvoiceItemRead {
  id:           string;
  description:  string;
  quantity?:    number;
  unit_price?:  number;
  total?:       number;
}

export interface DocumentRead {
  id:          string;
  file_name:   string;
  file_url?:   string;
  uploaded_at: string;
}

export interface ExtractedFieldRead {
  id:           string;
  field_name:   string;
  field_value?: string;
  confidence?:  number;
}

export interface InvoiceFullRead {
  invoice:          InvoiceRead;
  provider:         PartyRead;
  items:            InvoiceItemRead[];
  document?:        DocumentRead;
  extracted_fields: ExtractedFieldRead[];
}

// ─── Parámetros de consulta ───────────────────────────────────────────────────

export interface InvoicesByDateParams {
  start_date: string;
  end_date:   string;
  skip?:      number;
  limit?:     number;
}

export interface PaginationParams {
  skip?:  number;
  limit?: number;
}


// -- Parámetros para actualizar una factura
export interface InvoiceItemUpdate {
  id?: string;
  description: string;
  quantity?: number;
  unit_price?: number;
  total?: number;

}

export interface InvoiceUpdateRequest {
  category?: string;
  issue_date?: string;
  subtotal?: number;
  iva?: number;
  total?: number;
  items?: (InvoiceItemUpdate | Omit<InvoiceItemUpdate, 'id'>)[];
  delete_items?: string[];
}

export interface InvoiceStatusUpdateRequest  {
  status: string;
}