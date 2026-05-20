import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';
export const runtime = 'edge';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0077b6',
          borderRadius: '20%',
          color: 'white',
          fontSize: 20,
          fontWeight: 900,
          fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        }}
      >
        G
      </div>
    ),
    { ...size },
  );
}
