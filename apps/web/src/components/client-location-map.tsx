'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { createClient } from '@/lib/supabase/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type ClientLocation = {
  id: string;
  clientId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: string;
  clientName?: string;
};

function createClientIcon(color: string) {
  return new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);transform:translate(-50%,-50%)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

const CLIENT_COLORS = ['#0077b6', '#e07b39', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#ef4444'];

export function ClientLocationMap({ clientNames }: { clientNames: Record<string, string> }) {
  const [locations, setLocations] = useState<ClientLocation[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const loadLocations = async () => {
      const { data } = await supabase.from('ClientLocation').select('*');
      if (data) setLocations(data as ClientLocation[]);
    };
    loadLocations();

    const channel = supabase
      .channel('client-location-changes')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'ClientLocation' },
        async () => {
          const { data } = await supabase.from('ClientLocation').select('*');
          if (data) setLocations(data as ClientLocation[]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (locations.length === 0) {
    return (
      <div className="h-[400px] bg-gray-50 rounded-2xl flex items-center justify-center">
        <p className="text-gray-400">No hay ubicaciones activas de clientes</p>
      </div>
    );
  }

  const center = { lat: locations[0].latitude, lng: locations[0].longitude };

  return (
    <div className="h-[500px] rounded-2xl overflow-hidden border border-gray-200">
      <MapContainer center={[center.lat, center.lng]} zoom={14} className="h-full w-full" scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc, i) => (
          <Marker
            key={loc.clientId}
            position={[loc.latitude, loc.longitude]}
            icon={createClientIcon(CLIENT_COLORS[i % CLIENT_COLORS.length])}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{clientNames[loc.clientId] || 'Cliente'}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(loc.timestamp).toLocaleTimeString('es-ES')}
                </p>
                {loc.accuracy && (
                  <p className="text-gray-400 text-xs">Precisión: ±{Math.round(loc.accuracy)}m</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
