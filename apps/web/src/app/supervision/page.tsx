'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { Users, UserPlus, Trash2, Loader2 } from 'lucide-react';
import { getMyClients, getMySupervisor, createSupervision, removeSupervision, getProfile } from '@/services/api';

const supervisionSchema = z.object({
  clientId: z.string().min(1, 'Introduce el ID del usuario'),
});

export default function SupervisionPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [supervisor, setSupervisor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(supervisionSchema),
  });

  const load = async () => {
    try {
      const profile = await getProfile();
      if (profile?.companion) setUserRole('COMPANION');
      else setUserRole('CLIENT');

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

  const onAdd = async (data: { clientId: string }) => {
    try {
      await createSupervision(data.clientId);
      toast.success('Cliente vinculado correctamente');
      reset();
      load();
    } catch (err: any) {
      toast.error(err.message || 'Error al vincular cliente');
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
                <Users className="w-5 h-5 text-blue-600" />
                Mis supervisados
              </h3>

              <form onSubmit={handleSubmit(onAdd)} className="flex gap-3 mb-6">
                <input
                  className="gt-input flex-1"
                  placeholder="ID del usuario a supervisar"
                  {...register('clientId')}
                />
                <Button variant="primary" className="shrink-0" disabled={isSubmitting}>
                  <UserPlus className="w-4 h-4" />
                </Button>
              </form>
              {errors.clientId && (
                <p className="text-red-500 text-xs mb-4 -mt-4">{errors.clientId.message}</p>
              )}

              {clients.length === 0 ? (
                <p className="text-gray-400 text-sm">No supervisas a nadie aún.</p>
              ) : (
                <div className="space-y-3">
                  {clients.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">
                          {s.client?.profile?.fullName || s.client?.email || s.clientId}
                        </p>
                        <p className="text-xs text-gray-400">{s.client?.email}</p>
                      </div>
                      <button
                        onClick={() => onRemove(s.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-8 border-0 shadow-xl shadow-gray-900/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
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
