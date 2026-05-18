'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { getProfile, upsertProfile } from '@/services/api';
import { Loader2, UserCircle } from 'lucide-react';
import { perfilSchema, type PerfilFormData } from '@/lib/schemas';

function PerfilContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOnboarding = searchParams.get('onboarding') === 'true';
  const roleParam = searchParams.get('role');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      fullName: '',
      headline: '',
      bio: '',
      phone: '',
      disabilityType: '',
      preferences: '',
      isCompanion: false,
      specialties: '',
    },
  });

  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    getProfile()
      .then((data) => {
        if (data) {
          reset({
            fullName: data.fullName || '',
            headline: data.headline || '',
            bio: data.bio || '',
            phone: data.phone || '',
            disabilityType: data.disabilityType || '',
            preferences: data.preferences || '',
            isCompanion: !!data.companion,
            specialties: data.companion?.specialties || '',
          });
        }
      })
      .catch(() => toast.error('Error al cargar el perfil'))
      .finally(() => setProfileLoaded(true));
  }, [reset]);

  const onSubmit = async (data: PerfilFormData) => {
    try {
      await upsertProfile(data);
      toast.success(isOnboarding ? '¡Perfil creado! Redirigiendo...' : 'Cambios guardados con éxito');
      if (isOnboarding) {
        if (roleParam === 'supervisor') {
          setTimeout(() => router.push('/onboarding/supervisor'), 1000);
        } else {
          setTimeout(() => router.push('/explorar'), 1500);
        }
      }
    } catch {
      toast.error('Hubo un error al guardar tu perfil. Inténtalo de nuevo.');
    }
  };

  if (!profileLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold mb-3">
          {isOnboarding ? '¡Te damos la bienvenida a GoTogether!' : 'Mi Cuenta'}
        </h1>
        <p className="text-gray-500 text-lg">
          {isOnboarding
            ? 'Para empezar, necesitamos conocerte un poco mejor y saber cómo quieres participar.'
            : 'Mantén tus datos actualizados para una mejor experiencia.'}
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
              <input
                id="fullName"
                className="gt-input"
                placeholder="Ej: Juan Pérez"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="headline">
                ¿A qué te dedicas?
              </label>
              <input
                id="headline"
                className="gt-input"
                placeholder="Ej: Jubilado, estudiante, enfermero..."
                {...register('headline')}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="phone">
                Teléfono de contacto
              </label>
              <input
                id="phone"
                className="gt-input"
                placeholder="+34 600 000 000"
                {...register('phone')}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="bio">
                Un poco sobre ti
              </label>
              <textarea
                id="bio"
                className="gt-input"
                rows={4}
                placeholder="Cuéntanos tus gustos, hobbies o qué buscas en GoTogether..."
                {...register('bio')}
              />
            </div>
          </div>
        </Card>

        <div className="flex flex-col md:flex-row items-center justify-end gap-6 pt-4">
          <Button
            variant="primary"
            className="w-full md:w-auto h-14 px-12 text-lg shadow-blue-600/20"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              isOnboarding ? 'Finalizar Registro' : 'Actualizar mi perfil'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Section>
      <Container>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        }>
          <PerfilContent />
        </Suspense>
      </Container>
    </Section>
  );
}
