'use client';

import { useEffect, useState, useCallback } from 'react';
import { Container, Section } from '@gotogether/ui';
import { Loader2, ShieldCheck, FileText, Users, LogOut, ExternalLink, CheckCircle, XCircle, CalendarDays, DollarSign, Star, Megaphone, Package } from 'lucide-react';
import {
  adminLogin, adminGetStats, adminGetUsers, adminGetPending,
  adminVerifyCompanion, adminRejectCompanion, adminVerifyProfile, adminRejectProfile,
  adminGetBookings, adminGetBooking, adminUpdateBookingStatus,
  adminGetServices, adminCreateService, adminUpdateService, adminToggleService,
  adminGetPayments, adminGetReports, adminDeleteReport, adminSendNotification,
} from '@/services/api';
import type { AdminStats, AdminUser, AdminPending, AdminBooking, AdminBookingDetail, AdminPayment, AdminReport, ServiceData, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

type Tab = 'dashboard' | 'users' | 'pending' | 'bookings' | 'services' | 'payments' | 'reports' | 'notifications';

const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Users },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'pending', label: 'Pendientes', icon: FileText },
  { id: 'bookings', label: 'Reservas', icon: CalendarDays },
  { id: 'services', label: 'Servicios', icon: Package },
  { id: 'payments', label: 'Pagos', icon: DollarSign },
  { id: 'reports', label: 'Valoraciones', icon: Star },
  { id: 'notifications', label: 'Notificaciones', icon: Megaphone },
];

