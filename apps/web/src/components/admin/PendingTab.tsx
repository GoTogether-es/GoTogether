'use client';

import { ShieldCheck, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { adminVerifyCompanion, adminRejectCompanion, adminVerifyProfile, adminRejectProfile } from '@/services/api';
import { PendingButton } from './PendingButton';
import type { AdminPending } from '@/types';

interface PendingTabProps {
  pending: AdminPending;
  adminKey: string;
  onReload: () => void;
}

export function PendingTab({ pending, adminKey, onReload }: PendingTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Acompañantes ({pending.companions.length})
        </h2>
        {pending.companions.length === 0 ? (
          <p className="text-gray-400 py-4">Sin pendientes</p>
        ) : (
          <div className="space-y-4">
            {pending.companions.map(c => (
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
                      <a href={c.penalCertificate} target="_blank" rel="noopener noreferrer" className="gt-button gt-button--ghost text-sm flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />Penales
                      </a>
                    )}
                    {c.sexualCertificate && (
                      <a href={c.sexualCertificate} target="_blank" rel="noopener noreferrer" className="gt-button gt-button--ghost text-sm flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />Sexuales
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <PendingButton
                      icon={CheckCircle}
                      label="Aprobar"
                      onClick={async () => {
                        await adminVerifyCompanion(adminKey, c.id);
                        toast.success('Aprobado');
                        onReload();
                      }}
                    />
                    <PendingButton
                      icon={XCircle}
                      label="Rechazar"
                      danger
                      onClick={async () => {
                        if (!window.confirm('¿Rechazar a este acompañante? Esta acción no se puede deshacer.')) return;
                        await adminRejectCompanion(adminKey, c.id);
                        toast.success('Rechazado');
                        onReload();
                      }}
                    />
                    <PendingButton
                      icon={XCircle}
                      label="Rechazar perfil"
                      danger
                      onClick={async () => {
                        if (!window.confirm('¿Rechazar el perfil de este cliente? Esta acción no se puede deshacer.')) return;
                        await adminRejectProfile(adminKey, c.id);
                        toast.success('Rechazado');
                        onReload();
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
