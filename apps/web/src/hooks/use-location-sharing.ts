'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const INTERVAL_MS = 15000;

export function useLocationSharing() {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const supabase = createClient();

  const stopSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
    supabase.from('ClientLocation').delete().eq('clientId', (supabase.auth as any)?.session?.()?.user?.id).then(() => {}).catch(() => {});
  };

  const startSharing = async () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('Debes iniciar sesión para compartir ubicación');
      return;
    }

    setError(null);

    let firstPosition = true;
    let lastLat = 0;
    let lastLng = 0;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Skip if position hasn't changed significantly (5 meters)
        if (!firstPosition && Math.abs(latitude - lastLat) < 0.00005 && Math.abs(longitude - lastLng) < 0.00005) {
          return;
        }
        firstPosition = false;
        lastLat = latitude;
        lastLng = longitude;

        try {
          await supabase.from('ClientLocation').upsert({
            clientId: session.user.id,
            latitude,
            longitude,
            accuracy,
            timestamp: new Date().toISOString(),
          });
          setLastSent(new Date());
        } catch {
          // Silently ignore individual send failures
        }
      },
      (err) => {
        setError(getGeolocationErrorMessage(err));
        stopSharing();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: INTERVAL_MS }
    );

    setSharing(true);
  };

  const toggle = () => {
    if (sharing) {
      stopSharing();
    } else {
      startSharing();
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { sharing, error, lastSent, toggle, startSharing, stopSharing };
}

function getGeolocationErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED: return 'Permiso de ubicación denegado. Actívalo en la configuración del navegador.';
    case err.POSITION_UNAVAILABLE: return 'No se pudo obtener la ubicación. Comprueba tu conexión.';
    case err.TIMEOUT: return 'Tiempo de espera agotado al obtener ubicación.';
    default: return 'Error desconocido de geolocalización.';
  }
}
