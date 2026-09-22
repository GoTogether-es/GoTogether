'use client';

import { Card } from '@gotogether/ui';
import type { ComponentType } from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: ComponentType<{ className?: string }>;
  color?: 'blue' | 'amber' | 'green' | 'emerald';
  variant?: 'admin' | 'panel';
}

const COLOR_CLASSES = {
  blue:   { bg: 'bg-blue-50 border-blue-100',         text: 'text-blue-700' },
  amber:  { bg: 'bg-amber-50 border-amber-100',       text: 'text-amber-700' },
  green:  { bg: 'bg-emerald-50 text-emerald-700',     text: 'text-emerald-700' },
  emerald:{ bg: 'bg-emerald-50 border-emerald-100',   text: 'text-emerald-700' },
};

export function StatCard({ label, value, icon: Icon, color = 'blue', variant = 'panel' }: StatCardProps) {
  const cs = COLOR_CLASSES[color] ?? COLOR_CLASSES.blue;

  if (variant === 'admin') {
    return (
      <div className={`gt-card p-5 text-center ${cs.bg}`}>
        <p className="text-2xl font-extrabold">{value}</p>
        <p className="text-sm mt-1 font-medium">{label}</p>
      </div>
    );
  }

  return (
    <Card className={`p-5 border ${cs.bg} text-center`}>
      {Icon && <Icon className={`w-5 h-5 mx-auto mb-1 ${cs.text}`} />}
      <p className={`text-2xl font-extrabold ${cs.text}`}>{value}</p>
      <p className="text-xs font-medium text-gray-500">{label}</p>
    </Card>
  );
}
