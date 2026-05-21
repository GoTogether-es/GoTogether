'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { Card, Container, Section } from '@gotogether/ui';
import { Users, UserPlus, Trash2, Loader2, Search, CalendarDays, MapPin, ShieldX } from 'lucide-react';
import { syncUser } from '@/services/api';
import {
  useMyClients, useMySupervisor, useCreateSupervision, useRemoveSupervision,
  useSearchUsers, usePendingInvites, useCancelInvitation, useSupervisorBookings,
} from '@/services/queries';
import type { AdminBooking } from '@/types';

const ClientLocationMap = dynamic(
  () => import('@/components/client-location-map').then((mod) => mod.ClientLocationMap),
  { ssr: false, loading: () => <div className="h-[500px] bg-gray-50 rounded-2xl flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div> }
);

type Tab = 'clients' | 'bookings' | 'location';

export default function SupervisionPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [bookingPage, setBookingPage] = useState(1);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    (async () => {
      try {
        const user = await syncUser();
        if (!user) { router.push('/auth/login'); return; }
        setAuthorized(user.role === 'SUPERVISOR');
      } catch {
        router.push('/auth/login');
      }
    })();
  }, [router]);

  const { data: clients = [], isLoading, refetch } = useMyClients();
  const { data: supervisor } = useMySupervisor();
  const { data: searchResults = [], isLoading: searching } = useSearchUsers(debouncedSearch);
  const { data: pendingInvites = [], refetch: refetchInvites } = usePendingInvites();
  const { data: bookingsData } = useSupervisorBookings(bookingPage);
  const createMutation = useCreateSupervision();
  const removeMutation = useRemoveSupervision();
  const cancelInviteMutation = useCancelInvitation();

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedUser(null);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(query), 300);
  }, []);

  const onAdd = async () => {
    if (!selectedUser) return;
    try {
      await createMutation.mutateAsync(selectedUser.id);
      toast.success('Cliente vinculado');
      setSearchQuery(''); setSelectedUser(null); refetch();
    } catch (err: any) { toast.error(err.message || 'Error al vincular'); }
  };

  const onRemove = async (id: string) => {
    try { await removeMutation.mutateAsync(id); toast.success('Vínculo eliminado'); refetch(); }
    catch (err: any) { toast.error(err.message || 'Error al eliminar'); }
  };

  const onCancelInvite = async (inviteId: string) => {
    try { await cancelInviteMutation.mutateAsync(inviteId); toast.success('Invitación cancelada'); refetchInvites(); }
    catch (err: any) { toast.error(err.message || 'Error al cancelar'); }
  };

  if (isLoading) {
    return <Section><Container><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div></Container></Section>;
  }

  if (authorized === false) {
    return (
      <Section><Container><div className="max-w-md mx-auto text-center py-20">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><ShieldX className="w-8 h-8 text-red-400" /></div>
        <h1 className="text-2xl font-extrabold mb-2">Acceso restringido</h1>
        <p className="text-gray-500">Solo los supervisores pueden acceder a esta página.</p>
        <button onClick={() => router.push('/perfil')} className="gt-button gt-button--primary mt-6">Ir a mi perfil</button>
      </div></Container></Section>
    );
  }

  if (authorized === null) {
    return <Section><Container><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div></Container></Section>;
  }

  const bookings = bookingsData?.data || [];
  const meta = bookingsData?.meta || { total: 0, page: 1, totalPages: 1 };

  const clientNames: Record<string, string> = {};
  clients.forEach((s: any) => {
    clientNames[s.clientId] = s.client?.profile?.fullName || s.client?.email || s.clientId;
  });

  return (
    <Section>
      <Container>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Supervisión</h1>
          <p className="text-gray-500 mb-8">
            Gestiona las personas que supervisas y consulta sus reservas.
          </p>

          <div className="flex gap-2 mb-8 border-b pb-2">
            {([
              { id: 'clients' as Tab, label: 'Mis supervisados', icon: Users },
              { id: 'bookings' as Tab, label: 'Reservas de clientes', icon: CalendarDays },
              { id: 'location' as Tab, label: 'Ubicación', icon: MapPin },
            ]).map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors ${tab === id ? 'bg-white text-blue-600 border border-b-white -mb-[1px]' : 'text-gray-500 hover:text-gray-700'}`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {tab === 'clients' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
                {pendingInvites.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Pendientes de aceptación</h4>
                    <div className="space-y-2">
                      {pendingInvites.map((inv: any) => (
                        <div key={inv.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                          <div><p className="font-medium text-gray-800">{inv.clientName}</p><p className="text-xs text-yellow-600">Invitación enviada</p></div>
                          <button onClick={() => onCancelInvite(inv.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" />Mis supervisados</h3>
                <div className="mb-6">
                  <div className="flex gap-2 mb-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input className="gt-input pl-9" placeholder="Buscar por nombre o email..." value={searchQuery} onChange={e => handleSearch(e.target.value)} />
                    </div>
                    <button className="gt-button gt-button--primary shrink-0" onClick={onAdd} disabled={createMutation.isPending || !selectedUser}><UserPlus className="w-4 h-4" /></button>
                  </div>
                  {searching && <p className="text-sm text-gray-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Buscando...</p>}
                  {!searching && searchResults.length > 0 && !selectedUser && debouncedSearch && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden mt-1">
                      {searchResults.slice(0, 5).map((user: any) => (
                        <button key={user.id} type="button" className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b last:border-b-0" onClick={() => { setSelectedUser(user); setSearchQuery(user.profile?.fullName || user.email); }}>
                          <p className="font-medium text-gray-800">{user.profile?.fullName || 'Sin nombre'}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {clients.length === 0 ? (
                  <p className="text-gray-400 text-sm">No supervisas a nadie aún.</p>
                ) : (
                  <div className="space-y-3">
                    {clients.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div><p className="font-medium text-gray-800">{s.client?.profile?.fullName || s.client?.email}</p><p className="text-xs text-gray-400">{s.client?.email}</p></div>
                        <button onClick={() => onRemove(s.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-8 border-0 shadow-xl shadow-gray-900/5">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><UserPlus className="w-5 h-5 text-blue-600" />Mi supervisor</h3>
                {!supervisor ? (
                  <p className="text-gray-400 text-sm">No tienes un supervisor asignado.</p>
                ) : (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="font-medium text-gray-800">{supervisor.supervisor?.profile?.fullName || supervisor.supervisor?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{supervisor.supervisor?.email}</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {tab === 'bookings' && (
            <div>
              {bookings.length === 0 ? (
                <p className="text-gray-400 py-8 text-center">No hay reservas de tus clientes.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left text-gray-500">
                      <th className="py-3 px-3">ID</th><th className="py-3 px-3">Cliente</th><th className="py-3 px-3">Acompañante</th><th className="py-3 px-3">Servicio</th><th className="py-3 px-3">Estado</th><th className="py-3 px-3">Importe</th><th className="py-3 px-3">Fecha</th>
                    </tr></thead>
                    <tbody>
                      {bookings.map((b: AdminBooking) => (
                        <tr key={b.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-3 font-mono text-xs">{b.id.slice(0, 8)}</td>
                          <td className="py-3 px-3">{b.client?.profile?.fullName || '—'}</td>
                          <td className="py-3 px-3">{b.companion?.profile?.fullName || '—'}</td>
                          <td className="py-3 px-3">{b.service?.name || b.serviceType}</td>
                          <td className="py-3 px-3"><span className={`gt-tag text-xs ${b.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : b.status === 'CANCELLED' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{b.status}</span></td>
                          <td className="py-3 px-3">{b.payment ? `${(b.payment.amount / 100).toFixed(2)}€` : '—'}</td>
                          <td className="py-3 px-3 text-gray-500">{new Date(b.scheduledAt).toLocaleDateString('es-ES')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setBookingPage(p)} className={`px-3 py-1 rounded-lg text-sm font-medium ${p === bookingPage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{p}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'location' && (
            <div>
              <p className="text-gray-500 mb-4 text-sm">Ubicación en tiempo real de tus clientes que están compartiendo su posición.</p>
              <ClientLocationMap clientNames={clientNames} />
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
