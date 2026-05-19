'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { getMyBookings, getOpenBookings, updateBookingStatus, getProfile, getCompanionAvailability, setMyAvailability } from '@/services/api';
import { Loader2, CalendarDays, ClipboardList, CheckCircle, XCircle, Clock, MessageCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import type { BookingData, AvailabilitySlotData } from '@/types';
import { toast } from 'sonner';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const TIME_SLOTS = [
  { label: 'Mañana', start: '08:00', end: '12:00' },
  { label: 'Tarde', start: '12:00', end: '17:00' },
  { label: 'Noche', start: '17:00', end: '21:00' },
];

export default function PanelPage() {
  const [myBookings, setMyBookings] = useState<BookingData[]>([]);
  const [openBookings, setOpenBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlotData[]>([]);
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [my, open, profile] = await Promise.all([
        getMyBookings(),
        getOpenBookings(),
        getProfile(),
      ]);
      setMyBookings(my);
      setOpenBookings(open);
      setVerified(profile?.companion?.verified ?? null);

      if (profile?.companion) {
        const slots = await getCompanionAvailability(profile.companion.id);
        setAvailabilitySlots(slots);
      }
    } catch {
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED') => {
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
  };

  const toggleAvailability = async (dayOfWeek: number, slot: { start: string; end: string }) => {
    const exists = availabilitySlots.some(
      (s) => s.dayOfWeek === dayOfWeek && s.startTime === slot.start && s.endTime === slot.end,
    );

    let newSlots: { dayOfWeek: number; startTime: string; endTime: string }[];
    if (exists) {
      newSlots = availabilitySlots
        .filter((s) => !(s.dayOfWeek === dayOfWeek && s.startTime === slot.start && s.endTime === slot.end))
        .map((s) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime }));
    } else {
      newSlots = [
        ...availabilitySlots.map((s) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime })),
        { dayOfWeek, startTime: slot.start, endTime: slot.end },
      ];
    }

    setSavingAvailability(true);
    try {
      const result = await setMyAvailability(newSlots);
      setAvailabilitySlots(result);
      toast.success('Disponibilidad actualizada');
    } catch {
      toast.error('Error al actualizar disponibilidad');
    } finally {
      setSavingAvailability(false);
    }
  };

  const isSlotActive = (dayOfWeek: number, slot: { start: string; end: string }) => {
    return availabilitySlots.some(
      (s) => s.dayOfWeek === dayOfWeek && s.startTime === slot.start && s.endTime === slot.end,
    );
  };

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
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                Mi disponibilidad semanal
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Marca las franjas horarias en las que estás disponible. Los clientes solo podrán solicitarte en estos horarios.
              </p>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 min-w-[500px]">
                  <div className="p-2"></div>
                  {DAY_NAMES.map((day) => (
                    <div key={day} className="p-2 text-center text-xs font-bold text-gray-500">{day}</div>
                  ))}
                  {TIME_SLOTS.map((slot) => (
                    <>
                      <div key={`label-${slot.start}`} className="p-2 text-xs text-gray-400 flex items-center">{slot.label}</div>
                      {Array.from({ length: 7 }).map((_, dayIdx) => (
                        <button
                          key={`${dayIdx}-${slot.start}`}
                          type="button"
                          onClick={() => toggleAvailability(dayIdx, { start: slot.start, end: slot.end })}
                          disabled={savingAvailability}
                          className={`p-2 rounded-lg text-xs font-medium transition-colors border ${
                            isSlotActive(dayIdx, slot)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-blue-200 hover:bg-blue-50'
                          } ${savingAvailability ? 'opacity-50 cursor-wait' : ''}`}
                        >
                          {slot.label.substring(0, 2)}
                        </button>
                      ))}
                    </>
                  ))}
                </div>
              </div>
              {availabilitySlots.length === 0 && (
                <p className="text-sm text-gray-400 mt-3 text-center">No has configurado tu disponibilidad.</p>
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
              <ClipboardList className="w-5 h-5 text-blue-600" />
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
                  <Card key={b.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold text-lg">{b.client?.profile?.fullName || 'Cliente'}</p>
                          {statusBadge(b.status)}
                        </div>
                        <p className="text-gray-600 mb-2">{b.serviceType}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                          <span>{new Date(b.scheduledAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</span>
                          <span>{b.address}</span>
                          {b.disability && <span className="gt-tag text-xs">{b.disability}</span>}
                        </div>
                        {b.summary && <p className="text-gray-500 text-sm mt-2">{b.summary}</p>}
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
                          <XCircle className="w-4 h-4" />
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
              <CalendarDays className="w-5 h-5 text-blue-600" />
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
                  <Card key={b.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold text-lg">{b.client?.profile?.fullName || 'Cliente'}</p>
                          {statusBadge(b.status)}
                        </div>
                        <p className="text-gray-600 mb-2">{b.serviceType}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                          <span>{new Date(b.scheduledAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</span>
                          <span>{b.address}</span>
                          {b.disability && <span className="gt-tag text-xs">{b.disability}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {b.status === 'ACCEPTED' && b.chatRoom && (
                          <Link href={`/coordinacion/${b.id}`}>
                            <Button variant="primary" className="px-4 py-2 text-sm">
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
                                <Button variant="ghost" className="px-4 py-2 text-sm">
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  Chat
                                </Button>
                              </Link>
                            )}
                            <Button
                              variant="primary"
                              className="px-4 py-2 text-sm"
                              onClick={() => handleAction(b.id, 'COMPLETED')}
                              disabled={actionLoading === b.id}
                            >
                              {actionLoading === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                              {actionLoading !== b.id && 'Completar'}
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

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; color?: 'amber' | 'blue' | 'emerald' }) {
  const colorClass = color === 'amber'
    ? 'bg-amber-50 border-amber-100'
    : color === 'blue'
      ? 'bg-blue-50 border-blue-100'
      : 'bg-emerald-50 border-emerald-100';

  const textClass = color === 'amber'
    ? 'text-amber-700'
    : color === 'blue'
      ? 'text-blue-700'
      : 'text-emerald-700';

  return (
    <Card className={`p-5 border ${colorClass} text-center`}>
      <Icon className={`w-5 h-5 mx-auto mb-1 ${textClass}`} />
      <p className={`text-2xl font-extrabold ${textClass}`}>{value}</p>
      <p className="text-xs font-medium text-gray-500">{label}</p>
    </Card>
  );
}