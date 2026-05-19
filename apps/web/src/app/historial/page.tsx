'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { useBookingHistory, useBookingStats } from '@/services/queries';
import { Briefcase, Calendar, Clock, MapPin, Star, ChevronLeft, ChevronRight, TrendingUp, Award } from 'lucide-react';

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

export default function HistorialPage() {
  const [page, setPage] = useState(1);
  const { data: history, isLoading } = useBookingHistory({ page, limit: 10 });
  const { data: stats, isLoading: statsLoading } = useBookingStats();

  return (
    <Section>
      <Container>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Historial de servicios</h1>
          <p className="text-gray-500 mb-8">
            Consulta todos tus servicios completados y tus estadísticas.
          </p>

          {!statsLoading && stats && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="p-5 bg-emerald-50 border-emerald-100 text-center">
                <Award className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <p className="text-2xl font-extrabold text-emerald-700">{stats.completed}</p>
                <p className="text-xs font-medium text-gray-500">Servicios completados</p>
              </Card>
              <Card className="p-5 bg-amber-50 border-amber-100 text-center">
                <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <p className="text-2xl font-extrabold text-amber-700">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '—'}
                </p>
                <p className="text-xs font-medium text-gray-500">Valoración media</p>
              </Card>
              <Card className="p-5 bg-blue-50 border-blue-100 text-center">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <p className="text-2xl font-extrabold text-blue-700">{stats.withRating}</p>
                <p className="text-xs font-medium text-gray-500">Valoraciones recibidas</p>
              </Card>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                </Card>
              ))}
            </div>
          ) : !history || history.data.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">No tienes servicios en el historial.</p>
              <Link href="/solicitud">
                <Button variant="primary">Crear mi primera solicitud</Button>
              </Link>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {history.data.map((booking) => (
                  <Card key={booking.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[booking.status] || 'bg-gray-100'}`}>
                            {STATUS_LABELS[booking.status] || booking.status}
                          </span>
                          {booking.companion?.profile?.fullName && (
                            <span className="text-sm text-gray-500">{booking.companion.profile.fullName}</span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Servicio</span>
                              <p className="font-semibold text-gray-800">{booking.serviceType}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Fecha</span>
                              <p className="font-semibold text-gray-800">
                                {new Date(booking.scheduledAt).toLocaleDateString('es-ES', { dateStyle: 'long' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Hora</span>
                              <p className="font-semibold text-gray-800">
                                {new Date(booking.scheduledAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Dirección</span>
                              <p className="font-semibold text-gray-800">{booking.address}</p>
                            </div>
                          </div>
                        </div>
                        {booking.report && (
                          <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm">
                            <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                            <span className="font-bold">{booking.report.id}</span>
                            <Link href={`/valoracion/${booking.id}`} className="text-blue-600 hover:underline text-xs">
                              Ver valoración
                            </Link>
                          </div>
                        )}
                      </div>
                      {booking.service && (
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Precio orientativo</span>
                          <p className="text-lg font-bold text-blue-600">
                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(booking.service.price / 100)}/h
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {history.meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="ghost"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-500">
                    Página {page} de {history.meta.totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= history.meta.totalPages}
                    className="flex items-center gap-1"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Container>
    </Section>
  );
}
