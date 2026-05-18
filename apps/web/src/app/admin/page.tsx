'use client';

import { useEffect, useState } from 'react';
import { Container, Section } from '@gotogether/ui';
import { Loader2, ShieldCheck, ShieldX, Users, FileText, CheckCircle, XCircle, ExternalLink, LogOut } from 'lucide-react';
import {
  adminLogin,
  adminGetStats,
  adminGetUsers,
  adminGetPending,
  adminVerifyCompanion,
  adminRejectCompanion,
  adminVerifyProfile,
  adminRejectProfile,
} from '@/services/api';
import type { AdminStats, AdminUser, AdminPending } from '@/types';
import { toast } from 'sonner';

type Tab = 'dashboard' | 'users' | 'pending';

export default function AdminPage() {
  const [key, setKey] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pending, setPending] = useState<AdminPending | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_key');
    if (saved) {
      setKey(saved);
    }
  }, []);

  useEffect(() => {
    if (!key) return;
    loadData();
  }, [key]);

  const loadData = async () => {
    if (!key) return;
    try {
      const [s, u, p] = await Promise.all([adminGetStats(key), adminGetUsers(key), adminGetPending(key)]);
      setStats(s);
      setUsers(u);
      setPending(p);
    } catch {
      toast.error('Error al cargar datos');
      sessionStorage.removeItem('admin_key');
      setKey(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    setLoading(true);
    try {
      const ok = await adminLogin(inputKey.trim());
      if (ok) {
        setKey(inputKey.trim());
        sessionStorage.setItem('admin_key', inputKey.trim());
      } else {
        toast.error('Contraseña incorrecta');
      }
    } catch {
      toast.error('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_key');
    setKey(null);
    setStats(null);
    setUsers([]);
    setPending(null);
  };

  if (!key) {
    return (
      <Section>
        <Container>
          <div className="max-w-md mx-auto mt-20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-extrabold">Panel de Administracion</h1>
              <p className="text-gray-500 mt-2">Introduce la contrasena de administrador</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="gt-input w-full"
                placeholder="Contrasena de administrador"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="gt-button gt-button--primary w-full h-12"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Acceder'}
              </button>
            </form>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold">Admin</h1>
              <p className="text-gray-500 mt-1">Panel de administracion de GoTogether</p>
            </div>
            <button
              onClick={handleLogout}
              className="gt-button gt-button--ghost flex items-center gap-2 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b pb-2">
            {([
              { id: 'dashboard' as Tab, label: 'Dashboard', icon: Users },
              { id: 'users' as Tab, label: 'Usuarios', icon: Users },
              { id: 'pending' as Tab, label: 'Pendientes', icon: FileText },
            ]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors ${
                  tab === id
                    ? 'bg-white text-blue-600 border border-b-white -mb-[1px]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Dashboard */}
          {tab === 'dashboard' && stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Usuarios" value={stats.users} />
              <StatCard label="Perfiles" value={stats.profiles} />
              <StatCard label="Acompanantes" value={stats.companions} />
              <StatCard label="Pendientes comprobar" value={stats.pendingCompanions} color="amber" />
              <StatCard label="Perfiles verificados" value={stats.verifiedProfiles} color="green" />
              <StatCard label="Clientes pendientes" value={stats.pendingProfiles} color="amber" />
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-3 px-3 font-semibold">Nombre</th>
                    <th className="py-3 px-3 font-semibold">Email</th>
                    <th className="py-3 px-3 font-semibold">Rol</th>
                    <th className="py-3 px-3 font-semibold">Verificado</th>
                    <th className="py-3 px-3 font-semibold">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium">{u.profile?.fullName || '—'}</td>
                      <td className="py-3 px-3 text-gray-600">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className="gt-tag">{u.role}</span>
                      </td>
                      <td className="py-3 px-3">
                        {u.profile?.verified ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : u.profile ? (
                          <XCircle className="w-5 h-5 text-gray-300" />
                        ) : (
                          <span className="text-gray-400 text-xs">Sin perfil</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('es-ES')}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">No hay usuarios</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pending */}
          {tab === 'pending' && pending && (
            <div className="space-y-8">
              {/* Pending Companions */}
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Acompanantes pendientes ({pending.companions.length})
                </h2>
                {pending.companions.length === 0 ? (
                  <p className="text-gray-400 py-4">No hay acompanantes pendientes</p>
                ) : (
                  <div className="space-y-4">
                    {pending.companions.map((c) => (
                      <div key={c.id} className="gt-card p-6">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-[200px]">
                            <p className="font-bold text-lg">{c.profile.fullName}</p>
                            <p className="text-gray-500 text-sm">{c.profile.user.email}</p>
                            {c.specialties && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {c.specialties.split(',').map((s, i) => (
                                  <span key={i} className="gt-tag text-xs">{s.trim()}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            {c.penalCertificate && (
                              <a
                                href={c.penalCertificate}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="gt-button gt-button--ghost text-sm flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Antecedentes penales
                              </a>
                            )}
                            {c.sexualCertificate && (
                              <a
                                href={c.sexualCertificate}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="gt-button gt-button--ghost text-sm flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Delitos sexuales
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={async () => {
                                try {
                                  await adminVerifyCompanion(key!, c.id);
                                  toast.success('Acompanante verificado');
                                  loadData();
                                } catch { toast.error('Error al verificar'); }
                              }}
                              className="gt-button gt-button--primary text-sm px-4 py-2"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprobar
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await adminRejectCompanion(key!, c.id);
                                  toast.success('Acompanante rechazado');
                                  loadData();
                                } catch { toast.error('Error al rechazar'); }
                              }}
                              className="gt-button gt-button--ghost text-sm px-4 py-2 border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rechazar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Clients */}
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Clientes con certificado de discapacidad ({pending.clients.length})
                </h2>
                {pending.clients.length === 0 ? (
                  <p className="text-gray-400 py-4">No hay clientes pendientes</p>
                ) : (
                  <div className="space-y-4">
                    {pending.clients.map((c) => (
                      <div key={c.id} className="gt-card p-6">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-[200px]">
                            <p className="font-bold text-lg">{c.fullName}</p>
                            <p className="text-gray-500 text-sm">{c.user.email}</p>
                            {c.disabilityType && (
                              <span className="gt-tag text-xs mt-2 inline-block">{c.disabilityType}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            {c.disabilityDocument && (
                              <a
                                href={c.disabilityDocument}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="gt-button gt-button--ghost text-sm flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Certificado discapacidad
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={async () => {
                                try {
                                  await adminVerifyProfile(key!, c.id);
                                  toast.success('Cliente verificado');
                                  loadData();
                                } catch { toast.error('Error al verificar'); }
                              }}
                              className="gt-button gt-button--primary text-sm px-4 py-2"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprobar
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await adminRejectProfile(key!, c.id);
                                  toast.success('Cliente rechazado');
                                  loadData();
                                } catch { toast.error('Error al rechazar'); }
                              }}
                              className="gt-button gt-button--ghost text-sm px-4 py-2 border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rechazar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: 'green' | 'amber' }) {
  const colorClass = color === 'green'
    ? 'bg-emerald-50 text-emerald-700'
    : color === 'amber'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-blue-50 text-blue-700';

  return (
    <div className={`gt-card p-6 text-center ${colorClass}`}>
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="text-sm mt-1 font-medium">{label}</p>
    </div>
  );
}