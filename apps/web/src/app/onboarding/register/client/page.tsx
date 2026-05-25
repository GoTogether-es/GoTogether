'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { Loader2, UserCircle, FileText, Heart } from 'lucide-react';
import { upsertProfile } from '@/services/api';
import { FileUpload } from '@/components/file-upload';
import { StepIndicator } from '@/components/step-indicator';
import { clientRegistrationSchema, type ClientRegistrationFormData } from '@/lib/schemas';
import { DISABILITY_OPTIONS } from '@/lib/constants';

const STORAGE_KEY = 'gotogether-client-registration';
const DOC_STORAGE_KEY = 'gotogether-client-doc';

export default function ClientRegistrationPage() {
  const router = useRouter();
  const [disabilityDocument, setDisabilityDocument] = useState(() => {
    try { return sessionStorage.getItem(DOC_STORAGE_KEY) || ''; } catch (err: unknown) { if (process.env.NODE_ENV === 'development') console.error('sessionStorage read error:', err); return ''; }
  });

  const saved = (() => { try { return sessionStorage.getItem(STORAGE_KEY); } catch (err: unknown) { if (process.env.NODE_ENV === 'development') console.error('sessionStorage read error:', err); return null; } })();
  const initialData = saved ? JSON.parse(saved) : {};

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClientRegistrationFormData>({
    resolver: zodResolver(clientRegistrationSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    const sub = watch((data) => {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (err: unknown) { if (process.env.NODE_ENV === 'development') console.error('sessionStorage write error:', err); }
    });
    return () => sub.unsubscribe();
  }, [watch]);

  useEffect(() => {
    try { sessionStorage.setItem(DOC_STORAGE_KEY, disabilityDocument); } catch (err: unknown) { if (process.env.NODE_ENV === 'development') console.error('sessionStorage write error:', err); }
  }, [disabilityDocument]);

  useEffect(() => {
    if (saved) toast('Formulario restaurado', { description: 'Tus datos anteriores se han recuperado.' });
  }, []);

  const onSubmit = async (data: ClientRegistrationFormData) => {
    try {
      await upsertProfile({
        ...data,
        isCompanion: false,
        disabilityDocument: disabilityDocument || undefined,
      });
      try { sessionStorage.removeItem(STORAGE_KEY); sessionStorage.removeItem(DOC_STORAGE_KEY); } catch (err: unknown) { if (process.env.NODE_ENV === 'development') console.error('sessionStorage remove error:', err); }
      toast.success('¡Perfil creado! Bienvenido a GoTogether.');
      setTimeout(() => router.push('/explorar'), 1500);
    } catch {
      toast.error('Error al guardar tu perfil. Inténtalo de nuevo.');
    }
  };

  return (
    <Section>
      <Container>
        <div className="max-w-4xl mx-auto">
          <StepIndicator
            steps={[
              { label: 'Elegir rol' },
              { label: 'Completar perfil' },
              { label: 'Empezar' },
            ]}
            currentStep={1}
            className="mb-8"
          />

          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-extrabold mb-3">Completa tu perfil</h1>
            <p className="text-gray-500 text-lg">
              Cuéntanos sobre ti y tus necesidades para encontrar al acompañante ideal.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
              <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <UserCircle className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold">Información Personal</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="fullName">
                    Nombre y apellidos
                  </label>
                  <input id="fullName" className="gt-input" placeholder="Ej: Juan Pérez" {...register('fullName')} />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1" role="alert">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="phone">
                    Teléfono de contacto
                  </label>
                  <input id="phone" className="gt-input" placeholder="+34 600 000 000" {...register('phone')} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="bio">
                    Un poco sobre ti
                  </label>
                  <textarea id="bio" className="gt-input" rows={4} placeholder="Cuéntanos tus gustos, hobbies..." {...register('bio')} />
                </div>
              </div>
            </Card>

            <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
              <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <Heart className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold">Sobre tu discapacidad</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="disabilityType">
                    Tipo de discapacidad
                  </label>
                  <select id="disabilityType" className="gt-input" {...register('disabilityType')}>
                    <option value="">Seleccionar...</option>
                    {DISABILITY_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.disabilityType && <p className="text-red-500 text-xs mt-1" role="alert">{errors.disabilityType.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="disabilityDescription">
                    Describe tu situación
                  </label>
                  <textarea
                    id="disabilityDescription"
                    className="gt-input"
                    rows={3}
                    placeholder="Ej: Tengo movilidad reducida desde hace 5 años. Uso silla de ruedas y necesito ayuda para desplazarme..."
                    {...register('disabilityDescription')}
                  />
                </div>
                <div className="md:col-span-2">
                  <FileUpload
                    label="Documento acreditativo de discapacidad"
                    helper="Certificado oficial de discapacidad, informe médico o documento equivalente. Formatos: PDF, JPG, PNG (máx. 10MB)"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onUploaded={setDisabilityDocument}
                  />
                  {errors.disabilityDocument && <p className="text-red-500 text-xs mt-1" role="alert">{errors.disabilityDocument.message}</p>}
                </div>
              </div>
            </Card>

            <div className="flex justify-between gap-4">
              <Button variant="ghost" className="h-14 px-8" type="button" onClick={() => router.push('/onboarding')}>
                Volver
              </Button>
              <Button variant="primary" className="h-14 px-12 text-lg shadow-blue-600/20" disabled={isSubmitting} type="submit">
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Guardando...</> : 'Finalizar Registro'}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </Section>
  );
}
