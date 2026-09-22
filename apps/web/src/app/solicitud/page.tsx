'use client';

import { Suspense, useRef, useEffect } from 'react';
import { SkeletonForm } from '@/components/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Card, Container, FieldError, Section } from '@gotogether/ui';
import { createBooking, requestBooking } from '@/services/api';
import { solicitudSchema, type SolicitudFormData, validateFutureDate } from '@/lib/schemas';
import { useServices, useCompanion, useCompanionAvailability, useProfile } from '@/services/queries';
import { DISABILITY_OPTIONS } from '@/lib/constants';
import { User, X, Calendar, Clock, Briefcase, MapPin } from 'lucide-react';

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

function SolicitudForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companionId = searchParams.get('companionId');
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: companion } = useCompanion(companionId ?? '');
  const { data: availabilitySlots = [] } = useCompanionAvailability(companionId ?? '');
  const { data: profile } = useProfile();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
    setError,
  } = useForm<SolicitudFormData>({
    resolver: zodResolver(solicitudSchema),
    defaultValues: {
      estimatedHours: 1,
      disability: '',
      disabilityOther: '',
    },
  });

  const selectedServiceId = watch('serviceId');
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const estimatedHoursValue = watch('estimatedHours') || 1;
  const dateValue = watch('date');
  const timeValue = watch('time');
  const disabilityValue = watch('disability');

  // Precarga la discapacidad del perfil si el usuario no ha elegido otra.
  useEffect(() => {
    if (!disabilityValue && profile?.disabilityType) {
      setValue('disability', profile.disabilityType);
    }
  }, [profile, disabilityValue, setValue]);

  const noServices = !servicesLoading && services.length === 0;

  const pricePerHourCents =
    selectedService?.price && selectedService.price > 0 ? selectedService.price : 1300;
  const estimatedCost = (estimatedHoursValue * pricePerHourCents) / 100;

  // Comprobación orientativa frente a la disponibilidad publicada del acompañante.
  const requestedDate =
    dateValue && timeValue ? new Date(`${dateValue}T${timeValue}:00`) : null;
  const requestedDay =
    requestedDate && !isNaN(requestedDate.getTime()) ? requestedDate.getDay() : undefined;
  const outsideAvailability =
    !!companionId &&
    requestedDay !== undefined &&
    !!timeValue &&
    availabilitySlots.length > 0 &&
    !availabilitySlots.some(
      (s) => s.dayOfWeek === requestedDay && s.startTime <= timeValue && s.endTime >= timeValue,
    );

  const onSubmit = async (data: SolicitudFormData) => {
    const dateError = validateFutureDate(data.date, data.time);
    if (dateError) {
      setError('date', { message: dateError });
      return;
    }

    try {
      const localDate = new Date(`${data.date}T${data.time}:00`);
      const scheduledAt = localDate.toISOString();
      const localDayOfWeek = localDate.getDay();
      const localTime = `${String(localDate.getHours()).padStart(2, '0')}:${String(localDate.getMinutes()).padStart(2, '0')}`;
      const service = services.find((s) => s.id === data.serviceId);
      const disability =
        data.disability === 'Ninguna' || !data.disability
          ? undefined
          : data.disability === 'Otra'
            ? data.disabilityOther?.trim() || undefined
            : data.disability;

      const booking = await createBooking({
        serviceType: service?.name || 'Servicio',
        serviceId: data.serviceId,
        address: data.address,
        scheduledAt,
        localDayOfWeek,
        localTime,
        summary: data.notes || undefined,
        disability,
        companionId: companionId || undefined,
        estimatedHours: Number(data.estimatedHours),
        publish: true,
      });
      // Compatibilidad: si una API aún no soporta `publish`, la reserva vuelve como DRAFT
      // y la solicitamos en una segunda llamada (como antes).
      if (booking?.status === 'DRAFT') {
        await requestBooking(booking.id);
      }
      if (!mountedRef.current) return;
      toast.success(companionId ? 'Solicitud enviada al acompañante' : 'Solicitud publicada correctamente');
      router.push('/reservas');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear la reserva';
      toast.error(message);
    }
  };

  const summaryRows = [
    { icon: Briefcase, label: 'Servicio', value: selectedService?.name },
    { icon: Calendar, label: 'Fecha', value: requestedDate ? requestedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : undefined },
    { icon: Clock, label: 'Hora', value: timeValue || undefined },
    { icon: Clock, label: 'Duración', value: `${estimatedHoursValue} ${estimatedHoursValue === 1 ? 'hora' : 'horas'}` },
    { icon: MapPin, label: 'Dirección', value: watch('address') || undefined },
    { icon: MapPin, label: 'Necesidades', value: watch('disability') === 'Otra' ? watch('disabilityOther') || 'Otra' : watch('disability') || undefined },
    { icon: User, label: 'Observaciones', value: watch('notes') || undefined },
  ].filter((row) => row.value);

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Cuéntanos qué necesitas</h1>
      <p className="text-gray-500 mb-8">
        Dinos qué tipo de servicio buscas y los detalles para que podamos encontrar al acompañante ideal.
      </p>

      {companionId && companion && (
        <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-900">
              Has seleccionado a {companion.profile.fullName}
              {companion.profile.city ? ` · ${companion.profile.city}` : ''}
            </p>
            <p className="text-xs text-blue-700">
              La solicitud se enviará directamente a este acompañante.
            </p>
          </div>
          <Button
            variant="ghost"
            className="h-9 px-3 text-xs shrink-0"
            type="button"
            onClick={() => router.replace('/solicitud')}
          >
            <X className="w-4 h-4 mr-1" /> Quitar
          </Button>
        </div>
      )}

      <Card className="p-8 border-0 shadow-xl shadow-blue-900/5">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="serviceId">
                ¿Qué tipo de acompañamiento buscas?
              </label>
              {servicesLoading ? (
                <div className="gt-input bg-gray-100 animate-pulse h-12 rounded-xl" />
              ) : noServices ? (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-800">
                  Aún no hay servicios disponibles para solicitar. Inténtalo más tarde o contacta con
                  GoTogether.
                </div>
              ) : (
                <select
                  id="serviceId"
                  className="gt-input"
                  aria-required="true"
                  {...register('serviceId')}
                >
                  <option value="">Selecciona un servicio...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {eur.format(s.price / 100)}/h
                    </option>
                  ))}
                </select>
              )}
              <FieldError message={errors.serviceId?.message} />
              {selectedService && (
                <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-800">{selectedService.description}</p>
                  <p className="text-xs text-blue-500 mt-1">
                    Precio orientativo: {eur.format(selectedService.price / 100)}/h
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="notes">
                Observaciones adicionales
              </label>
              <input
                id="notes"
                className="gt-input"
                maxLength={1000}
                placeholder="Ej: Necesita apoyo para subir escaleras..."
                {...register('notes')}
              />
              <FieldError message={errors.notes?.message} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="date">
                Fecha prevista
              </label>
              <input
                id="date"
                className="gt-input"
                type="date"
                aria-required="true"
                min={new Date().toISOString().split('T')[0]}
                {...register('date')}
              />
              <FieldError message={errors.date?.message} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="time">
                Hora de inicio
              </label>
              <input
                id="time"
                className="gt-input"
                type="time"
                aria-required="true"
                {...register('time')}
              />
              <FieldError message={errors.time?.message} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="estimatedHours">
                Duración estimada
              </label>
              <select
                id="estimatedHours"
                className="gt-input"
                aria-required="true"
                {...register('estimatedHours', { valueAsNumber: true })}
              >
                <option value="1">1 hora</option>
                <option value="1.5">1.5 horas</option>
                <option value="2">2 horas</option>
                <option value="2.5">2.5 horas</option>
                <option value="3">3 horas</option>
                <option value="4">4 horas</option>
                <option value="5">5 horas</option>
                <option value="6">6 horas</option>
                <option value="8">8 horas</option>
              </select>
              <FieldError message={errors.estimatedHours?.message} />
            </div>
          </div>

          {outsideAvailability && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-sm text-amber-800">
              <p className="font-semibold">Aviso de disponibilidad</p>
              <p className="mt-0.5">
                Este horario no coincide con la disponibilidad publicada de{' '}
                {companion?.profile.fullName || 'este acompañante'}. Puedes enviarlo igualmente, pero
                es posible que no pueda atenderte a esa hora.
              </p>
            </div>
          )}

          <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-green-800">
                Importe estimado:{' '}
                <span className="text-lg font-bold">{eur.format(estimatedCost)}</span>
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Tarifa de {eur.format(pricePerHourCents / 100)}/h más 2,00 €/h de gestión de
                GoTogether.
              </p>
            </div>
            <p className="text-xs text-green-600 max-w-xs md:text-right">
              *El cobro se realiza cuando el acompañante acepta y se completa el servicio. El importe
              final se ajusta al tiempo real (mínimo 1 hora, redondeado a la 1/2 hora más cercana).
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="address">
              Dirección o punto de encuentro
            </label>
            <input
              id="address"
              className="gt-input"
              autoComplete="street-address"
              aria-required="true"
              maxLength={500}
              placeholder="Ej: Calle Mayor 1, Madrid"
              {...register('address')}
            />
            <FieldError message={errors.address?.message} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="disability">
              Necesidades específicas / Discapacidad
            </label>
            <select id="disability" className="gt-input" {...register('disability')}>
              <option value="">Seleccionar...</option>
              <option value="Ninguna">Ninguna</option>
              {DISABILITY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
              <option value="Otra">Otra (indicar)</option>
            </select>
            <FieldError message={errors.disability?.message} />
            {disabilityValue === 'Otra' && (
              <div className="mt-2">
                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="disabilityOther">
                  ¿Cuál? Descríbela brevemente
                </label>
                <input
                  id="disabilityOther"
                  className="gt-input"
                  maxLength={200}
                  placeholder="Ej: Alergias graves, epilepsia..."
                  {...register('disabilityOther')}
                />
                <FieldError message={errors.disabilityOther?.message} />
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
              Resumen de tu solicitud
            </h3>
            {summaryRows.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Completa el formulario y verás aquí el resumen antes de publicar.
              </p>
            ) : (
              <dl className="space-y-2">
                {summaryRows.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5 text-sm">
                    <Icon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <dt className="text-gray-500 w-28 shrink-0">{label}</dt>
                    <dd className="font-semibold text-gray-800">{value}</dd>
                  </div>
                ))}
                <div className="flex items-start gap-2.5 text-sm border-t border-gray-200 pt-2 mt-2">
                  <span className="w-4 shrink-0" aria-hidden="true" />
                  <dt className="text-gray-500 w-28 shrink-0">Importe</dt>
                  <dd className="font-bold text-green-700">{eur.format(estimatedCost)}</dd>
                </div>
                {companionId && companion && (
                  <div className="flex items-start gap-2.5 text-sm">
                    <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <dt className="text-gray-500 w-28 shrink-0">Acompañante</dt>
                    <dd className="font-semibold text-gray-800">{companion.profile.fullName}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="primary"
              className="h-12 px-8"
              type="submit"
              disabled={isSubmitting || noServices}
            >
              {isSubmitting
                ? 'Publicando...'
                : companionId
                  ? 'Enviar solicitud al acompañante'
                  : 'Publicar solicitud'}
            </Button>
            <Button
              variant="ghost"
              className="h-12 px-8"
              type="button"
              onClick={() => router.push(companionId ? `/explorar/${companionId}` : '/explorar')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}

export default function SolicitudPage() {
  return (
    <Section>
      <Container>
        <div className="max-w-4xl mx-auto">
          <Suspense
            fallback={
              <div className="max-w-4xl mx-auto py-10">
                <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2" />
                <div className="h-5 w-96 bg-gray-200 rounded-lg animate-pulse mb-10" />
                <SkeletonForm />
              </div>
            }
          >
            <SolicitudForm />
          </Suspense>
        </div>
      </Container>
    </Section>
  );
}