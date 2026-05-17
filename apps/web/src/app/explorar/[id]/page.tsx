'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { ShieldCheck, Star, MapPin, Phone, Calendar, CheckCircle } from 'lucide-react';
import { getCompanionById } from '@/services/api';
import { CompanionDetail } from '@/types';
import { SkeletonText, SkeletonAvatar } from '@/components/skeleton';

export default function CompanionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [companion, setCompanion] = useState<CompanionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCompanionById(id)
      .then((data) => {
        setCompanion(data);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <SkeletonText width="30%" height="1rem" />
            <div className="mt-6 p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8">
                <SkeletonAvatar size="10rem" />
                <div className="flex-1 space-y-4">
                  <SkeletonText width="50%" height="1.75rem" />
                  <SkeletonText width="70%" />
                  <div className="flex gap-4">
                    <SkeletonText width="6rem" height="1.5rem" />
                    <SkeletonText width="8rem" height="1.5rem" />
                  </div>
                  <SkeletonText width="90%" />
                  <SkeletonText width="80%" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  if (error || !companion) {
    return (
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto text-center py-20">
            <p className="text-gray-500 text-lg mb-4">Acompañante no encontrado</p>
            <Button variant="primary" onClick={() => router.push('/explorar')}>
              Volver a Explorar
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  const { profile, specialties, verified, rating, yearsOnPlatform, completedServices, averageRating, recentRatings } = companion;

  return (
    <Section>
      <Container>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/explorar')}
            className="text-sm text-blue-600 hover:text-blue-800 mb-6 inline-block font-medium"
            aria-label="Volver a resultados de búsqueda"
          >
            &larr; Volver a resultados
          </button>

          <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="shrink-0">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-300 overflow-hidden">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={`Foto de ${profile.fullName}`}
                      fill
                      sizes="(max-width: 768px) 128px, 160px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2c0 .66.54 1.2 1.2 1.2h16.8c.66 0 1.2-.54 1.2-1.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold">{profile.fullName}</h1>
                  {verified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                      Verificado
                    </span>
                  )}
                </div>

                {profile.headline && (
                  <p className="text-lg text-gray-600 font-medium">{profile.headline}</p>
                )}

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-1.5" aria-label={`Valoración: ${rating.toFixed(1)} sobre 5 en ${completedServices} servicios`}>
                    <Star className="w-5 h-5 fill-amber-400 stroke-amber-400" aria-hidden="true" />
                    <span className="font-bold text-lg">{rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">
                      ({completedServices} {completedServices === 1 ? 'servicio' : 'servicios'})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    <span className="font-bold">{yearsOnPlatform}</span>
                    <span className="text-sm text-gray-500">
                      {yearsOnPlatform === 1 ? 'año en GoTogether' : 'años en GoTogether'}
                    </span>
                  </div>
                </div>

                {specialties && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {specialties.split(',').map((s) => (
                      <span key={s.trim()} className="gt-tag text-sm">{s.trim()}</span>
                    ))}
                  </div>
                )}

                {profile.bio && (
                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Sobre mí</h3>
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                )}

                {profile.disabilityType && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    <span>Experiencia con: <strong>{profile.disabilityType}</strong></span>
                  </div>
                )}

                {profile.preferences && (
                  <div className="pt-1">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Preferencias</h3>
                    <p className="text-gray-700 text-sm">{profile.preferences}</p>
                  </div>
                )}
              </div>
            </div>

            {averageRating !== null && recentRatings && recentRatings.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-bold mb-4">
                  Valoraciones ({recentRatings.length})
                </h3>
                <div className="flex items-center gap-2 mb-3" aria-label={`Puntuación media: ${averageRating.toFixed(1)} sobre 5`}>
                  <span className="text-2xl font-black text-blue-600">{averageRating.toFixed(1)}</span>
                  <div className="flex" role="img" aria-label={`${Math.round(averageRating)} de 5 estrellas`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'fill-amber-400 stroke-amber-400' : 'stroke-gray-300'}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">media</span>
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <Button
                variant="primary"
                className="h-12 px-8"
                onClick={() => router.push(`/solicitud?companionId=${id}`)}
              >
                Solicitar acompañante
              </Button>
              <Button
                variant="ghost"
                className="h-12 px-8"
                onClick={() => router.push('/explorar')}
              >
                Volver
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
