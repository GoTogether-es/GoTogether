import clsx from 'clsx';

type SkeletonBaseProps = {
  className?: string;
  style?: React.CSSProperties;
};

function SkeletonBase({ className, style }: SkeletonBaseProps) {
  return (
    <div
      className={clsx('animate-pulse rounded-lg bg-gray-200', className)}
      style={style}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ width = '100%', height = '1rem' }: { width?: string; height?: string }) {
  return <SkeletonBase className={clsx(height, width)} />;
}

export function SkeletonAvatar({ size = '3rem' }: { size?: string }) {
  return (
    <SkeletonBase className="rounded-full shrink-0" style={{ width: size, height: size }} />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={clsx('p-5 rounded-2xl bg-white border border-gray-100 shadow-sm', className)}>
      <SkeletonBase className="w-full h-[180px] rounded-xl mb-4" />
      <SkeletonText width="60%" height="1.25rem" />
      <div className="mt-2 space-y-2">
        <SkeletonText width="80%" />
        <SkeletonText width="40%" />
      </div>
      <div className="flex gap-2 mt-3">
        <SkeletonBase className="h-7 w-20 rounded-full" />
        <SkeletonBase className="h-7 w-16 rounded-full" />
      </div>
      <SkeletonBase className="h-10 w-full rounded-full mt-4" />
    </div>
  );
}

export function SkeletonBookingCard({ className }: { className?: string }) {
  return (
    <div className={clsx('p-8 rounded-2xl bg-white border border-gray-100 shadow-sm', className)}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBase className="h-6 w-20 rounded-full" />
        <SkeletonText width="30%" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <SkeletonText width="30%" height="0.75rem" />
          <SkeletonText width="60%" />
        </div>
        <div className="space-y-2">
          <SkeletonText width="30%" height="0.75rem" />
          <SkeletonText width="60%" />
        </div>
        <div className="space-y-2">
          <SkeletonText width="30%" height="0.75rem" />
          <SkeletonText width="60%" />
        </div>
        <div className="space-y-2">
          <SkeletonText width="30%" height="0.75rem" />
          <SkeletonText width="60%" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonChat() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <SkeletonAvatar size="2.5rem" />
        <SkeletonBase className="h-16 w-3/5 rounded-2xl" />
      </div>
      <div className="flex gap-3 items-end justify-end">
        <SkeletonBase className="h-12 w-2/5 rounded-2xl" />
        <SkeletonAvatar size="2.5rem" />
      </div>
      <div className="flex gap-3 items-end">
        <SkeletonAvatar size="2.5rem" />
        <SkeletonBase className="h-20 w-1/2 rounded-2xl" />
      </div>
      <div className="flex gap-3 items-end justify-end">
        <SkeletonBase className="h-10 w-3/5 rounded-2xl" />
        <SkeletonAvatar size="2.5rem" />
      </div>
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <SkeletonText width="40%" height="0.875rem" />
          <SkeletonBase className="h-12 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <SkeletonText width="40%" height="0.875rem" />
          <SkeletonBase className="h-12 w-full rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <SkeletonText width="30%" height="0.875rem" />
          <SkeletonBase className="h-12 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <SkeletonText width="30%" height="0.875rem" />
          <SkeletonBase className="h-12 w-full rounded-xl" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonText width="35%" height="0.875rem" />
        <SkeletonBase className="h-12 w-full rounded-xl" />
      </div>
      <div className="space-y-2">
        <SkeletonText width="25%" height="0.875rem" />
        <SkeletonBase className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonPage({ children }: { children: React.ReactNode }) {
  return (
    <section className="gt-section">
      <div className="gt-container">
        <div className="max-w-5xl mx-auto">
          <SkeletonText width="40%" height="2rem" />
          <div className="mt-2">
            <SkeletonText width="60%" height="1.25rem" />
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
