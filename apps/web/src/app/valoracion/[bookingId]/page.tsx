'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { Star, MessageCircle, Info, Send, CheckCircle } from 'lucide-react';
import { getBooking, getReportByBooking, createReport } from '@/services/api';

export default function ValoracionPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<any>(null);
  const [existingReport, setExistingReport] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
          setRating(reportData.rating);
          setSummary(reportData.summary || '');
          setSuccess(true);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookingId]);

  const handleSubmit = async () => {
    if (rating < 1) {
      setError('Selecciona una puntuación de estrellas');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createReport(bookingId, { rating, summary: summary || undefined });
      setSuccess(true);
      const reportData = await getReportByBooking(bookingId);
      setExistingReport(reportData);
    } catch (err: any) {
      setError(err.message || 'Error al enviar la valoración');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto text-center py-20">
            <p className="text-gray-500">Cargando...</p>
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
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      ¿Qué puntuación le das al servicio?
                    </label>
                    <div className="flex items-center gap-1" role="radiogroup" aria-label="Puntuación del servicio">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
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
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
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
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Enviando...' : 'Enviar valoración'}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}
