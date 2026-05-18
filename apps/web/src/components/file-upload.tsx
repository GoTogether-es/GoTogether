'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { env } from '@/lib/env';
import { getAccessToken } from '@/services/api';

type FileUploadProps = {
  onUploaded: (url: string) => void;
  accept: string;
  label: string;
  helper?: string;
  uploadedUrl?: string;
};

export function FileUpload({ onUploaded, accept, label, helper, uploadedUrl }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [done, setDone] = useState(!!uploadedUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No estás autenticado');

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const key = `certificates/${Date.now()}-${safeName}`;

      const presignRes = await fetch(`${env.apiUrl}/uploads/presign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ key, contentType: file.type }),
      });

      if (!presignRes.ok) {
        const errBody = await presignRes.text().catch(() => '');
        throw new Error(errBody || `Error ${presignRes.status} al preparar la subida`);
      }

      const { url: presignedUrl } = await presignRes.json();

      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadRes.ok) throw new Error('Error al subir el archivo');

      const publicUrl = `${env.supabaseUrl}/storage/v1/object/public/certificates/${key}`;
      onUploaded(publicUrl);
      setDone(true);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Error al subir el archivo');
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
            : error
              ? 'border-red-300 bg-red-50'
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
              {error ? error : 'Haz clic para seleccionar archivo'}
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
