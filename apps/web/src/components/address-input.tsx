'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { MapPin, X, Loader2, MapPinCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AddressSuggestion {
  id: string;
  displayName: string;
  city: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
}

interface AddressInputProps {
  label: string;
  placeholder?: string;
  onSelect: (suggestion: AddressSuggestion) => void;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
}

export function AddressInput({
  label,
  placeholder = 'Escribe tu dirección...',
  onSelect,
  value,
  disabled = false,
  required = false,
  error,
  helperText,
}: AddressInputProps) {
  const [query, setQuery] = useState(value ?? '');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && !selectedId) {
      setQuery(value);
    }
  }, [value, selectedId]);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const { geocodeSearch } = await import('@/services/api');
      const results = await geocodeSearch(q);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      search(query);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const handleSelect = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.displayName);
    setSelectedId(suggestion.id);
    setSuggestions([]);
    setIsOpen(false);
    onSelect(suggestion);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedId(null);
    onSelect({ id: '', displayName: '', city: '', fullAddress: '', latitude: 0, longitude: 0 });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor={`address-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
          <input
            ref={inputRef}
            id={`address-${label.toLowerCase().replace(/\s+/g, '-')}`}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              if (selectedId && e.target.value !== query) {
                setSelectedId(null);
              }
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'gt-input pl-10 pr-12',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            )}
            aria-autocomplete="list"
            aria-controls={`address-suggestions-${label.toLowerCase().replace(/\s+/g, '-')}`}
            aria-expanded={isOpen && suggestions.length > 0}
            required={required}
          />
          {selectedId && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Limpiar dirección"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 animate-spin" aria-hidden="true" />
          )}
        </div>
        {isOpen && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            id={`address-suggestions-${label.toLowerCase().replace(/\s+/g, '-')}`}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
            role="listbox"
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3',
                  selectedId === suggestion.id && 'bg-blue-50'
                )}
                role="option"
                aria-selected={selectedId === suggestion.id}
              >
                <MapPinCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{suggestion.displayName}</p>
                  {suggestion.city && (
                    <p className="text-xs text-gray-500 truncate">Ciudad: {suggestion.city}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      {selectedId && !error && (
        <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
          <MapPinCheck className="w-4 h-4" aria-hidden="true" />
          Dirección verificada
        </p>
      )}
    </div>
  );
}