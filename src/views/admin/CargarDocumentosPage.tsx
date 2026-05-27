import { useState, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { processInvoice } from '../../api/services/invoice.service';
import { getErrorMessage } from '../../utils/errorHandler';
import type { ProcessInvoiceResponse } from '../../types/invoice.type';
import { toast } from 'sonner';

type FileStatus = 'idle' | 'invalid' | 'ready' | 'processing' | 'camera';

interface UploadedFile {
  name: string;
  size: string;
  format: string;
  preview?: string;
  raw: File;
}

const VALID_FORMATS = ['pdf', 'jpg', 'jpeg', 'png'];

const formatBytes = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isMobile = (): boolean =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const CargarDocumentosPage = () => {
  const navigate = useNavigate();

  const [status, setStatus]                 = useState<FileStatus>('idle');
  const [file, setFile]                     = useState<UploadedFile | null>(null);
  const [dragOver, setDragOver]             = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [cameraError, setCameraError]       = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const streamRef      = useRef<MediaStream | null>(null);

  // ── Callback ref para el <video>: asigna el stream justo cuando el nodo entra al DOM ──
  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play();
    }
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const processFile = useCallback((f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!VALID_FORMATS.includes(ext)) {
      setStatus('invalid');
      setFile(null);
      return;
    }
    const preview = ['jpg', 'jpeg', 'png'].includes(ext)
      ? URL.createObjectURL(f)
      : undefined;
    setFile({ name: f.name, size: formatBytes(f.size), format: ext.toUpperCase(), preview, raw: f });
    setStatus('ready');
    setError(null);
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // ── Handlers de archivo ────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const handleCancel = () => {
    stopStream();
    setStatus('idle');
    setFile(null);
    setError(null);
    setCameraError(null);
    setCapturedPreview(null);
    if (fileInputRef.current)   fileInputRef.current.value  = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // ── Lógica de cámara ───────────────────────────────────────────────────────

  const handleTakePhoto = async () => {
    setCameraError(null);

    if (isMobile()) {
      cameraInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setStatus('camera'); // El callback ref se dispara con el stream ya listo
    } catch (err) {
      const msg =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado. Habilítalo en la configuración del navegador.'
          : 'No se pudo acceder a la cámara.';
      setCameraError(msg);
    }
  };

  const handleCapture = () => {
    const canvas = canvasRef.current;
    const video  = document.querySelector('video') as HTMLVideoElement | null;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const fileName = `foto_${Date.now()}.jpg`;
      const f = new File([blob], fileName, { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(blob);
      stopStream();
      setCapturedPreview(previewUrl);
      processFile(f); // Cambia status a 'ready'
    }, 'image/jpeg', 0.92);
  };

  // ── Extracción ─────────────────────────────────────────────────────────────

  const handleExtraerDatos = async () => {
    if (!file) return;
    setStatus('processing');
    setError(null);

    try {
      const result: ProcessInvoiceResponse = await processInvoice(file.raw);
      navigate('/admin/revision-facturas', {
        state: { invoice: result, fileUrl: result.file_url, fileType: file.format.toLowerCase() },
      });
      toast.success('Datos extraídos correctamente');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setStatus('ready');
      toast.error('Error al extraer los datos');
    }
  };

  const isProcessing = status === 'processing';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 w-full pb-10">

      {/* ── Título ── */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Carga De Documentos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Nueva carga</p>
      </div>

      {/* ── Vista de cámara (solo desktop) ── */}
      {status === 'camera' && (
        <div className="flex flex-col items-center gap-4 w-full">
          <video
            ref={videoRef}
            className="w-full max-w-2xl rounded-xl border border-border shadow-md bg-black"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold
                         border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleCapture}
              className="px-7 py-2.5 rounded-xl text-sm font-semibold
                         bg-violet-500 text-white hover:bg-violet-600
                         shadow-btn-shadow transition-all duration-200 cursor-pointer
                         flex items-center gap-2"
            >
              <Icon icon="solar:camera-bold" width={18} />
              Capturar foto
            </button>
          </div>
        </div>
      )}

      {/* ── Dropzone (oculta mientras la cámara está activa) ── */}
      {status !== 'camera' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`
            w-full border-2 border-dashed rounded-xl p-10
            flex flex-col items-center gap-7 transition-colors duration-200
            ${dragOver ? 'border-primary bg-lightprimary' : 'border-violet-500 bg-violet-100'}
          `}
        >
          <p className="text-xl font-semibold text-foreground text-center">
            ¡Sube tu factura o tómale una foto!
          </p>

          <div className="flex gap-4 flex-wrap justify-center w-full max-w-2xl">
            {/* Botón subir archivo */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex-1 min-w-[200px] flex flex-col items-center gap-2
                         bg-dark text-white font-semibold text-[15px]
                         py-5 px-6 rounded-xl hover:opacity-80 hover:shadow-lg
                         transition-all duration-200 cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Subir factura</span>
              <Icon icon="solar:upload-linear" width={22} />
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />
            </button>

            {/* Botón cámara */}
            <button
              onClick={handleTakePhoto}
              disabled={isProcessing}
              className="flex-1 min-w-[200px] flex flex-col items-center gap-2
                         bg-dark text-white font-semibold text-[15px]
                         py-5 px-6 rounded-xl hover:opacity-80 hover:shadow-lg
                         transition-all duration-200 cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Tomar foto</span>
              <Icon icon="solar:camera-linear" width={22} />
              {/* Input oculto solo para móvil */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </button>
          </div>
        </div>
      )}

      {/* ── Alert formato inválido ── */}
      {status === 'invalid' && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-success text-white font-medium text-sm w-full">
          <Icon icon="solar:danger-circle-bold" width={22} className="flex-shrink-0" />
          <span>Formato no válido. Por favor, ingrese JPG, PDF o PNG.</span>
        </div>
      )}

      {/* ── Error de cámara ── */}
      {cameraError && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-lighterror text-error font-medium text-sm w-full">
          <Icon icon="solar:camera-slash-bold" width={22} className="flex-shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* ── Error del backend ── */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-lighterror text-error font-medium text-sm w-full">
          <Icon icon="solar:danger-triangle-bold" width={22} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Preview ── */}
      {(status === 'ready' || status === 'processing') && file && (
        <div className="flex flex-col gap-3 w-full">

          {/* Banner de confirmación si viene de cámara */}
          {capturedPreview && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-100 text-violet-700 text-sm font-medium">
              <Icon icon="solar:check-circle-bold" width={18} />
              Foto capturada correctamente. Revísala antes de extraer los datos.
            </div>
          )}

          <div className="flex items-start gap-10 flex-wrap">
            <div className="flex flex-col items-center gap-2 w-40">
              {(capturedPreview ?? file.preview) ? (
                <img
                  src={capturedPreview ?? file.preview}
                  alt="preview"
                  className="w-40 h-52 object-cover rounded-xl border border-border shadow-md"
                />
              ) : (
                <div className="w-40 h-52 rounded-xl border border-border bg-muted
                                flex flex-col items-center justify-center gap-3 p-4">
                  <Icon icon="solar:file-text-bold" width={40} className="text-primary" />
                  <span className="text-xs text-muted-foreground text-center break-all leading-snug">
                    {file.name}
                  </span>
                </div>
              )}
              <span className="w-full text-center text-xs text-white bg-dark px-2 py-1.5 rounded-lg truncate">
                {file.name}
              </span>
            </div>

            <ul className="mt-4 flex flex-col gap-3">
              <li className="flex items-center gap-3 text-sm text-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span><strong>Tamaño:</strong> {file.size}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span><strong>Formato:</strong> {file.format}</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ── Acciones ── */}
      {(status === 'ready' || status === 'processing') && (
        <div className="flex justify-end gap-3 pt-2 pb-6">
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            className="px-7 py-2.5 rounded-xl text-sm font-semibold
                       border border-border text-foreground
                       hover:bg-muted transition-colors cursor-pointer
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleExtraerDatos}
            disabled={isProcessing}
            className="px-7 py-2.5 rounded-xl text-sm font-semibold
                       bg-violet-500 text-white hover:bg-violet-600
                       shadow-btn-shadow transition-all duration-200 cursor-pointer
                       disabled:opacity-60 disabled:cursor-not-allowed
                       flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Icon icon="solar:refresh-linear" width={16} className="animate-spin" />
                Procesando...
              </>
            ) : (
              'Extraer datos'
            )}
          </button>
        </div>
      )}

    </div>
  );
};

export default CargarDocumentosPage;