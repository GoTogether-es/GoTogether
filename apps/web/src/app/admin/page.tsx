'use client';

import { useEffect, useState, useCallback } from 'react';
import { Container, Section } from '@gotogether/ui';
import { Loader2, ShieldCheck, FileText, Users, LogOut, CalendarDays, DollarSign, Star, Megaphone, Package } from 'lucide-react';
import {
  adminLogin, adminGetStats, adminGetUsers, adminGetPending,
  adminGetBookings, adminGetBooking, adminUpdateBookingStatus,
  adminGetServices, adminCreateService, adminUpdateService, adminToggleService,
  adminGetPayments, adminGetReports, adminDeleteReport, adminSendNotification,
} from '@/services/api';
import type { AdminStats, AdminUser, AdminPending, AdminBooking, AdminBookingDetail, AdminPayment, AdminReport, ServiceData } from '@/types';
import { toast } from 'sonner';
import { DashboardTab } from '@/components/admin/DashboardTab';
import { UsersTab } from '@/components/admin/UsersTab';
import { PendingTab } from '@/components/admin/PendingTab';
import { BookingsTab } from '@/components/admin/BookingsTab';
import { ServicesTab } from '@/components/admin/ServicesTab';
import { PaymentsTab } from '@/components/admin/PaymentsTab';
import { ReportsTab } from '@/components/admin/ReportsTab';
import { NotificationsTab } from '@/components/admin/NotificationsTab';

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
        <div><h1 className="text-3xl font-extrabold">Admin</h1><p className="text-gray-500 mt-1">Panel de administración de AmiGo</p></div>
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

      {tab === 'dashboard' && !stats && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}
      {tab === 'dashboard' && stats && <DashboardTab stats={stats} />}
      {tab === 'users' && !users.length && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}
      {tab === 'users' && users.length > 0 && <UsersTab users={users} />}
      {tab === 'pending' && !pending && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}
      {tab === 'pending' && pending && <PendingTab pending={pending} adminKey={key!} onReload={loadDashboard} />}
      {tab === 'bookings' && <BookingsTab bookings={bookings} meta={bookingsMeta} detail={bookingDetail} filter={bookingStatusFilter} onFilter={setBookingStatusFilter} onLoad={loadBookings} onDetail={async (id: string) => { try { setBookingDetail(await adminGetBooking(key!, id)); } catch { toast.error('Error al cargar detalle'); } }} onCloseDetail={() => setBookingDetail(null)} onUpdateStatus={async (id: string, status: string) => { await adminUpdateBookingStatus(key!, id, status); toast.success('Estado actualizado'); loadBookings(); }} />}
      {tab === 'services' && <ServicesTab services={services} modal={showServiceModal} edit={editingService} onOpenModal={() => { setEditingService(null); setShowServiceModal(true); }} onEdit={(s: ServiceData) => { setEditingService(s); setShowServiceModal(true); }} onCloseModal={() => setShowServiceModal(false)} onSave={async (data: { name: string; description?: string; price: number; category?: string }) => { if (editingService) { await adminUpdateService(key!, editingService.id, data); } else { await adminCreateService(key!, data); } toast.success('Servicio guardado'); setShowServiceModal(false); loadServices(); }} onToggle={async (id: string) => { await adminToggleService(key!, id); loadServices(); }} />}
      {tab === 'payments' && <PaymentsTab payments={payments} meta={paymentsMeta} onLoad={loadPayments} />}
      {tab === 'reports' && <ReportsTab reports={reports} meta={reportsMeta} onLoad={loadReports} onDelete={async (id) => { await adminDeleteReport(key!, id); toast.success('Valoración eliminada'); loadReports(); }} />}
      {tab === 'notifications' && <NotificationsTab form={notifForm} onChange={setNotifForm} onSend={async () => { if (!notifForm.title || !notifForm.body) { toast.error('Título y cuerpo requeridos'); return; } const res = await adminSendNotification(key!, notifForm); toast.success(`Enviado a ${res.sent} usuarios`); setNotifForm({ title: '', body: '', role: '' }); }} />}
    </div></Container></Section>
  );
}
