'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { Users, UserPlus, Trash2, Loader2, Search } from 'lucide-react';
import { useMyClients, useMySupervisor, useCreateSupervision, useRemoveSupervision, useSearchUsers, usePendingInvites, useCancelInvitation } from '@/services/queries';

export default function SupervisionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: clients = [], isLoading, refetch } = useMyClients();
  const { data: supervisor } = useMySupervisor();
  const { data: searchResults = [], isLoading: searching } = useSearchUsers(debouncedSearch);
  const { data: pendingInvites = [], refetch: refetchInvites } = usePendingInvites();
  const createMutation = useCreateSupervision();
  const removeMutation = useRemoveSupervision();
  const cancelInviteMutation = useCancelInvitation();

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedUser(null);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(query);
    }, 300);
  }, []);

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setSearchQuery(user.profile?.fullName || user.email);
  };

  const onAdd = async () => {
    if (!selectedUser) return;
    try {
      await createMutation.mutateAsync(selectedUser.id);
      toast.success('Cliente vinculado correctamente');
      setSearchQuery('');
      setSelectedUser(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Error al vincular cliente');
    }
  };

  const onRemove = async (id: string) => {
    try {
      await removeMutation.mutateAsync(id);
      toast.success('Vínculo eliminado');
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar vínculo');
    }
  };

  const onCancelInvite = async (inviteId: string) => {
    try {
      await cancelInviteMutation.mutateAsync(inviteId);
      toast.success('Invitación cancelada');
      refetchInvites();
    } catch (err: any) {
      toast.error(err.message || 'Error al cancelar invitación');
    }
  };

  if (isLoading) {
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Supervisión</h1>
          <p className="text-gray-500 mb-10">
            Gestiona las personas que supervisas o consulta quién te supervisa a ti.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
              {pendingInvites.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Pendientes de aceptación
                  </h4>
                  <div className="space-y-2">
                    {pendingInvites.map((inv: any) => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                        <div>
                          <p className="font-medium text-gray-800">{inv.clientName}</p>
                          <p className="text-xs text-yellow-600">Invitación enviada</p>
                        </div>
                        <button
                          onClick={() => onCancelInvite(inv.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label={`Cancelar invitación a ${inv.clientName}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" aria-hidden="true" />
                Mis supervisados
              </h3>

              <div className="mb-6">
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                    <label htmlFor="user-search" className="sr-only">Buscar usuario por nombre o email</label>
                    <input
                      id="user-search"
                      className="gt-input pl-9"
                      placeholder="Buscar por nombre o email..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                  <Button variant="primary" className="shrink-0" onClick={onAdd} disabled={createMutation.isPending || !selectedUser} aria-label="Agregar a supervisados">
                    <UserPlus className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
                {searching && (
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Buscando...
                  </p>
                )}
                {!searching && searchResults.length > 0 && !selectedUser && debouncedSearch && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden mt-1">
                    {searchResults.slice(0, 5).map((user: any) => (
                      <button
                        key={user.id}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b last:border-b-0"
                        onClick={() => handleSelectUser(user)}
                      >
                        <p className="font-medium text-gray-800">
                          {user.profile?.fullName || 'Sin nombre'}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {clients.length === 0 ? (
                <p className="text-gray-400 text-sm">No supervisas a nadie aún.</p>
              ) : (
                <div className="space-y-3" role="list">
                  {clients.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl" role="listitem">
                      <div>
                        <p className="font-medium text-gray-800">
                          {s.client?.profile?.fullName || s.client?.email || s.clientId}
                        </p>
                        <p className="text-xs text-gray-400">{s.client?.email}</p>
                      </div>
                      <button
                        onClick={() => onRemove(s.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label={`Eliminar supervisión de ${s.client?.profile?.fullName || s.client?.email}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-8 border-0 shadow-xl shadow-gray-900/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" aria-hidden="true" />
                Mi supervisor
              </h3>

              {!supervisor ? (
                <p className="text-gray-400 text-sm">
                  No tienes un supervisor asignado. Un supervisor puede ser un familiar o responsable que gestione tus reservas.
                </p>
              ) : (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="font-medium text-gray-800">
                    {supervisor.supervisor?.profile?.fullName || supervisor.supervisor?.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{supervisor.supervisor?.email}</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}
