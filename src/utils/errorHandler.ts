import axios from "axios";

export const getErrorMessage = (error: unknown): string => {
  // Error de Axios con respuesta del backend
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    // FastAPI a veces devuelve detail como array (errores de validación)
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg).join(", ");
    }
    if (typeof detail === "string") return detail;
    return error.response?.data?.message ?? "Error del servidor.";
  }
  // Error nativo de JS
  if (error instanceof Error) return error.message;
  // Fallback
  return "Ocurrió un error inesperado.";
};