'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { createBooking, requestBooking } from '@/services/api';
import { solicitudSchema, type SolicitudFormData } from '@/lib/schemas';

export default function SolicitudPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SolicitudFormData>({
    resolver: zodResolver(solicitudSchema),
  });

  const onSubmit = async (data: SolicitudFormData) => {
    try {
      const scheduledAt = new Date(`${data.date}T${data.time}:00`).toISOString();
      const booking = await createBooking({
        serviceType: data.serviceType,
        address: data.address,
        scheduledAt,
        summary: data.notes || undefined,
        disability: data.disability !== 'Ninguna / Otra' && data.disability ? data.disability : undefined,
      });
      await requestBooking(booking.id);
      toast.success('Solicitud publicada correctamente');
      router.push('/reservas');
    } catch (err: any) {
      toast.error(err.message || 'Error al crear la reserva');
    }
  };

  return (
    <Section>
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Cuéntanos qué necesitas</h1>
          <p className="text-gray-500 mb-8">
            Dinos qué tipo de servicio buscas y los detalles para que podamos encontrar al acompañante ideal.
          </p>
          <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="serviceType">
                    ¿Qué tipo de acompañamiento buscas?
                  </label>
                  <input
                    id="serviceType"
                    className="gt-input"
                    placeholder="Ej: Médico, ocio, gestiones..."
                    {...register('serviceType')}
                  />
                  {errors.serviceType && (
                    <p className="text-red-500 text-xs mt-1">{errors.serviceType.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="notes">
                    Observaciones adicionales
                  </label>
                  <input
                    id="notes"
                    className="gt-input"
                    placeholder="Ej: Necesita apoyo para subir escaleras..."
                    {...register('notes')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="date">
                    Fecha prevista
                  </label>
                  <input id="date" className="gt-input" type="date" {...register('date')} />
                  {errors.date && (
                    <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="time">
                    Hora de inicio
                  </label>
                  <input id="time" className="gt-input" type="time" {...register('time')} />
                  {errors.time && (
                    <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="address">
                  Dirección o punto de encuentro
                </label>
                <input
                  id="address"
                  className="gt-input"
                  placeholder="Ej: Calle Mayor 1, Madrid"
                  {...register('address')}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="disability">
                  Necesidades específicas / Discapacidad
                </label>
                <select id="disability" className="gt-input" {...register('disability')}>
                  <option value="">Seleccionar...</option>
                  <option>Movilidad reducida</option>
                  <option>Discapacidad visual</option>
                  <option>Discapacidad auditiva</option>
                  <option>Discapacidad cognitiva</option>
                  <option>Ninguna / Otra</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="primary" className="h-12 px-8" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Publicando...' : 'Publicar solicitud'}
                </Button>
                <Button variant="ghost" className="h-12 px-8" type="button" onClick={() => router.push('/')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
