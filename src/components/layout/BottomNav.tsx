import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'

const TABS = [
  { to: '/', label: 'Dispense', icon: 'umbrella', end: true },
  { to: '/stations', label: 'Stations', icon: 'map', end: false },
  { to: '/history', label: 'History', icon: 'history', end: false },
] as const

export function BottomNav() {
  return (
    <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50 border-t border-outline-variant/30 bg-surface/90 shadow-[0_-2px_12px_rgba(0,0,0,0.05)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-around px-4 md:px-6">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex min-h-12 min-w-16 flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors ${
                isActive
                  ? 'font-semibold text-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex items-center justify-center rounded px-4 py-1 ${
                    isActive ? 'bg-secondary-fixed/50' : ''
                  }`}
                >
                  <Icon name={tab.icon} className="text-[22px]" filled={isActive} />
                </div>
                <span className="text-[11px] leading-tight font-bold tracking-wide whitespace-nowrap">
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
