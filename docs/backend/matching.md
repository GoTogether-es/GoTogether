---
tags: [backend, matching, search]
---

# Sistema de Matching / Búsqueda

**Archivo principal:** `apps/api/src/modules/matching/matching.service.ts`
**Endpoint:** `GET /matching/recommendations`
**Tests:** `matching.service.spec.ts` (9 tests)

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
| `search` | string | — | Busca en nombre, headline y bio (case insensitive) |
| `disabilityType` | string | — | Filtra por tipo de discapacidad (exacto, case insensitive) |
| `minRating` | number | — | Rating mínimo (≥) |
| `verified` | boolean | — | Solo verificados (true) |
| `city` | string | — | Ciudad pública para priorizar cercanía |
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

## Algoritmo de búsqueda

```
1. Construir where base
   - Si minRating != null → where.rating = { gte: minRating }
   - Si verified == true → where.verified = true

2. Construir profileConditions array
   a. Si hay search → añadir OR: fullName, headline, bio contains search
   b. Si hay disabilityType → añadir AND: disabilityType equals
   c. Si hay city → añadir ciudad exacta case insensitive
   d. Si profileConditions no está vacío → where.profile = { AND: profileConditions }

3. Ejecutar findMany + count en paralelo (Promise.all) con `profile.user.privateLocation`

4. Calcular score compuesto por acompañante
   - Distancia con Haversine si hay lat/lng del usuario
   - Rating
   - Verificación
   - Coincidencia de ciudad
   - Experiencia (`yearsOnPlatform`)

5. Ordenar por score descendente y aplicar paginación después del ranking
```

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
