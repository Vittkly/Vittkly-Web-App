'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VittklyIcon, type VittklyIconName } from '@/components/icons/VittklyIcons';

export type WorkOrderStatus =
  | 'programada'
  | 'en-ruta'
  | 'en-curso'
  | 'completada'
  | 'pagada'
  | 'pendiente'
  | 'atrasada'
  | 'por-vencer'
  | 'cancelada';

export interface StatusBadgeProps {
  status: WorkOrderStatus;
  className?: string;
  showIcon?: boolean;
}

interface StatusConfig {
  label: string;
  iconName: VittklyIconName;
  badgeClass: string;
  dotClass: string;
}

const STATUS_CONFIGS: Record<WorkOrderStatus, StatusConfig> = {
  programada: {
    label: 'Programada',
    iconName: 'calendar',
    badgeClass: 'bg-primary-soft text-primary-ink',
    dotClass: 'bg-primary',
  },
  'en-ruta': {
    label: 'En ruta',
    iconName: 'truck',
    badgeClass: 'bg-primary-soft text-primary-ink',
    dotClass: 'bg-primary',
  },
  'en-curso': {
    label: 'En curso',
    iconName: 'clock',
    badgeClass: 'bg-primary-soft text-primary-ink',
    dotClass: 'bg-primary',
  },
  completada: {
    label: 'Completada',
    iconName: 'check',
    badgeClass: 'bg-success-soft text-success-ink',
    dotClass: 'bg-success',
  },
  pagada: {
    label: 'Pagada',
    iconName: 'card',
    badgeClass: 'bg-success-soft text-success-ink',
    dotClass: 'bg-success',
  },
  pendiente: {
    label: 'Pendiente',
    iconName: 'circle',
    badgeClass: 'bg-surface-sunken text-ink-muted',
    dotClass: 'bg-line-strong',
  },
  atrasada: {
    label: 'Atrasada',
    iconName: 'alert',
    badgeClass: 'bg-warning-soft text-warning-ink',
    dotClass: 'bg-warning',
  },
  'por-vencer': {
    label: 'Por vencer',
    iconName: 'clock',
    badgeClass: 'bg-warning-soft text-warning-ink',
    dotClass: 'bg-warning',
  },
  cancelada: {
    label: 'Cancelada',
    iconName: 'x',
    badgeClass: 'bg-danger-soft text-danger-ink',
    dotClass: 'bg-danger',
  },
};

export function StatusBadge({ status, className = '', showIcon = true }: StatusBadgeProps) {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.pendiente;

  return (
    <span
      data-testid="status-badge"
      data-status={status}
      className={twMerge(
        clsx(
          'rounded-pill inline-flex items-center gap-1.5 px-2.5 py-1 text-xs leading-4 font-bold whitespace-nowrap select-none',
          config.badgeClass,
          className
        )
      )}
    >
      {showIcon ? (
        <VittklyIcon name={config.iconName} size={14} className="shrink-0" />
      ) : (
        <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', config.dotClass)} />
      )}
      <span>{config.label}</span>
    </span>
  );
}

export default StatusBadge;
