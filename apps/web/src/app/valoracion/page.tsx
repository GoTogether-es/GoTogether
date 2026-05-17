'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Section, Container } from '@gotogether/ui';

export default function ValoracionIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/reservas');
  }, [router]);

  return (
    <Section>
      <Container>
        <div className="max-w-6xl mx-auto text-center py-20">
          <p className="text-gray-500">Redirigiendo a tus reservas...</p>
        </div>
      </Container>
    </Section>
  );
}
