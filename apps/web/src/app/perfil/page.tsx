'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { getProfile, upsertProfile } from '@/services/api';
import { Loader2, Pencil, X, UserCircle, Briefcase, Heart, Phone, FileText, MapPin } from 'lucide-react';
import { AvatarUpload } from '@/components/avatar-upload';
import { perfilSchema, type PerfilFormData } from '@/lib/schemas';
import { useLocationSharing } from '@/hooks/use-location-sharing';
import type { UserProfile } from '@/types';

function PerfilContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOnboarding = searchParams.get('onboarding') === 'true';
  const roleParam = searchParams.get('role');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [editing, setEditing] = useState(isOnboarding);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      fullName: '',
      headline: '',
      bio: '',
      phone: '',
      avatarUrl: '',
      disabilityType: '',
      preferences: '',
      isCompanion: false,
      specialties: '',
    },
  });

  useEffect(() => {
    getProfile()
      .then((data) => {
        if (data) {
          setProfile(data);
          setAvatarUrl(data.avatarUrl);
          reset({
            fullName: data.fullName || '',
            headline: data.headline || '',
            bio: data.bio || '',
            phone: data.phone || '',
            avatarUrl: data.avatarUrl || '',
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
    setSaving(true);
    try {
      const payload = { ...data, avatarUrl: avatarUrl || '' };
      await upsertProfile(payload);
      toast.success(isOnboarding ? 'Perfil creado con éxito' : 'Cambios guardados con éxito');
      if (isOnboarding) {
        if (roleParam === 'supervisor') {
          setTimeout(() => router.push('/onboarding/supervisor'), 1000);
        } else {
          setTimeout(() => router.push('/explorar'), 1500);
        }
      } else {
        const updated = await getProfile();
        if (updated) {
          setProfile(updated);
          setAvatarUrl(updated.avatarUrl);
        }
        setEditing(false);
      }
    } catch {
      toast.error('Hubo un error al guardar tu perfil. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatarUrl || '',
        disabilityType: profile.disabilityType || '',
        preferences: profile.preferences || '',
        isCompanion: !!profile.companion,
        specialties: profile.companion?.specialties || '',
      });
      setAvatarUrl(profile.avatarUrl);
    }
    setEditing(false);
  };

  if (!profileLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isCompanion = profile?.companion != null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center md:text-left flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">
            {isOnboarding ? 'Bienvenido a GoTogether!' : 'Mi Perfil'}
          </h1>
          <p className="text-gray-500 text-lg">
            {isOnboarding
              ? 'Para empezar, necesitamos conocerte un poco mejor.'
              : editing
                ? 'Edita tu información personal.'
                : 'Revisa y edita tu perfil cuando quieras.'}
          </p>
        </div>
        {!isOnboarding && !editing && (
          <Button
            variant="ghost"
            className="shrink-0 gap-2"
            onClick={() => setEditing(true)}
          >
            <Pencil className="w-4 h-4" />
            Editar
          </Button>
        )}
      </div>

      {/* View Mode */}
      {!editing && profile && (
        <div className="space-y-6">
          {/* Avatar + Name Card */}
          <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <AvatarUpload avatarUrl={avatarUrl} onUploaded={setAvatarUrl} readOnly />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold">{profile.fullName || 'Tu nombre'}</h2>
                {profile.headline && (
                  <p className="text-gray-500 mt-1">{profile.headline}</p>
                )}
                {profile.phone && (
                  <p className="text-gray-400 text-sm mt-2 flex items-center justify-center md:justify-start gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {profile.phone}
                  </p>
                )}
                {profile.bio && (
                  <p className="text-gray-600 mt-4 leading-relaxed">{profile.bio}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Companion Info */}
          {isCompanion && (
            <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
              <div className="flex items-center gap-3 mb-4 border-b pb-4">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold">Acompañante</h3>
              </div>
              <div className="space-y-3">
                {profile.companion?.specialties && (
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Especialidades</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {profile.companion.specialties.split(',').map((s, i) => (
                        <span key={i} className="gt-tag">{s.trim()}</span>
                      ))}
          {/* Location Sharing */}
          {!isCompanion && <LocationSharingCard />}

        </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  {profile.companion?.verified ? (
                    <span className="gt-tag flex items-center gap-1">
                      <UserCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Verificado
                    </span>
                  ) : (
                    <span className="gt-tag flex items-center gap-1 bg-amber-50 text-amber-700">
                      <UserCircle className="w-3.5 h-3.5 text-amber-500" />
                      Pendiente de verificación
                    </span>
                  )}
                  <span className="gt-tag flex items-center gap-1">
                    {profile.companion?.yearsOnPlatform ?? 0} años en la plataforma
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Disability Info */}
          {(profile.disabilityType || profile.disabilityDescription) && (
            <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
              <div className="flex items-center gap-3 mb-4 border-b pb-4">
                <Heart className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold">Discapacidad</h3>
              </div>
              <div className="space-y-3">
                {profile.disabilityType && (
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Tipo</span>
                    <p className="mt-0.5">{profile.disabilityType}</p>
                  </div>
                )}
                {profile.disabilityDescription && (
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Descripción</span>
                    <p className="mt-0.5 text-gray-600 leading-relaxed">{profile.disabilityDescription}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Preferences */}
          {profile.preferences && (
            <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
              <div className="flex items-center gap-3 mb-4 border-b pb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold">Preferencias</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{profile.preferences}</p>
            </Card>
          )}
        </div>
      )}

      {/* Edit Mode */}
      {editing && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar + Name Section */}
          <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
            <div className="flex flex-col items-center gap-6 mb-6">
              <AvatarUpload avatarUrl={avatarUrl} onUploaded={setAvatarUrl} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="fullName">
                  Nombre y apellidos *
                </label>
                <input
                  id="fullName"
                  className="gt-input"
                  placeholder="Ej: Juan Perez"
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

          {/* Companion Section */}
          {isCompanion && (
            <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold">Acompañante</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="specialties">
                    Especialidades
                  </label>
                  <input
                    id="specialties"
                    className="gt-input"
                    placeholder="Ej: Movilidad reducida, Tercera edad, Autismo..."
                    {...register('specialties')}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Disability Section */}
          <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <Heart className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold">Discapacidad</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="disabilityType">
                  Tipo de discapacidad
                </label>
                <select
                  id="disabilityType"
                  className="gt-input"
                  {...register('disabilityType')}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="movilidad">Movilidad reducida</option>
                  <option value="visual">Discapacidad visual</option>
                  <option value="auditiva">Discapacidad auditiva</option>
                  <option value="cognitiva">Discapacidad cognitiva</option>
                  <option value="otra">Otra</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="preferences">
                  Preferencias y necesidades
                </label>
                <textarea
                  id="preferences"
                  className="gt-input"
                  rows={3}
                  placeholder="Describe tus preferencias para un mejor acompanamiento..."
                  {...register('preferences')}
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col md:flex-row items-center justify-end gap-4 pt-2">
            {!isOnboarding && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={saving}
                className="w-full md:w-auto h-12 px-8"
              >
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
            )}
            <Button
              variant="primary"
              className="w-full md:w-auto h-14 px-12 text-lg shadow-blue-600/20"
              disabled={saving}
              type="submit"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                isOnboarding ? 'Finalizar Registro' : 'Guardar Cambios'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function LocationSharingCard() {
  const { sharing, lastSent, toggle } = useLocationSharing();

  return (
    <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Compartir mi ubicación</h3>
            <p className="text-sm text-gray-500">
              {sharing
                ? lastSent
                  ? `Enviada a las ${lastSent.toLocaleTimeString('es-ES')}`
                  : 'Compartiendo en tiempo real'
                : 'Permite que tu supervisor vea dónde estás'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggle}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
            sharing ? 'bg-blue-600' : 'bg-gray-200'
          }`}
          role="switch"
          aria-checked={sharing}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
              sharing ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </Card>
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