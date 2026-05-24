import { render, screen } from '@testing-library/react';
import { ClientLocationMap } from '../client-location-map';

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [] })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  })),
}));

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: { children?: React.ReactNode }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: { children: React.ReactNode }) => <div data-testid="popup">{children}</div>,
}));

jest.mock('leaflet', () => ({
  __esModule: true,
  default: {
    Icon: { Default: { prototype: { _getIconUrl: null }, mergeOptions: jest.fn() } },
    DivIcon: jest.fn().mockImplementation((opts: any) => ({ ...opts, type: 'DivIcon' })),
  },
}));

describe('ClientLocationMap', () => {
  it('shows empty state when no locations', async () => {
    render(<ClientLocationMap clientNames={{}} />);
    const emptyMsg = await screen.findByText('No hay ubicaciones activas de clientes');
    expect(emptyMsg).toBeInTheDocument();
  });
});
