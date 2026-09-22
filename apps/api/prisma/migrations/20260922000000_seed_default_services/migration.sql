-- Seed de servicios por defecto (tarifa 13,00 €/h = 1300 céntimos)
-- Idempotente: solo inserta nombres que aún no existan.

INSERT INTO "Service" (id, name, description, price, category, active, "createdAt", "updatedAt")
SELECT gen_random_uuid(), v.name, v.description, 1300, v.category, true, now(), now()
FROM (VALUES
  ('Acompañamiento médico', 'Acompañamiento a citas médicas, hospitales y tratamientos.', 'Salud'),
  ('Acompañamiento a compras y gestiones', 'Ayuda con la compra, trámites, farmacia y recados.', 'Día a día'),
  ('Paseos y ocio', 'Paseos, actividades de ocio y tiempo libre acompañado.', 'Ocio'),
  ('Acompañamiento a eventos', 'Asistencia a bodas, reuniones, actos sociales y otros eventos.', 'Ocio'),
  ('Cuidado en casa', 'Apoyo y bienestar en el hogar, compañía y cuidados básicos.', 'Cuidados'),
  ('Asistencia en viajes', 'Acompañamiento en desplazamientos, aeropuertos y estancias.', 'Viajes')
) AS v(name, description, category)
WHERE NOT EXISTS (SELECT 1 FROM "Service" AS s WHERE s.name = v.name);