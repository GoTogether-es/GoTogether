---
tags: [backend, matching, search]
---

# Sistema de Matching / Búsqueda

**Archivo principal:** `apps/api/src/modules/matching/matching.service.ts`
**Endpoint:** `GET /matching/recommendations`
**Tests:** `matching.service.spec.ts` (11 tests)

## Descripción

El sistema de matching permite a los clientes buscar acompañantes verificados. Soporta búsqueda por texto, filtrado por tipo de discapacidad, rating mínimo, verificación, ciudad, cercanía y paginación.

## Endpoint

```
GET /matching/recommendations?search=&disabilityType=&minRating=&verified=&city=&latitude=&longitude=&page=&limit=
```

**Auth:** Pública (sin JWT)

### Parámetros

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `search` | string | — | Busca en nombre, headline y bio (sin acentos, case insensitive) |
| `disabilityType` | string | — | Filtra por tipo de discapacidad (exacto, case insensitive) |
| `minRating` | number | — | Rating mínimo (≥) |
| `verified` | boolean | — | Solo verificados (true) |
| `city` | string | — | Filtra por ciudad pública (coincidencia sin acentos ni mayúsculas) |
| `latitude` | number | — | Latitud del usuario para score por distancia |
| `longitude` | number | — | Longitud del usuario para score por distancia |
| `page` | number | 1 | Página actual |
| `limit` | number | 9 | Resultados por página |

### Respuesta

```json
{
  "data": [
      {
        "id": "comp-123",
        "profile": { "fullName": "María", "headline": "Acompañante senior", "city": "Málaga", ... },
        "specialties": "Enfermería, cocina",
        "rating": 4.8,
        "yearsOnPlatform": 5,
        "verified": true
      }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 9,
    "totalPages": 5
  }
}
```

## Algoritmo de búsqueda (anillos de cercanía)

```
1. Construir where base
   - Si minRating != null → where.rating = { gte: minRating }
   - Si verified == true → where.verified = true
   - Si hay disabilityType → where.profile.disabilityType = equals (case insensitive)

2. Ejecutar findMany con `profile.user.privateLocation`

3. Filtrar en JS (insensible a acentos y mayúsculas: normalize = minúsculas + sin diacríticos)
   a. Si hay search → mantener si normalize(fullName|headline|bio) incluye normalize(search)
   b. **NO filtra por city (ya no excluye)** — la ciudad pasa a ser parámetro de priorización.

4. Calcular score compuesto por acompañante (anillos de cercanía)
   a. **Anillo 0 (misma ciudad):** normalize(profile.city) === normalize(city) → +100 pts
   b. **Anillo 1 (cerca ≤ 25 km):** distancia Haversine ≤ 25 km → +60 pts
   c. **Anillo 2 (resto):** sin bonus de anillo (0 pts)
   d. Distancia lineal (Haversine) → score inverso (máx 40 pts a 0 km)
   e. Rating (máx 30 pts a 5★)
   f. Verificación (+10 pts)
   g. Experiencia (`yearsOnPlatform`, máx 10 pts)

5. total = nº de acompañantes tras filtrar search; ordenar por score descendente y paginar.
```

> [!note] El parámetro `city` ya **no excluye**; sirve como referencia para el anillo 0. El usuario ve **todos los acompañantes** ordenados por cercanía real (con coords) y calidad. Sin coords del cliente, solo aplica anillo 0 (ciudad) y el resto va a anillo 2.

## Frontend: ExplorarPage

**Archivo:** `apps/web/src/app/explorar/page.tsx`

### Características UX
- **Búsqueda debounced:** 300ms de delay tras dejar de escribir
- **Filtros colapsables:** disability type (select) + verified (checkbox) con `aria-expanded`
- **Skeletons de carga:** 6 `SkeletonCard` durante fetch
- **Persistencia en URL:** `?q=María&d=Movilidad&v=1&p=1`
- **Estado vacío:** mensaje con sugerencia de ajustar filtros
- **Estado de error:** mensaje con botón "Reintentar"
- **Paginación:** Anterior/Siguiente con página actual

### React Query
```typescript
useRecommendations({ search, disabilityType, verified, city, latitude, longitude, page, limit })
```
- `staleTime`: 2 minutos
- `gcTime`: 10 minutos
- `placeholderData`: keepPreviousData (evita flicker al paginar)

## Filtros por discapacidad

El frontend muestra un dropdown con 4 opciones:
- Movilidad reducida
- Discapacidad visual
- Discapacidad auditiva
- Discapacidad cognitiva

El backend consulta `disabilityType` directamente en el `Profile` del acompañante.

### Ubicación y recomendados

- `city` es público y aparece en listados y perfil.
- `fullAddress` se guarda solo en la ubicación privada del usuario.
- `latitude`/`longitude` se obtienen con Nominatim al guardar el perfil.
- `/explorar` usa la ubicación del usuario para ordenar por distancia cuando existe.
- Si no hay coordenadas, el sistema usa `city` como fallback de priorización.
