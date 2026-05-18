'use client';

import { useEffect, useState, useRef } from 'react';
import { Container, Section } from '@gotogether/ui';
import { Search, SlidersHorizontal } from 'lucide-react';
import { CompanionCard } from '@/components/companion-card';
import { useRecommendations } from '@/services/queries';
import { SkeletonCard } from '@/components/skeleton';
import type { CompanionSummary } from '@/types';

const DISABILITY_OPTIONS = [
  'Movilidad reducida',
  'Discapacidad visual',
  'Discapacidad auditiva',
  'Discapacidad cognitiva',
];

export default function ExplorarPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [disabilityType, setDisabilityType] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const { data, isLoading, isError, refetch, isPlaceholderData } = useRecommendations({
    search: debouncedSearch || undefined,
    disabilityType: disabilityType || undefined,
    verified: verifiedOnly || undefined,
    page,
    limit: 9,
  });

  const companions: CompanionSummary[] = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <Section>
      <Container>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Encuentra a tu acompañante ideal</h1>
          <p className="text-gray-500 mb-8">
            Selecciona el perfil que mejor encaje con tus necesidades.
            Todos nuestros acompañantes han pasado un proceso de validación.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <label htmlFor="search-input" className="sr-only">Buscar acompañantes</label>
              <input
                id="search-input"
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Buscar por nombre, especialidad..."
                className="gt-input pl-10 w-full"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`gt-button gt-button--${showFilters ? 'primary' : 'secondary'} h-12 px-4 flex items-center gap-2 shrink-0`}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              Filtros
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-2xl">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1" htmlFor="disability-filter">
                  Tipo de discapacidad
                </label>
                <select
                  id="disability-filter"
                  value={disabilityType}
                  onChange={(e) => { setDisabilityType(e.target.value); setPage(1); }}
                  className="gt-input"
                >
                  <option value="">Todas</option>
                  {DISABILITY_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => { setVerifiedOnly(e.target.checked); setPage(1); }}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-bold text-gray-700">Solo verificados</span>
                </label>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-2">Error al cargar acompañantes</p>
              <p className="text-gray-400 mb-4">No se pudo conectar con el servidor.</p>
              <button onClick={() => refetch()} className="gt-button gt-button--primary">
                Reintentar
              </button>
            </div>
          ) : companions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-2">No se encontraron acompañantes</p>
              <p className="text-gray-400">Prueba a ajustar los filtros de búsqueda.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ opacity: isPlaceholderData ? 0.6 : 1 }}>
                {companions.map((companion) => (
                  <CompanionCard key={companion.id} {...companion} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="gt-button gt-button--ghost h-10 px-4 disabled:opacity-30"
                    aria-label="Página anterior"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-500">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="gt-button gt-button--ghost h-10 px-4 disabled:opacity-30"
                    aria-label="Página siguiente"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </Container>
    </Section>
  );
}
