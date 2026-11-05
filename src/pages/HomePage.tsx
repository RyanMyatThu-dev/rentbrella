import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HOW_IT_WORKS, STATIONS } from '../data/mockData'
import { WeatherCard } from '../components/home/WeatherCard'
import { AppShell } from '../components/layout/AppShell'
import { StationMap } from '../components/stations/StationMap'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { StatusChip } from '../components/ui/StatusChip'
import { useRentalStore } from '../store/rentalStore'

export function HomePage() {
  const navigate = useNavigate()
  const wallet = useRentalStore((s) => s.wallet)
  const activeRental = useRentalStore((s) => s.activeRental)
  const selectStation = useRentalStore((s) => s.selectStation)
  const [guideOpen, setGuideOpen] = useState(false)
  const nearest = STATIONS[0]
  const isReturning = !!activeRental

  return (
    <AppShell title="Rentbrella">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:items-start md:gap-6 lg:gap-8">
        <section className="flex flex-col gap-3 animate-fade-up">
          <WalletCard balance={wallet} />
          <WeatherCard />

          <Link
            to="/scan"
            className="flex w-full items-center justify-between gap-3 rounded-xl bg-primary p-4 text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.98]"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-primary shadow-sm">
                <Icon name="qr_code_scanner" className="text-[28px]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg leading-6 font-bold">
                  {isReturning ? 'Scan to lock umbrella' : 'Scan to get umbrella'}
                </span>
                <span className="text-[11px] font-semibold text-primary-fixed">
                  {isReturning
                    ? `Return ${activeRental.umbrellaId} at any station QR`
                    : 'Point camera at station QR code'}
                </span>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded bg-white/15 px-2.5 py-1 text-[11px] font-bold">
              <Icon name={isReturning ? 'lock' : 'lock_open'} className="text-[14px]" />
              {isReturning ? 'Lock' : 'Unlock'}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => {
              selectStation(nearest)
              navigate('/scan')
            }}
            className="flex w-full items-center justify-between rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3 text-left shadow-sm transition-colors hover:border-primary/30"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary-fixed/50 text-secondary">
                <Icon name="umbrella" className="text-[20px]" />
              </div>
              <div className="min-w-0">
                <span className="truncate text-sm font-bold text-on-surface">
                  Station Central
                </span>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-on-surface-variant">
                  <Icon name="place" className="text-[14px] text-primary" />
                  <span>{nearest.distanceM}m away</span>
                </div>
              </div>
            </div>
            <StatusChip
              label={`${nearest.available} Ready`}
              status="available"
              className="rounded-md"
            />
          </button>

          <div className="flex items-center justify-between px-0.5 md:hidden">
            <div className="flex items-center gap-1.5">
              <Icon name="near_me" className="text-[18px] text-primary" />
              <h2 className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                Nearby Stations & Availability
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="inline-flex items-center gap-1 rounded bg-surface-container-high px-2 py-0.5 text-[11px] font-bold text-primary transition-colors hover:bg-surface-variant"
            >
              <Icon name="help" className="text-[14px]" />
              How it works
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-3 animate-fade-up md:sticky md:top-20">
          <div className="hidden items-center justify-between px-0.5 md:flex">
            <div className="flex items-center gap-1.5">
              <Icon name="near_me" className="text-[18px] text-primary" />
              <h2 className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                Nearby Stations & Availability
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="inline-flex items-center gap-1 rounded bg-surface-container-high px-2 py-0.5 text-[11px] font-bold text-primary transition-colors hover:bg-surface-variant"
            >
              <Icon name="help" className="text-[14px]" />
              How it works
            </button>
          </div>

          <StationMap
            stations={STATIONS}
            onSelect={(station) => {
              selectStation(station)
              navigate('/scan')
            }}
          />
        </section>
      </div>

      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} labelledBy="guide-title">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
          <div className="flex items-center gap-2">
            <Icon name="help_center" className="text-[22px] text-primary" />
            <h2 id="guide-title" className="text-lg font-bold text-on-surface">
              How Rentbrella Works
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setGuideOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-2.5"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-on-primary">
                {item.step}
              </div>
              <div>
                <div className="text-sm font-bold text-on-surface">
                  {item.step}. {item.title}
                </div>
                <p className="text-[13px] text-on-surface-variant">{item.body}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 rounded-xl bg-surface-container-high p-2.5 text-[12px] text-on-surface-variant">
            <Icon name="schedule" className="shrink-0 text-[18px] text-secondary" />
            <span>
              <strong>20-min Free Grace Period:</strong> Return at any nearby hub within 20
              mins free of charge.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setGuideOpen(false)}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-on-primary hover:bg-primary-container"
          >
            Got it
          </button>
        </div>
      </Modal>
    </AppShell>
  )
}

function WalletCard({ balance }: { balance: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon name="account_balance_wallet" className="text-[22px]" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
            Wallet
          </span>
          <div className="mt-0.5 text-lg leading-tight font-extrabold whitespace-nowrap text-on-surface">
            ฿{balance.toFixed(2)}
          </div>
        </div>
      </div>
      <TopUpButton />
    </div>
  )
}

function TopUpButton() {
  const setWallet = useRentalStore((s) => s.setWallet)
  const wallet = useRentalStore((s) => s.wallet)
  const showToast = useRentalStore((s) => s.showToast)

  return (
    <button
      type="button"
      onClick={() => {
        setWallet(wallet + 100)
        showToast({
          type: 'success',
          title: 'Wallet topped up',
          message: '฿100 added via PromptPay.',
        })
      }}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-on-primary shadow-sm transition-colors hover:bg-primary-container active:scale-95"
    >
      <Icon name="add" className="text-[16px]" />
      Top Up
    </button>
  )
}
