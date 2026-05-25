'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { ServiceData } from '@/types';

interface ServicesTabProps {
  services: ServiceData[];
  modal: boolean;
  edit: ServiceData | null;
  onOpenModal: () => void;
  onEdit: (s: ServiceData) => void;
  onCloseModal: () => void;
  onSave: (data: { name: string; description?: string; price: number; category?: string }) => Promise<void>;
  onToggle: (id: string) => Promise<void>;
}

export function ServicesTab({ services, modal, edit, onOpenModal, onEdit, onCloseModal, onSave, onToggle }: ServicesTabProps) {
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
          {services.map(s => (<tr key={s.id} className="border-b hover:bg-gray-50"><td className="py-3 px-3 font-medium">{s.name}</td><td className="py-3 px-3">{(s.price / 100).toFixed(2)}€</td><td className="py-3 px-3 text-gray-500">{s.category || '—'}</td><td className="py-3 px-3">{s.active !== false ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-gray-300" />}</td><td className="py-3 px-3 flex gap-2"><button onClick={() => onEdit(s)} className="gt-button gt-button--ghost text-xs">Editar</button><button onClick={() => onToggle(s.id)} className="gt-button gt-button--ghost text-xs border-gray-200">{s.active !== false ? 'Desactivar' : 'Activar'}</button></td></tr>))}
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
              <button onClick={() => {
                if (!form.name.trim()) { toast.error('El nombre es requerido'); return; }
                if (form.price <= 0) { toast.error('El precio debe ser mayor que 0'); return; }
                void onSave({ name: form.name.trim(), description: form.description?.trim() || undefined, price: Math.round(form.price * 100), category: form.category?.trim() || undefined });
              }} className="gt-button gt-button--primary flex-1">Guardar</button>
              <button onClick={onCloseModal} className="gt-button gt-button--ghost flex-1">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
