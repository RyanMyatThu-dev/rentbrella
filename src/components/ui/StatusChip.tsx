import type { StationStatus } from '../../data/mockData'
import { Icon } from './Icon'

const STYLES: Record<
  StationStatus | 'success' | 'info',
  { wrap: string; dot: string }
> = {
  available: {
    wrap: 'bg-success-soft text-success border border-[#A7F3D0]',
    dot: 'bg-success',
  },
  low: {
    wrap: 'bg-warning-soft text-warning border border-[#FDE68A]',
    dot: 'bg-warning',
  },
  empty: {
    wrap: 'bg-danger-soft text-[#EF4444] border border-[#FECACA]',
    dot: 'bg-[#EF4444]',
  },
  offline: {
    wrap: 'bg-error-container text-on-error-container border border-transparent',
    dot: 'bg-error',
  },
  success: {
    wrap: 'bg-success-soft text-success border border-[#A7F3D0]',
    dot: 'bg-success',
  },
  info: {
    wrap: 'bg-secondary-fixed text-on-secondary-fixed-variant border border-transparent',
    dot: 'bg-primary',
  },
}

type StatusChipProps = {
  label: string
  status?: keyof typeof STYLES
  pulse?: boolean
  icon?: string
  className?: string
}

export function StatusChip({
  label,
  status = 'info',
  pulse = false,
  icon,
  className = '',
}: StatusChipProps) {
  const style = STYLES[status]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${style.wrap} ${className}`}
    >
      {icon ? (
        <Icon name={icon} className="text-[13px]" />
      ) : (
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot} ${pulse ? 'animate-pulse' : ''}`}
        />
      )}
      {label}
    </span>
  )
}
