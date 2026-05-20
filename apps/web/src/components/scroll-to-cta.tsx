'use client';

export function ScrollToCta({
  children,
  className,
  variant = 'primary',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  return (
    <button
      type="button"
      className={`gt-button gt-button--${variant} ${className || ''}`}
      onClick={() => {
        document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      {children}
    </button>
  );
}
