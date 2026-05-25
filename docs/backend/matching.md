---
tags: [backend, matching, search]
---

# Sistema de Matching / Búsqueda

**Archivo principal:** `apps/api/src/modules/matching/matching.service.ts`
**Endpoint:** `GET /matching/recommendations`
**Tests:** `matching.service.spec.ts` (7 tests)

## Descripción

El sistema de matching permite a los clientes buscar acompañantes verificados. Soporta búsqueda por texto, filtrado por tipo de discapacidad, rating mínimo, verificación, y paginación.

## Endpoint

```
GET /matching/recommendations?search=&disabilityType=&minRating=&verified=&page=&limit=
```

**Auth:** Pública (sin JWT)

### Parámetros

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `search` | string | — | Busca en nombre, headline y bio (case insensitive) |
| `disabilityType` | string | — | Filtra por tipo de discapacidad (exacto, case insensitive) |
| `minRating` | number | — | Rating mínimo (≥) |
| `verified` | boolean | — | Solo verificados (true) |
| `page` | number | 1 | Página actual |
| `limit` | number | 9 | Resultados por página |

### Respuesta

```json
{
  "data": [
    {
      "id": "comp-123",
      "profile": { "fullName": "María", "headline": "Acompañante senior", ... },
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

2. Si hay search o disabilityType
   a. Si search → añadir OR en profile: fullName contains, headline contains, bio contains
   b. Si disabilityType → añadir AND: disabilityType equals
   c. Si ambos → profile.AND = [search OR conditions, disabilityType condition]
       También se genera profile.OR para el search en un path alternativo

3. Paginación: skip = (page - 1) * limit, take = limit

4. Ordenar por: rating DESC, yearsOnPlatform DESC

5. Ejecutar findMany + count en paralelo (Promise.all)
```

> [!warning] El algoritmo tiene dos branches de construcción de `where` que se solapan parcialmente. Revisar si hay condiciones que se pisan entre el bloque `if (search || disabilityType)` y el bloque `if (search)` posterior.

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
useRecommendations({ search, disabilityType, verified, page, limit })
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
