import api from './axios';
import type {
  ProcessInvoiceResponse,
  InvoiceFullRead,
  InvoiceSaveRequest,
  InvoicesByDateParams,
  PaginationParams,
  InvoiceUpdateRequest,
  InvoiceStatusUpdateRequest,
} from '../../types/invoice.type';

export const processInvoice = async (file: File): Promise<ProcessInvoiceResponse> => {
  try{
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ProcessInvoiceResponse>('/invoices/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;

  } catch (error){
    console.error('Register error:', error);
    throw error;
  }
};

export const saveInvoice = async (data: InvoiceSaveRequest): Promise<InvoiceFullRead> => {
  const response = await api.post<InvoiceFullRead>('/invoices/save', data);
  return response.data;
};

// ← ACTUALIZADO: Recibe user_id y parámetros de paginación
export const listInvoices = async (userId: string, skip: number = 0, limit: number = 100): Promise<InvoiceFullRead[]> => {
  const response = await api.get<InvoiceFullRead[]>('/invoices/', { 
    params: { user_id: userId, skip, limit } 
  });
  return response.data;
};

// ← NUEVO: Para obtener facturas recientes rápido (sin filtro de user)
export const getRecentInvoices = async (userId: string, limit: number = 5): Promise<InvoiceFullRead[]> => {
  const response = await api.get<InvoiceFullRead[]>('/invoices/', { 
    params: { user_id: userId, skip: 0, limit }
  });
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
  const response = await api.get(
    `/invoices/${invoiceId}/export/${format}`,
    { responseType: 'blob' }  // ← El token se añade automáticamente por el interceptor
  );
  
  const url = URL.createObjectURL(new Blob([response.data], { type: exportMimeTypes[format] }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `factura_${invoiceId}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


export const updateInvoice = async (invoiceId: string, data: InvoiceUpdateRequest)
: Promise<InvoiceFullRead> => {
  const response = await api.patch<InvoiceFullRead>(`/invoices/${invoiceId}`,data);

  return response.data;
};

export const updateInvoiceStatus = async (
  invoiceId: string,
  data: InvoiceStatusUpdateRequest
): Promise<InvoiceFullRead> => {

  const response = await api.patch<InvoiceFullRead>(
    `/invoices/${invoiceId}/status`,
    null,
    {
      params: {
        status: data.status
      }
    }
  );
  return response.data;
};

export const deleteInvoice = async (invoiceId: string): Promise<void> => {
  await api.delete(`/invoices/${invoiceId}`);
};