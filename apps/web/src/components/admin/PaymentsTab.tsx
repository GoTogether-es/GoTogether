'use client';

import { Pagination } from '@/components/Pagination';
import type { AdminPayment } from '@/types';
import { LOCALE } from '@/lib/constants';

interface PaymentsTabProps {
  payments: AdminPayment[];
  meta: { page: number; totalPages: number };
  onLoad: (page: number) => void;
}

export function PaymentsTab({ payments, meta, onLoad }: PaymentsTabProps) {
  return (
    <div>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead><tr className="border-b text-left text-gray-500"><th className="py-3 px-3">ID</th><th className="py-3 px-3">Reserva</th><th className="py-3 px-3">Importe</th><th className="py-3 px-3">Comisión</th><th className="py-3 px-3">Estado</th><th className="py-3 px-3">Fecha</th></tr></thead>
        <tbody>
          {payments.map(p => (<tr key={p.id} className="border-b hover:bg-gray-50"><td className="py-3 px-3 font-mono text-xs">{p.id.slice(0, 8)}</td><td className="py-3 px-3">{p.booking.serviceType} — {p.booking.client?.profile?.fullName || '—'}</td><td className="py-3 px-3 font-medium">{(p.amount / 100).toFixed(2)}€</td><td className="py-3 px-3 text-gray-500">{(p.fee / 100).toFixed(2)}€</td><td className="py-3 px-3"><span className="gt-tag text-xs">{p.status}</span></td><td className="py-3 px-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString(LOCALE)}</td></tr>))}
          {payments.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">No hay pagos</td></tr>}
        </tbody>
      </table></div>
      <Pagination page={meta.page} totalPages={meta.totalPages} onPage={onLoad} />
    </div>
  );
}
