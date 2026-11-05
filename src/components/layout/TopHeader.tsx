import { Link } from 'react-router-dom'
import { PROFILE } from '../../data/mockData'
import { Icon } from '../ui/Icon'

type TopHeaderProps = {
  title?: string
  subtitle?: string
  showBack?: boolean
  backTo?: string
  showNotifications?: boolean
}

export function TopHeader({
  title = 'Rentbrella',
  subtitle,
  showBack = false,
  backTo = '/',
  showNotifications = false,
}: TopHeaderProps) {
  return (
    <header className="pt-safe fixed top-0 z-50 w-full bg-surface/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {showBack ? (
            <Link
              to={backTo}
              aria-label="Back"
              className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container"
            >
              <Icon name="arrow_back" className="text-[20px]" />
            </Link>
          ) : null}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm">
            <Icon name="umbrella" className="text-[18px]" filled />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-lg leading-6 font-bold text-on-surface">
              {title}
            </span>
            {subtitle ? (
              <span className="truncate text-[11px] leading-4 font-semibold tracking-wide text-on-surface-variant uppercase">
                {subtitle}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {showNotifications ? (
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
            >
              <Icon name="notifications" className="text-[20px]" />
            </button>
          ) : null}
          <img
            src={PROFILE.avatar}
            alt={`${PROFILE.name} profile`}
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-surface-container"
          />
        </div>
      </div>
    </header>
  )
}
