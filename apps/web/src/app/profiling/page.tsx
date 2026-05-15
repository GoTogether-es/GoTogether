'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { getProfile, upsertProfile } from '@/services/api';
import { Loader2, CheckCircle } from 'lucide-react';

export default function ProfilingPage() {
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
        console.error('Failed to load profile:', err);
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
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      alert('Error al guardar el perfil. Por favor, asegúrate de estar autenticado.');
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
          <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
          <p className="text-gray-500 mb-8">
            Mantén tus datos actualizados para mejorar la confianza en la plataforma.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="p-8">
              <h3 className="text-xl font-bold mb-6 border-b pb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2" htmlFor="fullName">
                    Nombre Completo
                  </label>
                  <input
                    id="fullName"
                    className="gt-input"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="headline">
                    Titular / Profesión
                  </label>
                  <input
                    id="headline"
                    className="gt-input"
                    placeholder="Ej: Estudiante de Psicología"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="phone">
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    className="gt-input"
                    placeholder="+34 ..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2" htmlFor="bio">
                    Sobre mí
                  </label>
                  <textarea
                    id="bio"
                    className="gt-input"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-bold mb-6 border-b pb-4">Rol en GoTogether</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isCompanion"
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.isCompanion}
                    onChange={(e) => setFormData({ ...formData, isCompanion: e.target.checked })}
                  />
                  <label htmlFor="isCompanion" className="font-semibold">
                    Quiero ser acompañante (Companion)
                  </label>
                </div>

                {formData.isCompanion && (
                  <div className="bg-blue-50 p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-sm font-semibold mb-2" htmlFor="specialties">
                        Tus especialidades o habilidades
                      </label>
                      <input
                        id="specialties"
                        className="gt-input bg-white"
                        placeholder="Ej: Idiomas, enfermería, conducción, paseos..."
                        value={formData.specialties}
                        onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-blue-600 font-medium">
                      * Como acompañante, revisaremos tus antecedentes antes de que puedas ser visible.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex items-center justify-end gap-4">
              {success && (
                <div className="flex items-center gap-2 text-green-600 font-medium animate-in fade-in">
                  <CheckCircle className="w-5 h-5" />
                  Perfil guardado con éxito
                </div>
              )}
              <Button variant="primary" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Actualizar mi perfil'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </Section>
  );
}
