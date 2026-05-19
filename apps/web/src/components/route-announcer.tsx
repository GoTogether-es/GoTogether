'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function RouteAnnouncer() {
  const pathname = usePathname();
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = announcerRef.current;
    if (!el) return;

    // Get the page title or use the pathname as fallback
    const title = document.title || pathname;
    el.textContent = `Navegaste a: ${title}`;
  }, [pathname]);

  return (
    <div
      ref={announcerRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
