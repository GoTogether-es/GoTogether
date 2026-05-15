import type { ReactNode } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

type LinkButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function LinkButton({
  href,
  children,
  className,
  variant = 'primary',
}: LinkButtonProps) {
  return (
    <Link href={href} className={clsx('gt-button', `gt-button--${variant}`, className)}>
      {children}
    </Link>
  );
}
