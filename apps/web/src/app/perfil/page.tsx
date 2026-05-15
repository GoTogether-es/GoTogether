'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { getProfile, upsertProfile } from '@/services/api';
import { Loader2, CheckCircle, UserCircle, Briefcase, Heart } from 'lucide-react';
import clsx from 'clsx';

export default function PerfilPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOnboarding = searchParams.get('onboarding') === 'true';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    headline: '',
    bio: '',
    phone: '',
    disabilityType: '',
    preferences: '',
    isCompanion: false,
    specialties: '',
  });

  useEffect(() => {
    getProfile()
      .then((data) => {
        if (data) {
          setFormData({
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
      .catch((err) => {
        console.error('Error al cargar perfil:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await upsertProfile(formData);
      setSuccess(true);
      if (isOnboarding) {
        // Redirect to explore after onboarding
        setTimeout(() => router.push('/explorar'), 1500);
      } else {
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error al guardar:', err);
      alert('Hubo un error al guardar tu perfil. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Section>
      <Container>
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

          <form onSubmit={handleSubmit} className="space-y-8">
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
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="headline">
                    ¿A qué te dedicas?
                  </label>
                  <input
                    id="headline"
                    className="gt-input"
                    placeholder="Ej: Jubilado, estudiante, enfermero..."
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
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
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            <Card className={clsx(
              "p-8 border-0 shadow-xl transition-all duration-500",
              formData.isCompanion ? "bg-blue-50/50 shadow-blue-500/10" : "bg-white shadow-gray-900/5"
            )}>
              <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <Heart className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold">¿Cómo quieres usar GoTogether?</h3>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isCompanion: false })}
                    className={clsx(
                      "p-6 rounded-2xl border-2 text-left transition-all",
                      !formData.isCompanion 
                        ? "border-blue-600 bg-blue-50 ring-4 ring-blue-500/10" 
                        : "border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <h4 className="font-bold text-lg mb-1">Busco acompañamiento</h4>
                    <p className="text-sm text-gray-500">Necesito ayuda para tareas, paseos o gestiones.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isCompanion: true })}
                    className={clsx(
                      "p-6 rounded-2xl border-2 text-left transition-all",
                      formData.isCompanion 
                        ? "border-blue-600 bg-blue-50 ring-4 ring-blue-500/10" 
                        : "border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <h4 className="font-bold text-lg mb-1">Quiero ser acompañante</h4>
                    <p className="text-sm text-gray-500">Quiero ofrecer mi tiempo y habilidades.</p>
                  </button>
                </div>

                {formData.isCompanion && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
                      <Briefcase className="w-5 h-5" />
                      <h4>Detalles del Acompañante</h4>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="specialties">
                        Tus especialidades (Idiomas, movilidad, salud...)
                      </label>
                      <input
                        id="specialties"
                        className="gt-input bg-white border-blue-100"
                        placeholder="Ej: Cocina, enfermería, coche propio..."
                        value={formData.specialties}
                        onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                      />
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-blue-100 text-xs text-blue-600 leading-relaxed">
                      <strong>Nota de seguridad:</strong> Al registrarte como acompañante, nuestro equipo revisará tu perfil y te pediremos certificados de antecedentes penales antes de que seas visible para otros usuarios.
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex flex-col md:flex-row items-center justify-end gap-6 pt-4">
              {success && (
                <div className="flex items-center gap-2 text-green-600 font-bold animate-bounce">
                  <CheckCircle className="w-6 h-6" />
                  {isOnboarding ? '¡Perfil creado! Redirigiendo...' : 'Cambios guardados con éxito'}
                </div>
              )}
              <Button 
                variant="primary" 
                className="w-full md:w-auto h-14 px-12 text-lg shadow-blue-600/20" 
                disabled={saving || (isOnboarding && success)}
              >
                {saving ? (
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
      </Container>
    </Section>
  );
}
