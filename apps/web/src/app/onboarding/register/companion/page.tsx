'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { Loader2, UserCircle, Briefcase, ShieldCheck } from 'lucide-react';
import { upsertProfile } from '@/services/api';
import { FileUpload } from '@/components/file-upload';
import { companionRegistrationSchema, type CompanionRegistrationFormData } from '@/lib/schemas';

export default function CompanionRegistrationPage() {
  const router = useRouter();
  const [penalCertificate, setPenalCertificate] = useState('');
  const [sexualCertificate, setSexualCertificate] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanionRegistrationFormData>({
    resolver: zodResolver(companionRegistrationSchema),
  });

  const onSubmit = async (data: CompanionRegistrationFormData) => {
    try {
      await upsertProfile({
        fullName: data.fullName,
        phone: data.phone,
        bio: data.bio,
        isCompanion: true,
        specialties: data.specialties,
        penalCertificate: penalCertificate || undefined,
        sexualCertificate: sexualCertificate || undefined,
      });
      toast.success('¡Perfil creado! Nuestro equipo revisará tu documentación.');
      setTimeout(() => router.push('/explorar'), 1500);
    } catch {
      toast.error('Error al guardar tu perfil. Inténtalo de nuevo.');
    }
  };

  return (
    <Section>
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-extrabold mb-3">Regístrate como acompañante</h1>
            <p className="text-gray-500 text-lg">
              Completa tu perfil y adjunta la documentación necesaria para ser visible en la plataforma.
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
                  <input id="fullName" className="gt-input" placeholder="Ej: María López" {...register('fullName')} />
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
                  <textarea id="bio" className="gt-input" rows={4} placeholder="Cuéntanos tu experiencia, formación..." {...register('bio')} />
                </div>
              </div>
            </Card>

            <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
              <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold">Especialidades</h3>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="specialties">
                  ¿En qué áreas puedes ayudar?
                </label>
                <input
                  id="specialties"
                  className="gt-input"
                  placeholder="Ej: Enfermería, cocina, idiomas, coche propio, acompañamiento médico..."
                  {...register('specialties')}
                />
                {errors.specialties && <p className="text-red-500 text-xs mt-1" role="alert">{errors.specialties.message}</p>}
              </div>
            </Card>

            <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
              <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold">Documentación de Verificación</h3>
              </div>

              <div className="space-y-6">
                <FileUpload
                  label="Certificado de Antecedentes Penales"
                  helper="Certificado oficial del Ministerio de Justicia que acredite que no tienes antecedentes penales. Formato PDF."
                  accept=".pdf,.jpg,.jpeg,.png"
                  onUploaded={setPenalCertificate}
                />
                {errors.penalCertificate && <p className="text-red-500 text-xs mt-1" role="alert">{errors.penalCertificate.message}</p>}

                <FileUpload
                  label="Certificado de Delitos de Naturaleza Sexual"
                  helper="Certificado oficial que acredite que no figuras en el registro de delincuentes sexuales. Formato PDF."
                  accept=".pdf,.jpg,.jpeg,.png"
                  onUploaded={setSexualCertificate}
                />
                {errors.sexualCertificate && <p className="text-red-500 text-xs mt-1" role="alert">{errors.sexualCertificate.message}</p>}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                <p className="text-sm text-yellow-800 font-medium">
                  Tu perfil será revisado por nuestro equipo de verificación. No serás visible para otros usuarios hasta que completemos el proceso de validación, que suele tardar entre 24 y 48 horas.
                </p>
              </div>
            </Card>

            <div className="flex justify-end gap-4">
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
