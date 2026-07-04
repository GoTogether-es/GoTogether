'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { Star, Info, Send, CheckCircle } from 'lucide-react';
import { getBooking, getReportByBooking, createReport } from '@/services/api';
import type { BookingData, ReportData } from '@/types';
import { SkeletonForm } from '@/components/skeleton';
import { valoracionSchema } from '@/lib/schemas';

export default function ValoracionPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [existingReport, setExistingReport] = useState<ReportData | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors: formErrors },
  } = useForm<z.infer<typeof valoracionSchema>>({
    resolver: zodResolver(valoracionSchema),
    defaultValues: { rating: 0, summary: '' },
  });

  const rating = watch('rating');

  useEffect(() => {
    async function load() {
      try {
        const [bookingData, reportData] = await Promise.all([
          getBooking(bookingId),
          getReportByBooking(bookingId),
        ]);
        setBooking(bookingData);
        setExistingReport(reportData);
        if (reportData) {
          reset({ rating: reportData.rating, summary: reportData.summary || '' });
          setSuccess(true);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al cargar los datos';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookingId]);

  const onSubmit = async (data: z.infer<typeof valoracionSchema>) => {
    setSubmitting(true);
    setError('');
    try {
      await createReport(bookingId, { rating: data.rating, summary: data.summary || undefined });
      setSuccess(true);
      const reportData = await getReportByBooking(bookingId);
      setExistingReport(reportData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar la valoración';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto py-20">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="h-5 w-64 bg-gray-200 rounded-lg animate-pulse mb-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse">
                <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
                <div className="space-y-4">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-5 w-48 bg-gray-200 rounded" />
                  <div className="h-4 w-32 bg-gray-200 rounded mt-4" />
                  <div className="h-5 w-36 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse">
                <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-10 h-10 bg-gray-200 rounded" />)}
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-24 w-full bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  if (error && !booking) {
    return (
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto text-center py-20">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <Button variant="primary" onClick={() => router.push('/reservas')}>
              Volver a Mis Reservas
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  const companionName = booking?.companion?.profile?.fullName || 'Acompañante';

  return (
    <Section>
      <Container>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/reservas')}
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block font-medium"
          >
            &larr; Volver a Mis Reservas
          </button>

          <h1 className="text-3xl font-bold mb-2">Valoración del Servicio</h1>
          <p className="text-gray-500 mb-10">
            Tu opinión nos ayuda a mantener la seguridad y calidad de la comunidad GoTogether.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 border-0 shadow-xl shadow-gray-900/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Resumen del servicio
              </h3>
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Servicio</span>
                  <p className="font-semibold text-gray-800 mt-1">{booking?.serviceType}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Acompañante</span>
                  <p className="font-semibold text-gray-800 mt-1">{companionName}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Fecha</span>
                  <p className="font-semibold text-gray-800 mt-1">
                    {booking && new Date(booking.scheduledAt).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Estado</span>
                  <p className="font-semibold text-green-600 mt-1">Completado</p>
                </div>
                {existingReport?.summary && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-sm text-green-800 font-medium italic">
                      &quot;{existingReport.summary}&quot;
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-8 border-0 shadow-xl shadow-gray-900/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600" />
                {success && existingReport ? 'Tu valoración' : 'Tu feedback'}
              </h3>

              {success && existingReport ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                    <span className="text-green-800 font-medium">Valoración enviada correctamente</span>
                  </div>

                  <div className="flex items-center gap-1" role="img" aria-label={`${existingReport.rating} de 5 estrellas`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-8 h-8 ${star <= existingReport.rating ? 'fill-amber-400 stroke-amber-400' : 'stroke-gray-300'}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  {existingReport.summary && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Comentario</span>
                      <p className="text-gray-700 mt-1">{existingReport.summary}</p>
                    </div>
                  )}

                  <p className="text-sm text-gray-400 pt-2">
                    ¡Gracias! Tu valoración ayuda a mejorar la comunidad.
                  </p>

                  <Button
                    variant="secondary"
                    className="w-full h-12"
                    onClick={() => router.push('/reservas')}
                  >
                    Volver a Mis Reservas
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      ¿Qué puntuación le das al servicio?
                    </label>
                    <div className="flex items-center gap-1" role="radiogroup" aria-label="Puntuación del servicio" onKeyDown={(e) => {
                      const current = rating || 1;
                      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        setValue('rating', Math.min(5, current + 1));
                      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        setValue('rating', Math.max(1, current - 1));
                      }
                    }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setValue('rating', star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          tabIndex={star === 1 ? 0 : -1}
                          className="p-0.5 transition-transform hover:scale-110"
                          aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
                          role="radio"
                          aria-checked={rating === star}
                        >
                          <Star
                            className={`w-10 h-10 ${
                              star <= (hoverRating || rating)
                                ? 'fill-amber-400 stroke-amber-400'
                                : 'stroke-gray-300'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      ))}
                    </div>
                    {formErrors.rating && <p className="text-red-500 text-xs mt-1" role="alert">{formErrors.rating.message}</p>}
                    {rating > 0 && (
                      <p className="text-sm text-gray-500 mt-1 ml-1" aria-live="polite">
                        {rating === 5 && 'Excelente'}
                        {rating === 4 && 'Muy bien'}
                        {rating === 3 && 'Bien'}
                        {rating === 2 && 'Regular'}
                        {rating === 1 && 'Mala experiencia'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="summary">
                      ¿Cómo ha ido todo?
                    </label>
                    <textarea
                      id="summary"
                      className="gt-input"
                      rows={4}
                      placeholder="Ej: Todo perfecto, muy amable y atenta..."
                      {...register('summary')}
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    variant="primary"
                    className="w-full h-12 flex items-center justify-center gap-2"
                    type="submit"
                    disabled={submitting}
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Enviando...' : 'Enviar valoración'}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}
