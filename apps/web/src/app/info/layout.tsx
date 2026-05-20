import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cómo funciona',
  description: 'Descubre cómo GoTogether conecta a personas mayores y con discapacidad con acompañantes verificados. Seguro, sencillo y humano.',
  openGraph: { title: 'Cómo funciona GoTogether' },
};

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
