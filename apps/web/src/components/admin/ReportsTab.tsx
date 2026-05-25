'use client';

import { Pagination } from '@/components/Pagination';
import type { AdminReport } from '@/types';
import { LOCALE } from '@/lib/constants';

interface ReportsTabProps {
  reports: AdminReport[];
  meta: { page: number; totalPages: number };
  onLoad: (page: number) => void;
  onDelete: (id: string) => void;
}

export function ReportsTab({ reports, meta, onLoad, onDelete }: ReportsTabProps) {
  return (
    <div>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead><tr className="border-b text-left text-gray-500"><th className="py-3 px-3">Reserva</th><th className="py-3 px-3">Rating</th><th className="py-3 px-3">Comentario</th><th className="py-3 px-3">Fecha</th><th className="py-3 px-3">Acción</th></tr></thead>
        <tbody>
          {reports.map(r => (<tr key={r.id} className="border-b hover:bg-gray-50"><td className="py-3 px-3">{r.booking.serviceType} — {r.booking.client?.profile?.fullName || '—'}</td><td className="py-3 px-3">{r.rating ? `${r.rating}⭐` : '—'}</td><td className="py-3 px-3 text-gray-500 max-w-xs truncate">{r.summary || '—'}</td><td className="py-3 px-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString(LOCALE)}</td><td className="py-3 px-3"><button onClick={() => { if (confirm('¿Eliminar esta valoración?')) onDelete(r.id); }} className="gt-button gt-button--ghost text-xs border-red-200 text-red-600">Eliminar</button></td></tr>))}
          {reports.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No hay valoraciones</td></tr>}
        </tbody>
      </table></div>
      <Pagination page={meta.page} totalPages={meta.totalPages} onPage={onLoad} />
    </div>
  );
}
