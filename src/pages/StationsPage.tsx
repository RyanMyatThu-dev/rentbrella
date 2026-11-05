import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STATION_DIRECTORY, type Station } from '../data/mockData'
import { AppShell } from '../components/layout/AppShell'
import { StationMap } from '../components/stations/StationMap'
import { Icon } from '../components/ui/Icon'
import { useRentalStore } from '../store/rentalStore'

const PAGE_SIZE = 4

function matchesLocation(station: Station, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return [station.location, station.shortName, station.name].some((field) =>
    field.toLowerCase().includes(needle),
  )
}

const CAPACITY_STYLES = {
  available: {
    wrap: 'bg-success-soft text-success border-[#A7F3D0]',
    label: 'Ready',
  },
  low: {
    wrap: 'bg-warning-soft text-warning border-[#FDE68A]',
    label: 'Low stock',
  },
  empty: {
    wrap: 'bg-danger-soft text-[#EF4444] border-[#FECACA]',
    label: 'Empty',
  },
  offline: {
    wrap: 'bg-error-container text-on-error-container border-transparent',
    label: 'Offline',
  },
} as const

export function StationsPage() {
  const navigate = useNavigate()
  const selectStation = useRentalStore((s) => s.selectStation)
  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)

  const matches = useMemo(() => {
    return [...STATION_DIRECTORY]
      .filter((station) => matchesLocation(station, query))
      .sort((a, b) => a.distanceM - b.distanceM)
  }, [query])

  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageStart = safePage * PAGE_SIZE
  const visible = matches.slice(pageStart, pageStart + PAGE_SIZE)

  const openStation = (station: Station) => {
    selectStation(station)
    navigate('/scan')
  }

  const runSearch = () => {
    setQuery(draft)
    setPage(0)
  }

  return (
    <AppShell title="Stations" subtitle="Bangkok Metro">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <StationMap
          stations={matches}
          fitStations={visible}
          heightClassName="h-[320px] sm:h-[380px] lg:h-full lg:min-h-[520px]"
          onSelect={openStation}
        />

        <div className="flex flex-col gap-3 animate-fade-up">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-on-surface">Nearby dispensers</h1>
            <span className="text-[11px] font-bold text-on-surface-variant">
              Sorted by distance
            </span>
          </div>

          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              runSearch()
            }}
          >
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search locations</span>
              <Icon
                name="search"
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-on-surface-variant"
              />
              <input
                type="search"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Search by location"
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest py-2.5 pr-3 pl-10 text-sm text-on-surface shadow-[var(--shadow-card)] outline-none placeholder:text-on-surface-variant/70 focus:border-primary"
              />
            </label>
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-primary px-4 text-sm font-bold text-on-primary shadow-sm transition-colors hover:bg-primary-container active:scale-[0.98]"
            >
              Search
            </button>
          </form>

          {visible.length === 0 ? (
            <p className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-6 text-center text-sm text-on-surface-variant">
              No stations match “{query.trim()}”.
            </p>
          ) : null}

          {visible.map((station) => {
            const capacity = CAPACITY_STYLES[station.status]
            return (
              <button
                key={station.id}
                type="button"
                onClick={() => openStation(station)}
                className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-4 text-left shadow-[var(--shadow-card)] transition-colors hover:border-primary/30"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-base font-bold text-on-surface">
                      {station.shortName}
                    </span>
                    <p className="mt-1 text-sm text-on-surface-variant">{station.location}</p>
                    <div className="mt-2 flex items-center gap-1 text-[12px] text-on-surface-variant">
                      <Icon name="place" className="text-[16px] text-primary" />
                      {station.distanceM}m away
                    </div>
                  </div>
                  <div
                    className={`flex min-w-[5.5rem] shrink-0 flex-col items-center justify-center rounded-lg border px-3 py-2.5 ${capacity.wrap}`}
                  >
                    <span className="text-2xl leading-none font-extrabold tracking-tight">
                      {station.available}
                      <span className="text-sm font-bold opacity-70">/{station.total}</span>
                    </span>
                    <span className="mt-1 text-[11px] font-bold tracking-wide uppercase">
                      {capacity.label}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[11px] font-bold text-on-surface-variant">
              {matches.length === 0
                ? '0 stations'
                : `${pageStart + 1}–${pageStart + visible.length} of ${matches.length}`}
            </span>
            <div className="flex items-center gap-1">
              <PageButton
                label="Previous page"
                icon="chevron_left"
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
              />
              {Array.from({ length: pageCount }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-current={index === safePage ? 'page' : undefined}
                  onClick={() => setPage(index)}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition-colors ${
                    index === safePage
                      ? 'bg-primary text-on-primary'
                      : 'border border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:border-primary/30'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <PageButton
                label="Next page"
                icon="chevron_right"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function PageButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string
  icon: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface transition-colors hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon name={icon} className="text-[18px]" />
    </button>
  )
}
