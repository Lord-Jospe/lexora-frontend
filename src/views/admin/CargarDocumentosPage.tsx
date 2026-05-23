import { useState, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';

type FileStatus = 'idle' | 'invalid' | 'ready';

interface UploadedFile {
  name: string;
  size: string;
  format: string;
  preview?: string;
}

const VALID_FORMATS = ['pdf', 'jpg', 'jpeg', 'png'];

const formatBytes = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const CargarDocumentosPage = () => {
  const [status, setStatus]     = useState<FileStatus>('idle');
  const [file, setFile]         = useState<UploadedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef            = useRef<HTMLInputElement>(null);
  const cameraInputRef          = useRef<HTMLInputElement>(null);

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
    setFile({ name: f.name, size: formatBytes(f.size), format: ext.toUpperCase(), preview });
    setStatus('ready');
  }, []);

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
    setStatus('idle');
    setFile(null);
    if (fileInputRef.current)   fileInputRef.current.value  = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-5 w-full">

      {/* ── Título ── */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Carga De Documentos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Nueva carga</p>
      </div>

      {/* ── Dropzone ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          w-full border-2 border-dashed rounded-xl p-10
          flex flex-col items-center gap-7
          transition-colors duration-200
          ${dragOver ? 'border-primary bg-lightprimary' : 'border-violet-500 bg-violet-100'}
        `}
      >
        <p className="text-xl font-semibold text-foreground text-center">
          ¡Sube tu factura o tómale una foto!
        </p>

        <div className="flex gap-4 flex-wrap justify-center w-full max-w-2xl">
          {/* Subir factura */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-w-[200px] flex flex-col items-center gap-2
                       bg-dark text-white font-semibold text-[15px]
                       py-5 px-6 rounded-xl
                       hover:opacity-80 hover:shadow-lg
                       transition-all duration-200 cursor-pointer"
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

          {/* Tomar foto */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 min-w-[200px] flex flex-col items-center gap-2
                       bg-dark text-white font-semibold text-[15px]
                       py-5 px-6 rounded-xl
                       hover:opacity-80 hover:shadow-lg
                       transition-all duration-200 cursor-pointer"
          >
            <span>Tomar foto</span>
            <Icon icon="solar:camera-linear" width={22} />
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

      {/* ── Alert formato inválido ── */}
      {status === 'invalid' && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-success text-white font-medium text-sm w-full">
          <Icon icon="solar:danger-circle-bold" width={22} className="flex-shrink-0" />
          <span>Formato no válido. Por favor, ingrese JPG, PDF o PNG.</span>
        </div>
      )}

      {/* ── Preview ── */}
      {status === 'ready' && file && (
        <div className="flex items-start gap-10 flex-wrap">

          {/* Thumbnail */}
          <div className="flex flex-col items-center gap-2 w-40">
            {file.preview ? (
              <img
                src={file.preview}
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

          {/* Metadata */}
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
      )}

      {/* ── Acciones ── */}
      {status === 'ready' && (
        <div className="flex justify-end gap-3 pt-2 pb-6">
          <button
            onClick={handleCancel}
            className="px-7 py-2.5 rounded-xl text-sm font-semibold
                       border border-border text-foreground
                       hover:bg-muted transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            className="px-7 py-2.5 rounded-xl text-sm font-semibold
                       bg-violet-500 text-white
                       hover:bg-violet-600 shadow-btn-shadow
                       transition-all duration-200 cursor-pointer"
          >
            Extraer datos
          </button>
        </div>
      )}

    </div>
  );
};

export default CargarDocumentosPage;