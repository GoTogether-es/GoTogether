'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { getMyBookings, getOpenBookings, updateBookingStatus, getProfile, getCompanionAvailability, setMyAvailability, requestCompletion } from '@/services/api';
import { Loader2, CalendarDays, ClipboardList, CheckCircle, XCircle, Clock, MessageCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import type { BookingData, AvailabilitySlotData } from '@/types';
import { toast } from 'sonner';
import { AvailabilityGrid } from '@/components/availability-grid';
import { StatCard } from '@/components/StatCard';
import { DAY_NAMES, LOCALE } from '@/lib/constants';

export default function PanelPage() {
  const router = useRouter();
  const mountedRef = useRef(true);
  const [myBookings, setMyBookings] = useState<BookingData[]>([]);
  const [openBookings, setOpenBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlotData[]>([]);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const debouncedSave = useCallback(
    (newSlots: { dayOfWeek: number; startTime: string; endTime: string }[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        setSavingAvailability(true);
        try {
          const result = await setMyAvailability(newSlots);
          setAvailabilitySlots(result);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Error al guardar disponibilidad';
          toast.error(message);
        } finally {
          setSavingAvailability(false);
        }
      }, 1500);
    },
    [],
  );

  const loadData = useCallback(async () => {
    try {
      const [my, open, profile] = await Promise.all([
        getMyBookings(),
        getOpenBookings(),
        getProfile(),
      ]);
      if (!mountedRef.current) return;
      if (!profile?.companion) {
        router.push('/perfil');
        return;
      }

      if (!mountedRef.current) return;
      setMyBookings(my);
      setOpenBookings(open);
      setVerified(profile?.companion?.verified ?? null);

      if (profile?.companion) {
        const slots = await getCompanionAvailability(profile.companion.id);
        if (!mountedRef.current) return;
        setAvailabilitySlots(slots);
      }
    } catch {
      toast.error('Error al cargar los datos');
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleAction = useCallback(async (id: string, action: 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED') => {
    setActionLoading(id);
    try {
      await updateBookingStatus(id, action);
      toast.success(action === 'ACCEPTED' ? 'Solicitud aceptada' : action === 'DECLINED' ? 'Solicitud rechazada' : 'Estado actualizado');
      loadData();
    } catch {
      toast.error('Error al actualizar');
    } finally {
      setActionLoading(null);
    }
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAvailabilityChange = useCallback(
    (newSlots: { dayOfWeek: number; startTime: string; endTime: string }[]) => {
      setAvailabilitySlots(newSlots as AvailabilitySlotData[]);
      debouncedSave(newSlots);
    },
    [debouncedSave],
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const pendingCount = myBookings.filter((b) => b.status === 'REQUESTED').length;
  const activeCount = myBookings.filter((b) => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS').length;
  const completedCount = myBookings.filter((b) => b.status === 'COMPLETED').length;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-600',
      REQUESTED: 'bg-amber-100 text-amber-700',
      ACCEPTED: 'bg-blue-100 text-blue-700',
      DECLINED: 'bg-red-100 text-red-700',
      IN_PROGRESS: 'bg-purple-100 text-purple-700',
      COMPLETED: 'bg-emerald-100 text-emerald-700',
      CANCELLED: 'bg-gray-200 text-gray-500',
    };
    const labels: Record<string, string> = {
      DRAFT: 'Borrador',
      REQUESTED: 'Pendiente',
      ACCEPTED: 'Aceptada',
      DECLINED: 'Rechazada',
      IN_PROGRESS: 'En curso',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[status] || 'bg-gray-100 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <Section>
        <Container>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold mb-2">Panel de Acompañante</h1>
            <p className="text-gray-500 text-lg">Gestiona tus servicios y descubre nuevas solicitudes.</p>
          </div>

          {verified === false && (
            <Card className="p-5 border-amber-200 bg-amber-50 mb-6 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold text-amber-800">Documentos en revisión</p>
                <p className="text-sm text-amber-700">Tu documentación está siendo revisada. No serás visible para otros usuarios hasta que se complete la verificación.</p>
              </div>
            </Card>
          )}
          {verified === true && (
            <Card className="p-5 border-emerald-200 bg-emerald-50 mb-6 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-800">Perfil verificado</p>
                <p className="text-sm text-emerald-700">Tu documentación ha sido aprobada. Eres visible para los usuarios en la plataforma.</p>
              </div>
            </Card>
          )}

          {/* Availability */}
          {verified !== null && (
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                Mi disponibilidad semanal
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Selecciona tus franjas arrastrando el ratón. Los clientes verán esto como referencia, pero podrán solicitarte en cualquier horario.
                {savingAvailability && (
                  <span className="ml-2 inline-flex items-center gap-1 text-blue-600">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    guardando...
                  </span>
                )}
              </p>
              <AvailabilityGrid
                slots={availabilitySlots}
                onChange={handleAvailabilityChange}
                disabled={false}
              />
              {availabilitySlots.length === 0 && !savingAvailability && (
                <p className="text-sm text-gray-400 mt-3 text-center">
                  No has configurado tu disponibilidad. Arrastra sobre la cuadrícula para empezar.
                </p>
              )}
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Pendientes" value={pendingCount} color="amber" icon={Clock} />
            <StatCard label="Activas" value={activeCount} color="blue" icon={ClipboardList} />
            <StatCard label="Completadas" value={completedCount} color="emerald" icon={CheckCircle} />
          </div>

          {/* Open Marketplace - Pending Bookings */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-amber-600" />
              Solicitudes abiertas ({openBookings.length})
            </h2>
            {openBookings.length === 0 ? (
              <Card className="p-8 text-center text-gray-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No hay solicitudes abiertas en este momento.
              </Card>
            ) : (
              <div className="space-y-4">
                {openBookings.map((b) => (
                  <Card key={b.id} className="p-6 border-l-4 border-l-amber-400">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold text-lg">{b.client?.profile?.fullName || 'Cliente'}</p>
                          {statusBadge(b.status)}
                        </div>
                        <p className="text-gray-600 mb-2">{b.serviceType}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                          <span>{new Date(b.scheduledAt).toLocaleString(LOCALE, { dateStyle: 'long', timeStyle: 'short' })}</span>
                          <span>{b.address}</span>
                          {b.disability && <span className="gt-tag text-xs">{b.disability}</span>}
                        </div>
                        {b.summary && <p className="text-gray-500 text-sm mt-2">{b.summary}</p>}
                        <Link href={`/explorar/${b.companionId || b.clientId}`} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2">
                          Ver detalle →
                        </Link>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="primary"
                          className="px-4 py-2 text-sm"
                          onClick={() => handleAction(b.id, 'ACCEPTED')}
                          disabled={actionLoading === b.id}
                        >
                          {actionLoading === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                          {actionLoading !== b.id && 'Aceptar'}
                        </Button>
                        <Button
                          variant="ghost"
                          className="px-4 py-2 text-sm border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleAction(b.id, 'DECLINED')}
                          disabled={actionLoading === b.id}
                        >
                          <XCircle className="w-4 h-4" aria-label="Rechazar" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* My Assigned Bookings */}
          <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
              Mis servicios ({myBookings.length})
            </h2>
            {myBookings.length === 0 ? (
              <Card className="p-8 text-center text-gray-400">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No tienes servicios asignados.
              </Card>
            ) : (
              <div className="space-y-4">
                {myBookings.map((b) => (
                  <Card key={b.id} className="p-6 border-l-4 border-l-emerald-400">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold text-lg">{b.client?.profile?.fullName || 'Cliente'}</p>
                          {statusBadge(b.status)}
                        </div>
                        <p className="text-gray-600 mb-2">{b.serviceType}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                          <span>{new Date(b.scheduledAt).toLocaleString(LOCALE, { dateStyle: 'long', timeStyle: 'short' })}</span>
                          <span>{b.address}</span>
                          {b.disability && <span className="gt-tag text-xs">{b.disability}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {b.status === 'ACCEPTED' && b.chatRoom && (
                          <Link href={`/coordinacion/${b.id}`}>
                            <Button variant="primary" className="px-4 py-2 text-sm" aria-label="Iniciar chat">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Chat
                            </Button>
                          </Link>
                        )}
                        {b.status === 'ACCEPTED' && (
                          <Button
                            variant="secondary"
                            className="px-4 py-2 text-sm"
                            onClick={() => handleAction(b.id, 'IN_PROGRESS')}
                            disabled={actionLoading === b.id}
                          >
                            {actionLoading === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Iniciar'}
                          </Button>
                        )}
                        {b.status === 'IN_PROGRESS' && (
                          <>
                            {b.chatRoom && (
                              <Link href={`/coordinacion/${b.id}`}>
                                <Button variant="ghost" className="px-4 py-2 text-sm" aria-label="Iniciar chat">
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  Chat
                                </Button>
                              </Link>
                            )}
                            <Button
                              variant="primary"
                              className="px-4 py-2 text-sm"
                              onClick={async () => {
                                setActionLoading(b.id);
                                try {
                                  await requestCompletion(b.id);
                                  toast.success('Solicitud enviada al cliente');
                                } catch { toast.error('Error al solicitar finalización'); }
                                finally { setActionLoading(null); }
                              }}
                              disabled={actionLoading === b.id}
                            >
                              {actionLoading === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                              {actionLoading !== b.id && 'Solicitar finalizar'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}