'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import type { AdminUser } from '@/types';
import { LOCALE } from '@/lib/constants';

export function UsersTab({ users }: { users: AdminUser[] }) {
  return (
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
          {users.map(u => (
            <tr key={u.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-3 font-medium">{u.profile?.fullName || '—'}</td>
              <td className="py-3 px-3 text-gray-600">{u.email}</td>
              <td className="py-3 px-3"><span className="gt-tag">{u.role}</span></td>
              <td className="py-3 px-3">
                {u.profile?.verified ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : u.profile ? (
                  <XCircle className="w-5 h-5 text-gray-300" />
                ) : (
                  <span className="text-gray-400 text-xs">Sin perfil</span>
                )}
              </td>
              <td className="py-3 px-3 text-gray-500">
                {new Date(u.createdAt).toLocaleDateString(LOCALE)}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-400">
                No hay usuarios
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
