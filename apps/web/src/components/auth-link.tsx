'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { routes } from '@/lib/routes';
import { ArrowRight } from 'lucide-react';

export function AuthLink({
  children,
  className,
  variant = 'primary',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const [href, setHref] = useState<string>(routes.login);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHref(session ? routes.perfil : routes.login);
    })();
  }, [supabase.auth]);

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
