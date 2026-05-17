import { z } from 'zod';

export const solicitudSchema = z.object({
  serviceType: z.string().min(1, 'Selecciona un tipo de servicio'),
  address: z.string().min(3, 'La dirección debe tener al menos 3 caracteres'),
  date: z.string().min(1, 'Selecciona una fecha'),
  time: z.string().min(1, 'Selecciona una hora'),
  disability: z.string().optional(),
  notes: z.string().optional(),
});

export type SolicitudFormData = z.infer<typeof solicitudSchema>;

export const perfilSchema = z.object({
  fullName: z.string().min(1, 'El nombre es obligatorio'),
  headline: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  disabilityType: z.string().optional(),
  preferences: z.string().optional(),
  isCompanion: z.boolean().optional(),
  specialties: z.string().optional(),
});

export type PerfilFormData = z.infer<typeof perfilSchema>;

export const valoracionSchema = z.object({
  rating: z.number().min(1, 'Selecciona una puntuación').max(5),
  summary: z.string().optional(),
});

export type ValoracionFormData = z.infer<typeof valoracionSchema>;

export function validateFutureDate(dateStr: string, timeStr: string): string | null {
  if (!dateStr || !timeStr) return null;
  const scheduledAt = new Date(`${dateStr}T${timeStr}:00`);
  if (isNaN(scheduledAt.getTime())) return null;
  if (scheduledAt <= new Date()) return 'La fecha debe ser futura';
  return null;
}
