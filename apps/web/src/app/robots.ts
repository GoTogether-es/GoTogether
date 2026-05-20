import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gotogether.es';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/onboarding', '/perfil', '/reservas', '/panel', '/coordinacion', '/valoracion', '/supervision', '/historial', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
