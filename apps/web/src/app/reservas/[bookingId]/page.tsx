'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Card, Container, Section } from '@gotogether/ui';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Flag,
  Loader2,
  MapPin,
  MessageSquare,
  PlayCircle,
  Star,
  User,
  XCircle,
} from 'lucide-react';
import { LinkButton } from '@/components/link-button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { createClient } from '@/lib/supabase/client';
import { useBooking, useProfile } from '@/services/queries';
import {
  completeByClient,
  requestCompletion,
  updateBookingStatus,
} from '@/services/api';
import { SkeletonBookingCard, SkeletonText } from '@/components/skeleton';

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  REQUESTED: 'Pendiente de aceptación',
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

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId);
  const { data: profile } = useProfile();
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    createClient()
      .auth.getSession()
      .then(
        ({
          data,
        }: {
          data: { session: { user: { id: string } } | null } | null;
        }) => {
          if (!cancelled) setMyUserId(data?.session?.user?.id ?? null);
        },
      );
    return () => {
      cancelled = true;
    };
  }, []);

  const isClient = !!myUserId && booking?.clientId === myUserId;
  const isAssignedCompanion =
    !!profile?.companion && !!booking && booking.companionId === profile.companion.id;

  const backHref = isAssignedCompanion ? '/panel' : '/reservas';

  const handleStatus = async (status: string) => {
    setActionLoading(status);
    try {
      await updateBookingStatus(bookingId, status);
      toast.success(
        status === 'ACCEPTED'
          ? 'Solicitud aceptada'
          : status === 'DECLINED'
            ? 'Solicitud rechazada'
            : 'Estado actualizado',
      );
      await refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar el estado');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestCompletion = async () => {
    setActionLoading('completion');
    try {
      await requestCompletion(bookingId);
      toast.success('Solicitud de finalización enviada al cliente');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al solicitar la finalización');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteByClient = async () => {
    setActionLoading('complete');
    try {
      await completeByClient(bookingId);
      toast.success('Servicio finalizado');
      router.push(`/valoracion/${bookingId}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al finalizar');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto">
            <Breadcrumbs
              items={[{ label: 'Reservas', href: '/reservas' }, { label: 'Detalle' }]}
              className="mb-6"
            />
            <SkeletonText width="40%" height="1.75rem" />
            <div className="mt-6">
              <SkeletonBookingCard />
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  if (isError || !booking) {
    return (
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto py-10 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-3">No pudimos cargar la reserva</h1>
            <p className="text-gray-500 mb-6">
              Puede que la reserva no exista o que no tengas permiso para verla.
            </p>
            <Button variant="secondary" onClick={() => router.push(backHref)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  const status = booking.status;
  const scheduledAt = new Date(booking.scheduledAt);
  const pricePerHourCents =
    booking.service?.price && booking.service.price > 0 ? booking.service.price : 1300;
  const estimatedHours = booking.estimatedHours || 1;
  const estimatedCost = (estimatedHours * pricePerHourCents) / 100;
  const canChat = ['ACCEPTED', 'IN_PROGRESS'].includes(status);
  const hasReport = !!booking.report;

  return (
    <Section>
      <Container>
        <div className="max-w-3xl mx-auto">
          <Breadcrumbs
            items={[{ label: 'Reservas', href: '/reservas' }, { label: 'Detalle' }]}
            className="mb-6"
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Solicitud de acompañamiento
              </h1>
              <p className="text-gray-500">{booking.serviceType}</p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold w-fit ${
                STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {STATUS_LABELS[status] || status}
            </span>
          </div>

          <Card className="p-6 border-0 shadow-xl shadow-blue-900/5 mb-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-start gap-2.5 text-sm">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                <dt className="text-gray-500 w-24 shrink-0">Fecha</dt>
                <dd className="font-semibold text-gray-800">
                  {scheduledAt.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </dd>
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                <dt className="text-gray-500 w-24 shrink-0">Hora</dt>
                <dd className="font-semibold text-gray-800">
                  {scheduledAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </dd>
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                <dt className="text-gray-500 w-24 shrink-0">Duración</dt>
                <dd className="font-semibold text-gray-800">
                  {estimatedHours} {estimatedHours === 1 ? 'hora' : 'horas'}
                </dd>
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <Briefcase className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                <dt className="text-gray-500 w-24 shrink-0">Servicio</dt>
                <dd className="font-semibold text-gray-800">{booking.serviceType}</dd>
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                <dt className="text-gray-500 w-24 shrink-0">Dirección</dt>
                <dd className="font-semibold text-gray-800">{booking.address}</dd>
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                <dt className="text-gray-500 w-24 shrink-0">Cliente</dt>
                <dd className="font-semibold text-gray-800">
                  {booking.client?.profile?.fullName || 'Cliente'}
                </dd>
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                <dt className="text-gray-500 w-24 shrink-0">Acompañante</dt>
                <dd className="font-semibold text-gray-800">
                  {booking.companion?.profile?.fullName || 'Sin asignar'}
                </dd>
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <Star className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                <dt className="text-gray-500 w-24 shrink-0">Importe</dt>
                <dd className="font-bold text-green-700">
                  {eur.format(estimatedCost)}
                  <span className="text-xs font-normal text-gray-500 ml-1">
                    ({eur.format(pricePerHourCents / 100)}/h · {estimatedHours}h)
                  </span>
                </dd>
              </div>
            </dl>

            {booking.disability && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-700 mb-1">Necesidades / Discapacidad</p>
                <p className="text-sm text-gray-600">{booking.disability}</p>
              </div>
            )}

            {booking.summary && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-700 mb-1">Observaciones</p>
                <p className="text-sm text-gray-600">{booking.summary}</p>
              </div>
            )}

            {booking.payment && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-700 mb-1">Pago</p>
                <p className="text-sm text-gray-600">
                  {booking.payment.status === 'HOLD'
                    ? `Retenido en espera de confirmación (${eur.format(booking.payment.amount / 100)} + ${eur.format(booking.payment.fee / 100)} de gestión)`
                    : booking.payment.status === 'CONFIRMED'
                      ? `Confirmado (${eur.format(booking.payment.amount / 100)} + ${eur.format(booking.payment.fee / 100)} de gestión)`
                      : `Estado: ${booking.payment.status}`}
                </p>
              </div>
            )}
          </Card>

          <Card className="p-6 border-0 shadow-xl shadow-blue-900/5">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Acciones</h2>

            <div className="flex flex-wrap gap-3">
              {status === 'REQUESTED' && isAssignedCompanion && (
                <>
                  <Button
                    variant="primary"
                    disabled={!!actionLoading}
                    onClick={() => handleStatus('ACCEPTED')}
                  >
                    {actionLoading === 'ACCEPTED' ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Aceptar solicitud
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={!!actionLoading}
                    onClick={() => handleStatus('DECLINED')}
                  >
                    {actionLoading === 'DECLINED' ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Rechazar
                  </Button>
                </>
              )}

              {status === 'ACCEPTED' && isAssignedCompanion && (
                <Button variant="primary" disabled={!!actionLoading} onClick={() => handleStatus('IN_PROGRESS')}>
                  {actionLoading === 'IN_PROGRESS' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <PlayCircle className="w-4 h-4 mr-2" />
                  )}
                  Iniciar servicio
                </Button>
              )}

              {status === 'IN_PROGRESS' && isAssignedCompanion && (
                <Button variant="primary" disabled={!!actionLoading} onClick={handleRequestCompletion}>
                  {actionLoading === 'completion' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Flag className="w-4 h-4 mr-2" />
                  )}
                  Solicitar finalización
                </Button>
              )}

              {status === 'IN_PROGRESS' && isClient && (
                <Button variant="primary" disabled={!!actionLoading} onClick={handleCompleteByClient}>
                  {actionLoading === 'complete' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Confirmar finalización
                </Button>
              )}

              {canChat && (isClient || isAssignedCompanion) && (
                <LinkButton href={`/coordinacion/${bookingId}`} variant="secondary">
                  <MessageSquare className="w-4 h-4 mr-2" /> Chat
                </LinkButton>
              )}

              {status === 'COMPLETED' && isClient && !hasReport && (
                <LinkButton href={`/valoracion/${bookingId}`} variant="secondary">
                  <Star className="w-4 h-4 mr-2" /> Valorar servicio
                </LinkButton>
              )}

              {(status === 'DECLINED' || status === 'CANCELLED' || status === 'COMPLETED') &&
                !canChat &&
                !(isClient && !hasReport) && (
                  <p className="text-sm text-gray-500 self-center">No hay acciones disponibles para este estado.</p>
                )}
            </div>
          </Card>

          <div className="mt-6">
            <Button variant="ghost" onClick={() => router.push(backHref)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}