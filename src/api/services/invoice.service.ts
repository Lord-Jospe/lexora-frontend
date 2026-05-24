import api from './axios';
import type {
  ProcessInvoiceResponse,
  InvoiceFullRead,
  InvoiceSaveRequest,
  InvoicesByDateParams,
  PaginationParams,
} from '../../types/invoice.type';

export const processInvoice = async (file: File): Promise<ProcessInvoiceResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<ProcessInvoiceResponse>('/invoices/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const saveInvoice = async (data: InvoiceSaveRequest): Promise<InvoiceFullRead> => {
  const response = await api.post<InvoiceFullRead>('/invoices/save', data);
  return response.data;
};

export const listInvoices = async (): Promise<InvoiceFullRead[]> => {
  const response = await api.get<InvoiceFullRead[]>('/invoices/');
  return response.data;
};

export const getInvoiceById = async (invoiceId: string): Promise<InvoiceFullRead> => {
  const response = await api.get<InvoiceFullRead>(`/invoices/${invoiceId}`);
  return response.data;
};

export const getInvoicesByDate = async (params: InvoicesByDateParams): Promise<InvoiceFullRead[]> => {
  const response = await api.get<InvoiceFullRead[]>('/invoices/by-date', { params });
  return response.data;
};

export const getInvoicesByProvider = async (providerId: string, pagination?: PaginationParams): Promise<InvoiceFullRead[]> => {
  const response = await api.get<InvoiceFullRead[]>(`/invoices/provider/${providerId}`, { params: pagination });
  return response.data;
};

export const getInvoicesByCategory = async (category: string, pagination?: PaginationParams): Promise<InvoiceFullRead[]> => {
  const response = await api.get<InvoiceFullRead[]>(`/invoices/category/${category}`, { params: pagination });
  return response.data;
};

export const getInvoicesByStatus = async (status: string, pagination?: PaginationParams): Promise<InvoiceFullRead[]> => {
  const response = await api.get<InvoiceFullRead[]>(`/invoices/status/${status}`, { params: pagination });
  return response.data;
};

type ExportFormat = 'csv' | 'xml' | 'pdf';

const exportMimeTypes: Record<ExportFormat, string> = {
  csv: 'text/csv',
  xml: 'application/xml',
  pdf: 'application/pdf',
};

export const exportInvoice = async (invoiceId: string, format: ExportFormat): Promise<void> => {
  const response = await api.get(`/invoices/${invoiceId}/export/${format}`, { responseType: 'blob' });
  const url  = URL.createObjectURL(new Blob([response.data], { type: exportMimeTypes[format] }));
  const link = document.createElement('a');
  link.href  = url;
  link.download = `factura_${invoiceId}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};