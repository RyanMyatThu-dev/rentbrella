import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PICKUPS, PROFILE } from '../data/mockData'
import { AppShell } from '../components/layout/AppShell'
import { Icon } from '../components/ui/Icon'
import { StatusChip } from '../components/ui/StatusChip'
import { useRentalStore } from '../store/rentalStore'

type Filter = 'all' | 'completed'

function formatAgo(startedAt: number) {
  const mins = Math.max(1, Math.round((Date.now() - startedAt) / 60000))
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`
  const hours = Math.round(mins / 60)
  return `${hours}h ago`
}

export function HistoryPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const activeRental = useRentalStore((s) => s.activeRental)

  const filtered = useMemo(() => {
    if (filter === 'completed') return PICKUPS.filter((p) => p.status === 'completed')
    return PICKUPS
  }, [filter])

  return (
    <AppShell title="Pickup History" subtitle="Bangkok">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2.5 animate-fade-up">
        <section className="rounded border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2.5">
            <img
              src={PROFILE.avatar}
              alt=""
              className="h-10 w-10 rounded-full object-cover ring-2 ring-surface-container"
            />
            <div className="min-w-0">
              <h1 className="text-base font-extrabold text-on-surface">{PROFILE.name}</h1>
              <p className="text-sm text-on-surface-variant">Bangkok Metro</p>
            </div>
          </div>
        </section>

        {activeRental ? (
          <section className="rounded border border-success/20 bg-success-soft/60 p-3 shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-[11px] font-bold tracking-wider text-success uppercase">
                  Active Rental in Progress
                </span>
              </div>
              <span className="inline-flex h-7 items-center gap-1 rounded bg-surface-container-high px-2.5 text-[11px] font-bold text-on-surface">
                <Icon name="umbrella" className="text-[14px]" />
                {activeRental.umbrellaId}
              </span>
            </div>
            <div className="mt-2 flex items-start gap-2">
              <Icon name="storefront" className="mt-0.5 text-[18px] text-primary" />
              <div className="min-w-0">
                <div className="text-base font-bold text-on-surface">{activeRental.station}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="schedule" className="text-[15px]" />
                    {activeRental.rentedAt}
                  </span>
                  <span className="font-semibold text-primary">
                    ({formatAgo(activeRental.startedAt)})
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              <Link
                to="/scan"
                className="flex h-11 w-full items-center justify-center gap-2 rounded bg-primary text-sm font-bold text-on-primary shadow-md hover:bg-primary-container"
              >
                <Icon name="qr_code_scanner" className="text-[18px]" />
                Scan to lock
              </Link>
              <Link
                to="/stations"
                className="flex h-11 w-full items-center justify-center gap-2 rounded bg-surface-container-lowest text-sm font-bold text-on-surface shadow-sm hover:bg-surface-container-high"
              >
                <Icon name="near_me" className="text-[18px]" />
                Find Return Station
              </Link>
            </div>
          </section>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['all', 'All Pickups', '16'],
              ['completed', 'Completed', '14'],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[12px] font-bold transition-colors ${
                filter === key
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
              }`}
            >
              {label}
              <span className="opacity-80">{count}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
            Past Pickups & Receipts
          </h2>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-on-surface-variant">
            <Icon name="sort" className="text-[14px]" />
            Most Recent
          </span>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {filtered.map((pickup) => (
            <article
              key={pickup.id}
              className="rounded border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-on-surface">{pickup.station}</h3>
                  <div className="mt-0.5 flex items-center gap-1 text-[12px] text-on-surface-variant">
                    <Icon name="schedule" className="text-[14px]" />
                    {pickup.rentedAt} · Duration: {pickup.duration}
                  </div>
                </div>
                <StatusChip label="Completed" status="success" icon="check_circle" />
              </div>
              <div className="mt-2 rounded bg-surface-container-low p-2.5">
                <div className="flex items-center gap-1 text-[12px] text-on-surface-variant">
                  <Icon name="arrow_forward" className="text-[14px]" />
                  Returned at
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <div className="min-w-0 truncate text-sm font-semibold text-on-surface">
                    {pickup.returnedAt}
                  </div>
                  <div className="text-sm font-extrabold text-on-surface">{pickup.cost}</div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-surface-container-high px-1.5 py-0.5 text-[11px] font-bold text-on-surface-variant">
                  <Icon name="umbrella" className="text-[12px]" />
                  {pickup.umbrellaId}
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-primary"
                >
                  <Icon name="receipt_long" className="text-[16px]" />
                  View Receipt
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="flex items-center justify-between rounded bg-surface-container-low px-2.5 py-1.5 text-[12px] text-on-surface-variant">
          <span className="inline-flex items-center gap-1 font-semibold">
            <Icon name="list_alt" className="text-[16px]" />
            Showing 1–4 of 16 pickups
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((page) => (
              <span
                key={page}
                className={`flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold ${
                  page === 1
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest text-on-surface'
                }`}
              >
                {page}
              </span>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
