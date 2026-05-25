'use client';

import type { ComponentType } from 'react';

interface PendingButtonProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  danger?: boolean;
  onClick: () => void;
}

export function PendingButton({ icon: Icon, label, danger, onClick }: PendingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`gt-button text-sm px-4 py-2 ${
        danger
          ? 'gt-button--ghost border-red-200 text-red-600 hover:bg-red-50'
          : 'gt-button--primary'
      }`}
    >
      <Icon className="w-4 h-4 mr-1" />
      {label}
    </button>
  );
}
