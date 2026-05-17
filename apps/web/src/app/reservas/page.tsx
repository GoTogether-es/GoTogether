'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { ShieldCheck, Calendar, MapPin, Briefcase, Clock, MessageSquare, Star } from 'lucide-react';
import { getMyBookings } from '@/services/api';
import Link from 'next/link';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  REQUESTED: 'Solicitada',
  ACCEPTED: 'Aceptada',
  DECLINED: 'Rechazada',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  REQUESTED: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  DECLINED: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function ReservasPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Section>
        <Container>
          <div className="max-w-5xl mx-auto text-center py-20">
            <p className="text-gray-500">Cargando reservas...</p>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Tus Reservas</h1>
          <p className="text-gray-500 mb-10">
            Consulta el estado de tus reservas y pagos.
          </p>

          {bookings.length === 0 ? (
            <Card className="p-12 border-0 shadow-xl shadow-gray-900/5 text-center">
              <p className="text-gray-500 text-lg mb-4">No tienes ninguna reserva aún.</p>
              <Button variant="primary" className="h-12 px-8" onClick={() => window.location.href = '/solicitud'}>
                Crear mi primera solicitud
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="p-8 border-0 shadow-xl shadow-gray-900/5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[booking.status] || 'bg-gray-100'}`}>
                          {STATUS_LABELS[booking.status] || booking.status}
                        </span>
                        {booking.companion && (
                          <span className="text-sm text-gray-500">
                            {booking.companion.profile?.fullName}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex gap-3">
                          <Briefcase className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Servicio</span>
                            <p className="font-semibold text-gray-800">{booking.serviceType}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Calendar className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Fecha</span>
                            <p className="font-semibold text-gray-800">
                              {new Date(booking.scheduledAt).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Hora</span>
                            <p className="font-semibold text-gray-800">
                              {new Date(booking.scheduledAt).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Dirección</span>
                            <p className="font-semibold text-gray-800">{booking.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {booking.payment && (
                      <div className="lg:text-right shrink-0">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Importe</span>
                        <p className="text-2xl font-black text-blue-600">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: booking.payment.currency }).format(booking.payment.amount / 100)}
                        </p>
                        <span className="text-xs text-gray-400">
                          {booking.payment.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {(booking.status === 'ACCEPTED' || booking.status === 'IN_PROGRESS') && booking.chatRoom && (
                    <div className="flex gap-2 mt-3">
                      <Link href={`/coordinacion/${booking.id}`}>
                        <Button variant="secondary" className="h-10 text-sm flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Chat
                        </Button>
                      </Link>
                    </div>
                  )}

                  {booking.status === 'COMPLETED' && (
                    <div className="flex gap-2 mt-3">
                      <Link href={`/valoracion/${booking.id}`}>
                        <Button
                          variant={booking.report ? 'ghost' : 'primary'}
                          className="h-10 text-sm flex items-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          {booking.report ? 'Ver valoración' : 'Valorar'}
                        </Button>
                      </Link>
                    </div>
                  )}

                  {booking.summary && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-500">{booking.summary}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4" />
            Pago seguro con encriptación SSL
          </div>
        </div>
      </Container>
    </Section>
  );
}
