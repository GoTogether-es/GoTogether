'use client';

import { Pagination } from '@/components/Pagination';
import type { AdminBooking, AdminBookingDetail } from '@/types';
import { LOCALE } from '@/lib/constants';

interface BookingsTabProps {
  bookings: AdminBooking[];
  meta: { page: number; totalPages: number };
  detail: AdminBookingDetail | null;
  filter: string;
  onFilter: (status: string) => void;
  onLoad: (page: number) => void;
  onDetail: (id: string) => Promise<void>;
  onCloseDetail: () => void;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
}

export function BookingsTab({ bookings, meta, detail, filter, onFilter, onLoad, onDetail, onCloseDetail, onUpdateStatus }: BookingsTabProps) {
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
          <div><span className="text-gray-500">Fecha:</span> {new Date(detail.scheduledAt).toLocaleString(LOCALE)}</div>
          {detail.payment && <><div><span className="text-gray-500">Importe:</span> {(detail.payment.amount / 100).toFixed(2)}€</div><div><span className="text-gray-500">Comisión:</span> {(detail.payment.fee / 100).toFixed(2)}€</div></>}
          {detail.report && <div><span className="text-gray-500">Valoración:</span> {detail.report.rating}⭐</div>}
        </div>
        {detail.chatRoom?.messages && detail.chatRoom.messages.length > 0 && (
          <div><h3 className="font-bold mb-2">Chat ({detail.chatRoom.messages.length} mensajes)</h3>
            <div className="max-h-48 overflow-y-auto space-y-2 bg-gray-50 p-4 rounded-xl">
              {detail.chatRoom.messages.map(m => <div key={m.id} className="text-sm"><span className="text-gray-400 text-xs">{new Date(m.createdAt).toLocaleTimeString(LOCALE)}</span> <span className="font-medium">{m.senderId.slice(0, 6)}:</span> {m.content}</div>)}
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
        <thead><tr className="border-b text-left text-gray-500"><th className="py-3 px-3">ID</th><th className="py-3 px-3">Cliente</th><th className="py-3 px-3">Acompañante</th><th className="py-3 px-3">Servicio</th><th className="py-3 px-3">Estado</th><th className="py-3 px-3">Importe</th><th className="py-3 px-3">Fecha</th></tr></thead>
        <tbody>
          {bookings.map(b => (<tr key={b.id} onClick={() => onDetail(b.id)} className="border-b hover:bg-gray-50 cursor-pointer"><td className="py-3 px-3 font-mono text-xs">{b.id.slice(0, 8)}</td><td className="py-3 px-3">{b.client?.profile?.fullName || '—'}</td><td className="py-3 px-3">{b.companion?.profile?.fullName || '—'}</td><td className="py-3 px-3">{b.service?.name || b.serviceType}</td><td className="py-3 px-3"><span className={`gt-tag text-xs ${b.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : b.status === 'CANCELLED' ? 'bg-red-50 text-red-700' : b.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{b.status}</span></td><td className="py-3 px-3">{b.payment ? `${(b.payment.amount / 100).toFixed(2)}€` : '—'}</td><td className="py-3 px-3 text-gray-500">{new Date(b.scheduledAt).toLocaleDateString(LOCALE)}</td></tr>))}
          {bookings.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-gray-400">No hay reservas</td></tr>}
        </tbody>
      </table></div>
      <Pagination page={meta.page} totalPages={meta.totalPages} onPage={onLoad} />
    </div>
  );
}
