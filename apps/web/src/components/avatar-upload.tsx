'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type AvatarUploadProps = {
  avatarUrl: string | null;
  onUploaded: (url: string) => void;
  readOnly?: boolean;
};

export function AvatarUpload({ avatarUrl, onUploaded, readOnly }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Selecciona una imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5 MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No estás autenticado');

      const ext = file.name.split('.').pop() || 'jpg';
      const key = `${session.user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(key, file, { contentType: file.type, upsert: true });

      if (uploadError) throw new Error(uploadError.message || 'Error al subir la imagen');

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(key);
      onUploaded(urlData.publicUrl);
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="relative group inline-block">
      <div
        className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-blue-50 flex items-center justify-center ${
          !readOnly && !uploading ? 'cursor-pointer' : ''
        }`}
        onClick={() => !readOnly && !uploading && inputRef.current?.click()}
        role={readOnly ? undefined : 'button'}
        aria-label={readOnly ? undefined : 'Cambiar foto de perfil'}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Foto de perfil"
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-16 h-16 text-blue-200" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2c0 .66.54 1.2 1.2 1.2h16.8c.66 0 1.2-.54 1.2-1.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        )}

        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}

        {!readOnly && !uploading && (
          <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1 text-center">{error}</p>
      )}

      {!readOnly && (
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFile}
          className="hidden"
          aria-label="Subir foto de perfil"
        />
      )}
    </div>
  );
}