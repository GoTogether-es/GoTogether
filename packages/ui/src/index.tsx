import type { ReactNode } from 'react';
import clsx from 'clsx';

export function Section({
  children,
  className,
  style,
  id,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}) {
  return (
    <section className={clsx('gt-section', className)} style={style} id={id}>
      {children}
    </section>
  );
}

export function Container({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={clsx('gt-container', className)} style={style}>
      {children}
    </div>
  );
}

export function Button({
  children,
  className,
  variant = 'primary',
  ...props
}: {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={clsx('gt-button', `gt-button--${variant}`, className)} {...props}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={clsx('gt-card', className)} style={style}>
      {children}
    </div>
  );
}
