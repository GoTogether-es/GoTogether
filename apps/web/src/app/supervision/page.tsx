'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { Users, UserPlus, Trash2, Loader2, Search } from 'lucide-react';
import { getMyClients, getMySupervisor, createSupervision, removeSupervision, searchUsers } from '@/services/api';

export default function SupervisionPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [supervisor, setSupervisor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [linking, setLinking] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const load = async () => {
    try {
      const [clientsData, supervisorData] = await Promise.all([
        getMyClients().catch(() => []),
        getMySupervisor(),
      ]);
      setClients(clientsData);
      setSupervisor(supervisorData);
    } catch {
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedUser(null);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsers(query);
        setSearchResults(results.slice(0, 5));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setSearchQuery(user.profile?.fullName || user.email);
    setSearchResults([]);
  };

  const onAdd = async () => {
    if (!selectedUser) return;
    setLinking(true);
    try {
      await createSupervision(selectedUser.id);
      toast.success('Cliente vinculado correctamente');
      setSearchQuery('');
      setSelectedUser(null);
      setSearchResults([]);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Error al vincular cliente');
    } finally {
      setLinking(false);
    }
  };

  const onRemove = async (id: string) => {
    try {
      await removeSupervision(id);
      toast.success('Vínculo eliminado');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar vínculo');
    }
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Supervisión</h1>
          <p className="text-gray-500 mb-10">
            Gestiona las personas que supervisas o consulta quién te supervisa a ti.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
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
                  <Button variant="primary" className="shrink-0" onClick={onAdd} disabled={linking || !selectedUser} aria-label="Agregar a supervisados">
                    <UserPlus className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
                {searching && (
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Buscando...
                  </p>
                )}
                {!searching && searchResults.length > 0 && !selectedUser && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden mt-1">
                    {searchResults.map((user) => (
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
