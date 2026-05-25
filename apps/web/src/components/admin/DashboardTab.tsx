'use client';

import { StatCard } from '@/components/StatCard';
import type { AdminStats } from '@/types';

export function DashboardTab({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Usuarios" value={stats.users} variant="admin" />
      <StatCard label="Acompañantes" value={stats.companions} variant="admin" />
      <StatCard label="Reservas totales" value={stats.totalBookings} color="blue" variant="admin" />
      <StatCard label="Reservas activas" value={stats.activeBookings} color="amber" variant="admin" />
      <StatCard label="Completadas" value={stats.completedBookings} color="green" variant="admin" />
      <StatCard label="Pagos" value={stats.totalPayments} variant="admin" />
      <StatCard label="Facturación" value={`${(stats.totalRevenue / 100).toFixed(0)}€`} color="green" variant="admin" />
      <StatCard label="Pend. verificar" value={stats.pendingCompanions} color="amber" variant="admin" />
    </div>
  );
}