export default function AdminPage() {
  const [key, setKey] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pending, setPending] = useState<AdminPending | null>(null);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [bookingDetail, setBookingDetail] = useState<AdminBookingDetail | null>(null);
  const [bookingsMeta, setBookingsMeta] = useState({ page: 1, totalPages: 1 });
  const [services, setServices] = useState<ServiceData[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [paymentsMeta, setPaymentsMeta] = useState({ page: 1, totalPages: 1 });
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [reportsMeta, setReportsMeta] = useState({ page: 1, totalPages: 1 });

  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceData | null>(null);
  const [notifForm, setNotifForm] = useState({ title: '', body: '', role: '' });

  const loadDashboard = useCallback(async () => {
    if (!key) return;
    try {
      const [s, u, p] = await Promise.all([adminGetStats(key), adminGetUsers(key), adminGetPending(key)]);
      setStats(s); setUsers(u); setPending(p);
    } catch { toast.error('Error al cargar datos'); sessionStorage.removeItem('admin_key'); setKey(null); }
  }, [key]);

  const loadBookings = useCallback(async (page = 1) => {
    if (!key) return;
    try {
      const res = await adminGetBookings(key, page, bookingStatusFilter || undefined);
      setBookings(res.data); setBookingsMeta({ page: res.meta.page, totalPages: res.meta.totalPages });
    } catch { toast.error('Error al cargar reservas'); }
  }, [key, bookingStatusFilter]);

  const loadServices = useCallback(async () => {
    if (!key) return;
    try { setServices(await adminGetServices(key)); } catch { toast.error('Error al cargar servicios'); }
  }, [key]);

  const loadPayments = useCallback(async (page = 1) => {
    if (!key) return;
    try {
      const res = await adminGetPayments(key, page);
      setPayments(res.data); setPaymentsMeta({ page: res.meta.page, totalPages: res.meta.totalPages });
    } catch { toast.error('Error al cargar pagos'); }
  }, [key]);

  const loadReports = useCallback(async (page = 1) => {
    if (!key) return;
    try {
      const res = await adminGetReports(key, page);
      setReports(res.data); setReportsMeta({ page: res.meta.page, totalPages: res.meta.totalPages });
    } catch { toast.error('Error al cargar valoraciones'); }
  }, [key]);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_key');
    if (saved) setKey(saved);
  }, []);

  useEffect(() => { if (key) loadDashboard(); }, [key, loadDashboard]);
  useEffect(() => { if (key && tab === 'bookings') loadBookings(); }, [key, tab, loadBookings]);
  useEffect(() => { if (key && tab === 'services') loadServices(); }, [key, tab, loadServices]);
  useEffect(() => { if (key && tab === 'payments') loadPayments(); }, [key, tab, loadPayments]);
  useEffect(() => { if (key && tab === 'reports') loadReports(); }, [key, tab, loadReports]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    setLoading(true);
    try {
      const ok = await adminLogin(inputKey.trim());
      if (ok) { setKey(inputKey.trim()); sessionStorage.setItem('admin_key', inputKey.trim()); }
      else toast.error('Contraseña incorrecta');
    } catch { toast.error('Error de conexión'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { sessionStorage.removeItem('admin_key'); setKey(null); setStats(null); setUsers([]); setPending(null); };

  if (!key) return (
    <Section><Container><div className="max-w-md mx-auto mt-20">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><ShieldCheck className="w-8 h-8 text-blue-600" /></div>
        <h1 className="text-2xl font-extrabold">Panel de Administración</h1>
        <p className="text-gray-500 mt-2">Introduce la contraseña de administrador</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <input type="password" value={inputKey} onChange={e => setInputKey(e.target.value)} className="gt-input w-full" placeholder="Contraseña" autoFocus />
        <button type="submit" disabled={loading} className="gt-button gt-button--primary w-full h-12">{loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Acceder'}</button>
      </form>
    </div></Container></Section>
  );

  return (
    <Section><Container><div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-extrabold">Admin</h1><p className="text-gray-500 mt-1">Panel de administración de GoTogether</p></div>
        <button onClick={handleLogout} className="gt-button gt-button--ghost flex items-center gap-2 text-sm"><LogOut className="w-4 h-4" />Salir</button>
      </div>

      <div className="flex flex-wrap gap-1 mb-8 border-b pb-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setTab(id); setBookingDetail(null); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-lg text-sm font-semibold transition-colors ${tab === id ? 'bg-white text-blue-600 border border-b-white -mb-[1px]' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && stats && <DashboardTab stats={stats} />}
      {tab === 'users' && <UsersTab users={users} />}
      {tab === 'pending' && pending && <PendingTab pending={pending} adminKey={key!} onReload={loadDashboard} />}
      {tab === 'bookings' && <BookingsTab bookings={bookings} meta={bookingsMeta} detail={bookingDetail} filter={bookingStatusFilter} onFilter={setBookingStatusFilter} onLoad={loadBookings} onDetail={async (id: string) => { try { setBookingDetail(await adminGetBooking(key!, id)); } catch { toast.error('Error al cargar detalle'); } }} onCloseDetail={() => setBookingDetail(null)} onUpdateStatus={async (id: string, status: string) => { await adminUpdateBookingStatus(key!, id, status); toast.success('Estado actualizado'); loadBookings(); }} />}
      {tab === 'services' && <ServicesTab services={services} modal={showServiceModal} edit={editingService} onOpenModal={() => { setEditingService(null); setShowServiceModal(true); }} onEdit={(s: ServiceData) => { setEditingService(s); setShowServiceModal(true); }} onCloseModal={() => setShowServiceModal(false)} onSave={async (data: { name: string; description?: string; price: number; category?: string }) => { if (editingService) { await adminUpdateService(key!, editingService.id, data); } else { await adminCreateService(key!, data); } toast.success('Servicio guardado'); setShowServiceModal(false); loadServices(); }} onToggle={async (id: string) => { await adminToggleService(key!, id); loadServices(); }} />}
      {tab === 'payments' && <PaymentsTab payments={payments} meta={paymentsMeta} onLoad={loadPayments} />}
      {tab === 'reports' && <ReportsTab reports={reports} meta={reportsMeta} onLoad={loadReports} onDelete={async (id) => { await adminDeleteReport(key!, id); toast.success('Valoración eliminada'); loadReports(); }} />}
      {tab === 'notifications' && <NotificationsTab form={notifForm} onChange={setNotifForm} onSend={async () => { if (!notifForm.title || !notifForm.body) { toast.error('Título y cuerpo requeridos'); return; } const res = await adminSendNotification(key!, notifForm); toast.success(`Enviado a ${res.sent} usuarios`); setNotifForm({ title: '', body: '', role: '' }); }} />}
    </div></Container></Section>
  );
}

function DashboardTab({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Usuarios" value={stats.users} />
      <StatCard label="Acompañantes" value={stats.companions} />
      <StatCard label="Reservas totales" value={stats.totalBookings} color="blue" />
      <StatCard label="Reservas activas" value={stats.activeBookings} color="amber" />
      <StatCard label="Completadas" value={stats.completedBookings} color="green" />
      <StatCard label="Pagos" value={stats.totalPayments} />
      <StatCard label="Facturación" value={`${(stats.totalRevenue / 100).toFixed(0)}€`} color="green" />
      <StatCard label="Pend. verificar" value={stats.pendingCompanions} color="amber" />
    </div>
  );
}

function UsersTab({ users }: { users: AdminUser[] }) {
  return (
    <div className="overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="border-b text-left text-gray-500"><th className="py-3 px-3 font-semibold">Nombre</th><th className="py-3 px-3 font-semibold">Email</th><th className="py-3 px-3 font-semibold">Rol</th><th className="py-3 px-3 font-semibold">Verificado</th><th className="py-3 px-3 font-semibold">Registro</th></tr></thead>
      <tbody>
        {users.map(u => (<tr key={u.id} className="border-b hover:bg-gray-50"><td className="py-3 px-3 font-medium">{u.profile?.fullName || '—'}</td><td className="py-3 px-3 text-gray-600">{u.email}</td><td className="py-3 px-3"><span className="gt-tag">{u.role}</span></td><td className="py-3 px-3">{u.profile?.verified ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : u.profile ? <XCircle className="w-5 h-5 text-gray-300" /> : <span className="text-gray-400 text-xs">Sin perfil</span>}</td><td className="py-3 px-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('es-ES')}</td></tr>))}
        {users.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No hay usuarios</td></tr>}
      </tbody>
    </table></div>
  );
}

function PendingTab({ pending, adminKey, onReload }: { pending: AdminPending; adminKey: string; onReload: () => void }) {
  return (
    <div className="space-y-8">
      <div><h2 className="text-lg font-bold mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-600" />Acompañantes ({pending.companions.length})</h2>
        {pending.companions.length === 0 ? <p className="text-gray-400 py-4">Sin pendientes</p> :
          <div className="space-y-4">{pending.companions.map(c => (
            <div key={c.id} className="gt-card p-6"><div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]"><p className="font-bold text-lg">{c.profile.fullName}</p><p className="text-gray-500 text-sm">{c.profile.user.email}</p>
                {c.specialties && <div className="flex flex-wrap gap-1 mt-2">{c.specialties.split(',').map((s, i) => <span key={i} className="gt-tag text-xs">{s.trim()}</span>)}</div>}</div>
              <div className="flex flex-col gap-2">
                {c.penalCertificate && <a href={c.penalCertificate} target="_blank" rel="noopener noreferrer" className="gt-button gt-button--ghost text-sm flex items-center gap-1"><ExternalLink className="w-3 h-3" />Penales</a>}
                {c.sexualCertificate && <a href={c.sexualCertificate} target="_blank" rel="noopener noreferrer" className="gt-button gt-button--ghost text-sm flex items-center gap-1"><ExternalLink className="w-3 h-3" />Sexuales</a>}
              </div>
              <div className="flex gap-2 shrink-0">
                <PendingButton icon={CheckCircle} label="Aprobar" onClick={async () => { await adminVerifyCompanion(adminKey, c.id); toast.success('Aprobado'); onReload(); }} />
                <PendingButton icon={XCircle} label="Rechazar" danger onClick={async () => { await adminRejectCompanion(adminKey, c.id); toast.success('Rechazado'); onReload(); }} />
              </div>
            </div></div>))}</div>}</div>
      <div><h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" />Clientes ({pending.clients.length})</h2>
        {pending.clients.length === 0 ? <p className="text-gray-400 py-4">Sin pendientes</p> :
          <div className="space-y-4">{pending.clients.map(c => (
            <div key={c.id} className="gt-card p-6"><div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]"><p className="font-bold text-lg">{c.fullName}</p><p className="text-gray-500 text-sm">{c.user.email}</p>{c.disabilityType && <span className="gt-tag text-xs mt-2 inline-block">{c.disabilityType}</span>}</div>
              <div className="flex flex-col gap-2">{c.disabilityDocument && <a href={c.disabilityDocument} target="_blank" rel="noopener noreferrer" className="gt-button gt-button--ghost text-sm flex items-center gap-1"><ExternalLink className="w-3 h-3" />Certificado</a>}</div>
              <div className="flex gap-2 shrink-0">
                <PendingButton icon={CheckCircle} label="Aprobar" onClick={async () => { await adminVerifyProfile(adminKey, c.id); toast.success('Aprobado'); onReload(); }} />
                <PendingButton icon={XCircle} label="Rechazar" danger onClick={async () => { await adminRejectProfile(adminKey, c.id); toast.success('Rechazado'); onReload(); }} />
              </div>
            </div></div>))}</div>}</div>
    </div>
  );
}

function BookingsTab({ bookings, meta, detail, filter, onFilter, onLoad, onDetail, onCloseDetail, onUpdateStatus }: any) {
  if (detail) return (
    <div>
      <button onClick={onCloseDetail} className="gt-button gt-button--ghost text-sm mb-4">&larr; Volver a reservas</button>
      <div className="gt-card p-8 space-y-4">
        <h2 className="text-xl font-bold">Reserva {detail.id.slice(0, 8)}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Cliente:</span> {detail.client?.profile?.fullName || detail.client?.email}</div>
          <div><span className="text-gray-500">Acompañante:</span> {detail.companion?.profile?.fullName || '—'}</div>
          <div><span className="text-gray-500">Servicio:</span> {detail.service?.name || detail.serviceType}</div>
          <div><span className="text-gray-500">Estado:</span> <span className="gt-tag">{detail.status}</span></div>
          <div><span className="text-gray-500">Dirección:</span> {detail.address}</div>
          <div><span className="text-gray-500">Fecha:</span> {new Date(detail.scheduledAt).toLocaleString('es-ES')}</div>
          {detail.payment && <><div><span className="text-gray-500">Importe:</span> {(detail.payment.amount / 100).toFixed(2)}€</div><div><span className="text-gray-500">Comisión:</span> {(detail.payment.fee / 100).toFixed(2)}€</div></>}
          {detail.report && <div><span className="text-gray-500">Valoración:</span> {detail.report.rating}⭐</div>}
        </div>
        {detail.chatRoom?.messages && detail.chatRoom.messages.length > 0 && (
          <div><h3 className="font-bold mb-2">Chat ({detail.chatRoom.messages.length} mensajes)</h3>
            <div className="max-h-48 overflow-y-auto space-y-2 bg-gray-50 p-4 rounded-xl">
              {detail.chatRoom.messages.map((m: any) => <div key={m.id} className="text-sm"><span className="text-gray-400 text-xs">{new Date(m.createdAt).toLocaleTimeString('es-ES')}</span> <span className="font-medium">{m.senderId.slice(0, 6)}:</span> {m.content}</div>)}
            </div></div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['', 'REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => { onFilter(s); onLoad(1); }} className={`text-xs px-3 py-1 rounded-full font-medium ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{s || 'Todas'}</button>
        ))}
      </div>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead><tr className="border-b text-left text-gray-500"><th className="py-3 px-3">ID</th><th className="py-3 px-3">Cliente</th><th className="py-3 px-3">Servicio</th><th className="py-3 px-3">Estado</th><th className="py-3 px-3">Importe</th><th className="py-3 px-3">Fecha</th></tr></thead>
        <tbody>
          {bookings.map((b: AdminBooking) => (<tr key={b.id} onClick={() => onDetail(b.id)} className="border-b hover:bg-gray-50 cursor-pointer"><td className="py-3 px-3 font-mono text-xs">{b.id.slice(0, 8)}</td><td className="py-3 px-3">{b.client?.profile?.fullName || '—'}</td><td className="py-3 px-3">{b.service?.name || b.serviceType}</td><td className="py-3 px-3"><span className={`gt-tag text-xs ${b.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : b.status === 'CANCELLED' ? 'bg-red-50 text-red-700' : b.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{b.status}</span></td><td className="py-3 px-3">{b.payment ? `${(b.payment.amount / 100).toFixed(2)}€` : '—'}</td><td className="py-3 px-3 text-gray-500">{new Date(b.scheduledAt).toLocaleDateString('es-ES')}</td></tr>))}
          {bookings.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">No hay reservas</td></tr>}
        </tbody>
      </table></div>
      {meta.totalPages > 1 && <Pagination page={meta.page} totalPages={meta.totalPages} onPage={onLoad} />}
    </div>
  );
}

function ServicesTab({ services, modal, edit, onOpenModal, onEdit, onCloseModal, onSave, onToggle }: any) {
  const [form, setForm] = useState({ name: edit?.name || '', description: edit?.description || '', price: edit?.price ? edit.price / 100 : 0, category: edit?.category || '' });

  useEffect(() => {
    if (edit) setForm({ name: edit.name, description: edit.description || '', price: edit.price / 100, category: edit.category || '' });
    else setForm({ name: '', description: '', price: 0, category: '' });
  }, [edit, modal]);

  return (
    <div>
      <div className="flex justify-between mb-4"><h2 className="text-lg font-bold">Catálogo de servicios ({services.length})</h2><button onClick={onOpenModal} className="gt-button gt-button--primary text-sm">Nuevo servicio</button></div>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead><tr className="border-b text-left text-gray-500"><th className="py-3 px-3">Nombre</th><th className="py-3 px-3">Precio/h</th><th className="py-3 px-3">Categoría</th><th className="py-3 px-3">Activo</th><th className="py-3 px-3">Acciones</th></tr></thead>
        <tbody>
          {services.map((s: ServiceData) => (<tr key={s.id} className="border-b hover:bg-gray-50"><td className="py-3 px-3 font-medium">{s.name}</td><td className="py-3 px-3">{(s.price / 100).toFixed(2)}€</td><td className="py-3 px-3 text-gray-500">{s.category || '—'}</td><td className="py-3 px-3">{s.active !== false ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-gray-300" />}</td><td className="py-3 px-3 flex gap-2"><button onClick={() => onEdit(s)} className="gt-button gt-button--ghost text-xs">Editar</button><button onClick={() => onToggle(s.id)} className="gt-button gt-button--ghost text-xs border-gray-200">{s.active !== false ? 'Desactivar' : 'Activar'}</button></td></tr>))}
          {services.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No hay servicios</td></tr>}
        </tbody>
      </table></div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCloseModal}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6">{edit ? 'Editar servicio' : 'Nuevo servicio'}</h2>
            <div className="space-y-4">
              <input className="gt-input" placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="gt-input" placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input className="gt-input" type="number" placeholder="Precio (€/h)" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
              <input className="gt-input" placeholder="Categoría" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => onSave({ name: form.name, description: form.description || undefined, price: Math.round(form.price * 100), category: form.category || undefined })} className="gt-button gt-button--primary flex-1">Guardar</button>
              <button onClick={onCloseModal} className="gt-button gt-button--ghost flex-1">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentsTab({ payments, meta, onLoad }: { payments: AdminPayment[]; meta: { page: number; totalPages: number }; onLoad: (page: number) => void }) {
  return (
    <div>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead><tr className="border-b text-left text-gray-500"><th className="py-3 px-3">ID</th><th className="py-3 px-3">Reserva</th><th className="py-3 px-3">Importe</th><th className="py-3 px-3">Comisión</th><th className="py-3 px-3">Estado</th><th className="py-3 px-3">Fecha</th></tr></thead>
        <tbody>
          {payments.map(p => (<tr key={p.id} className="border-b hover:bg-gray-50"><td className="py-3 px-3 font-mono text-xs">{p.id.slice(0, 8)}</td><td className="py-3 px-3">{p.booking.serviceType} — {p.booking.client?.profile?.fullName || '—'}</td><td className="py-3 px-3 font-medium">{(p.amount / 100).toFixed(2)}€</td><td className="py-3 px-3 text-gray-500">{(p.fee / 100).toFixed(2)}€</td><td className="py-3 px-3"><span className="gt-tag text-xs">{p.status}</span></td><td className="py-3 px-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString('es-ES')}</td></tr>))}
          {payments.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">No hay pagos</td></tr>}
        </tbody>
      </table></div>
      {meta.totalPages > 1 && <Pagination page={meta.page} totalPages={meta.totalPages} onPage={onLoad} />}
    </div>
  );
}

function ReportsTab({ reports, meta, onLoad, onDelete }: { reports: AdminReport[]; meta: { page: number; totalPages: number }; onLoad: (page: number) => void; onDelete: (id: string) => void }) {
  return (
    <div>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead><tr className="border-b text-left text-gray-500"><th className="py-3 px-3">Reserva</th><th className="py-3 px-3">Rating</th><th className="py-3 px-3">Comentario</th><th className="py-3 px-3">Fecha</th><th className="py-3 px-3">Acción</th></tr></thead>
        <tbody>
          {reports.map(r => (<tr key={r.id} className="border-b hover:bg-gray-50"><td className="py-3 px-3">{r.booking.serviceType} — {r.booking.client?.profile?.fullName || '—'}</td><td className="py-3 px-3">{r.rating ? `${r.rating}⭐` : '—'}</td><td className="py-3 px-3 text-gray-500 max-w-xs truncate">{r.summary || '—'}</td><td className="py-3 px-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString('es-ES')}</td><td className="py-3 px-3"><button onClick={() => { if (confirm('¿Eliminar esta valoración?')) onDelete(r.id); }} className="gt-button gt-button--ghost text-xs border-red-200 text-red-600">Eliminar</button></td></tr>))}
          {reports.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No hay valoraciones</td></tr>}
        </tbody>
      </table></div>
      {meta.totalPages > 1 && <Pagination page={meta.page} totalPages={meta.totalPages} onPage={onLoad} />}
    </div>
  );
}

function NotificationsTab({ form, onChange, onSend }: { form: { title: string; body: string; role: string }; onChange: (f: { title: string; body: string; role: string }) => void; onSend: () => void }) {
  return (
    <div className="max-w-xl">
      <div className="gt-card p-8">
        <h2 className="text-lg font-bold mb-6">Enviar notificación masiva</h2>
        <div className="space-y-4">
          <div><label className="gt-label text-sm mb-1 block">Título</label><input className="gt-input" value={form.title} onChange={e => onChange({ ...form, title: e.target.value })} placeholder="Ej: Nueva funcionalidad disponible" /></div>
          <div><label className="gt-label text-sm mb-1 block">Cuerpo</label><textarea className="gt-input" rows={3} value={form.body} onChange={e => onChange({ ...form, body: e.target.value })} placeholder="Escribe el mensaje para los usuarios..." /></div>
          <div><label className="gt-label text-sm mb-1 block">Rol (opcional)</label><select className="gt-input" value={form.role} onChange={e => onChange({ ...form, role: e.target.value })}><option value="">Todos</option><option value="CLIENT">Clientes</option><option value="COMPANION">Acompañantes</option></select></div>
          <button onClick={onSend} className="gt-button gt-button--primary w-full"><Megaphone className="w-4 h-4" />Enviar notificación</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  const bg = color === 'green' ? 'bg-emerald-50 text-emerald-700' : color === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700';
  return <div className={`gt-card p-5 text-center ${bg}`}><p className="text-2xl font-extrabold">{value}</p><p className="text-sm mt-1 font-medium">{label}</p></div>;
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  return <div className="flex justify-center gap-2 mt-6">{Array.from({ length: totalPages }, (_, i) => i + 1).map(p => <button key={p} onClick={() => onPage(p)} className={`px-3 py-1 rounded-lg text-sm font-medium ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{p}</button>)}</div>;
}

function PendingButton({ icon: Icon, label, danger, onClick }: { icon: any; label: string; danger?: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`gt-button text-sm px-4 py-2 ${danger ? 'gt-button--ghost border-red-200 text-red-600 hover:bg-red-50' : 'gt-button--primary'}`}><Icon className="w-4 h-4 mr-1" />{label}</button>;
}
