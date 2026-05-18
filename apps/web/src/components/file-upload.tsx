'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, FileText } from 'lucide-react';
import { env } from '@/lib/env';

type FileUploadProps = {
  onUploaded: (url: string) => void;
  accept: string;
  label: string;
  helper?: string;
  uploadedUrl?: string;
};

export function FileUpload({ onUploaded, accept, label, helper, uploadedUrl }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [done, setDone] = useState(!!uploadedUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);

    try {
      const key = `certificates/${Date.now()}-${file.name}`;
      const baseUrl = env.apiUrl;

      const presignRes = await fetch(`${baseUrl}/uploads/presign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, contentType: file.type }),
        credentials: 'include',
      });

      if (!presignRes.ok) throw new Error('Error al generar URL de subida');

      const presignedUrl = await presignRes.text();

      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadRes.ok) throw new Error('Error al subir el archivo');

      const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL || '';
      const publicUrl = `${publicBase}/${key}`;
      onUploaded(publicUrl);
      setDone(true);
    } catch (err) {
      console.error('Upload failed:', err);
      setFileName(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || done}
        className={`w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-2xl transition-colors ${
          done
            ? 'border-green-300 bg-green-50 cursor-default'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
        } disabled:opacity-60`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm text-blue-600 font-medium">Subiendo {fileName}...</span>
          </>
        ) : done ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700 font-medium">
              {fileName || 'Archivo subido correctamente'}
            </span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500 font-medium">
              {fileName ? fileName : 'Haz clic para seleccionar archivo'}
            </span>
          </>
        )}
      </button>
      {helper && <p className="text-xs text-gray-400 mt-1">{helper}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        className="hidden"
        aria-label={label}
      />
    </div>
  );
}
