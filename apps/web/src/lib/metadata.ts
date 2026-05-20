import type { Metadata } from 'next';

const title = 'GoTogether | Acompañamiento humano';
const description =
  'Plataforma que conecta personas mayores y con discapacidad con acompañantes verificados para actividades cotidianas. Más autonomía, seguridad y compañía.';

export const baseMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://gotogether.es'),
  title: {
    default: title,
    template: '%s | GoTogether',
  },
  description,
  keywords: [
    'acompañamiento',
    'personas mayores',
    'discapacidad',
    'asistencia',
    'cuidador',
    'compañía',
    'autonomía',
    'España',
  ],
  authors: [{ name: 'GoTogether Technologies S.L.' }],
  creator: 'GoTogether',
  publisher: 'GoTogether Technologies S.L.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'GoTogether',
    title,
    description,
    images: [
      {
        url: '/sintexto.png',
        width: 512,
        height: 512,
        alt: 'GoTogether',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/sintexto.png'],
  },
  icons: {
    icon: '/sintexto.png',
    shortcut: '/sintexto.png',
    apple: '/sintexto.png',
  },
  alternates: {
    canonical: '/',
  },
};

export function pageMetadata(title: string, description?: string): Metadata {
  return {
    title,
    description: description || baseMetadata.description,
    openGraph: { title },
    alternates: { canonical: `/${title.toLowerCase().replace(/\s+/g, '-')}` },
  };
}
