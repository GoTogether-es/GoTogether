'use client';

import { Megaphone } from 'lucide-react';

interface NotificationsTabProps {
  form: { title: string; body: string; role: string };
  onChange: (f: { title: string; body: string; role: string }) => void;
  onSend: () => void;
}

export function NotificationsTab({ form, onChange, onSend }: NotificationsTabProps) {
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
