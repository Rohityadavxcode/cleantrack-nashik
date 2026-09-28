'use client';

import React from 'react';
import { STATUS_CONFIG } from '@/lib/constants';
import { useTranslation } from '@/i18n/LanguageContext';

export const StatusBadge: React.FC<{ status: string; size?: 'sm' | 'md' | 'lg' }> = ({
  status,
  size = 'md',
}) => {
  const { language } = useTranslation();
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    labelMarathi: status,
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    borderColor: 'border-slate-300',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border ${cfg.badgeBg} ${cfg.badgeText} ${cfg.borderColor} ${sizeClasses}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0"
        style={{ backgroundColor: cfg.color }}
      />
      {language === 'mr' ? cfg.labelMarathi : cfg.label}
    </span>
  );
};
