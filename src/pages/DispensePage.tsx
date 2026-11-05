import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Icon } from '../components/ui/Icon'
import { StatusChip } from '../components/ui/StatusChip'
import { useRentalStore, type ErrorKind } from '../store/rentalStore'

const ERRORS: Record<
  ErrorKind,
  {
    category: string
    title: string
    desc: string
    icon: string
    ctaLabel: string
    ctaIcon: string
    diagTitle: string
    diagDesc: string
  }
> = {
  empty: {
    category: 'Machine Empty',
    title: 'This machine is out of umbrellas.',
    desc: 'All umbrellas at Station Central Plaza have been rented during the morning downpour.',
    icon: 'remove_shopping_cart',
    ctaLabel: 'Find another machine',
    ctaIcon: 'map',
    diagTitle: 'Nearest Available Hub',
    diagDesc: 'Metro Exit B (120m away · 9 available)',
  },
  offline: {
    category: 'Station Offline',
    title: "This machine isn't available right now.",
    desc: 'The dispenser telemetry unit lost connection to the metro power grid.',
    icon: 'cloud_off',
    ctaLabel: 'Try again',
    ctaIcon: 'refresh',
    diagTitle: 'System Status',
    diagDesc: 'Auto-reconnecting to 5G gateway...',
  },
  timeout: {
    category: 'Release Timeout',
    title: 'That took too long. No umbrella was released.',
    desc: 'The dispenser latch did not open within the safety window. Your card was not charged.',
    icon: 'timer_off',
    ctaLabel: 'Try again',
    ctaIcon: 'replay',
    diagTitle: 'Transaction Status',
    diagDesc: 'Hold reversed · ฿0.00 billed',
  },
  invalid_qr: {
    category: 'Invalid QR Code',
    title: "We couldn't read that code.",
    desc: 'The scanned QR token is expired, smudged, or does not match this dispenser.',
    icon: 'qr_code_scanner',
    ctaLabel: 'Scan again',
    ctaIcon: 'qr_code_scanner',
    diagTitle: 'Troubleshooting Tip',
    diagDesc: 'Ensure lens is wipe-dried from rain mist',
  },
  cam_denied: {
    category: 'Camera Access Required',
    title: 'Allow camera access to scan the code.',
    desc: 'Rentbrella requires temporary camera permission to verify the dispenser QR code.',
    icon: 'no_photography',
    ctaLabel: 'Open settings or enter code manually',
    ctaIcon: 'settings',
    diagTitle: 'Alternate Method',
    diagDesc: 'Station code can be entered manually',
  },
}

export function DispensePage() {
  const navigate = useNavigate()
  const view = useRentalStore((s) => s.dispenseView)
  const sessionKind = useRentalStore((s) => s.sessionKind)
  const errorKind = useRentalStore((s) => s.errorKind)
  const selectedStation = useRentalStore((s) => s.selectedStation)
  const setDispenseView = useRentalStore((s) => s.setDispenseView)
  const setSessionKind = useRentalStore((s) => s.setSessionKind)
  const setErrorKind = useRentalStore((s) => s.setErrorKind)
  const completeUnlock = useRentalStore((s) => s.completeUnlock)
  const completeReturn = useRentalStore((s) => s.completeReturn)
  const [demoOpen, setDemoOpen] = useState(false)

  const isReturn = sessionKind === 'return'

  useEffect(() => {
    if (view !== 'dispensing') return
    const id = window.setTimeout(
      () => (isReturn ? completeReturn() : completeUnlock()),
      2200,
    )
    return () => window.clearTimeout(id)
  }, [view, isReturn, completeUnlock, completeReturn])

  const stationLabel = selectedStation?.shortName ?? 'Station Central Plaza'
  const error = ERRORS[errorKind]

  return (
    <AppShell
      title={isReturn ? 'Bay Lock Session' : 'Bay Unlock Session'}
      subtitle="Rentbrella Dispenser"
      showBack
      backTo="/scan"
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 animate-fade-up">
        <button
          type="button"
          onClick={() => setDemoOpen((v) => !v)}
          className="self-start rounded bg-surface-container-high px-3 py-1 text-[11px] font-bold text-primary"
        >
          {demoOpen ? 'Hide demo controls' : 'Show demo controls'}
        </button>

        {demoOpen ? (
          <div className="rounded-xl bg-surface-container-high p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Icon name="tune" className="text-[16px]" />
                Presentation State
              </span>
              <span className="rounded-full bg-surface-container-lowest px-2 py-0.5 text-[11px] text-on-surface-variant">
                Live Simulation
              </span>
            </div>
            <div className="mb-2 grid grid-cols-2 gap-1.5 rounded-lg bg-surface-container-lowest p-1">
              {(
                [
                  ['rent', 'Rent'],
                  ['return', 'Return'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSessionKind(key)}
                  className={`rounded-md px-2 py-1.5 text-center text-xs font-semibold transition-all ${
                    sessionKind === key
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-surface-container-lowest p-1">
              {(
                [
                  ['dispensing', isReturn ? '1. Locking' : '1. Dispensing'],
                  ['success', '2. Success'],
                  ['error', '3. Error'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === 'success') {
                      if (isReturn) completeReturn()
                      else completeUnlock()
                      return
                    }
                    setDispenseView(key)
                  }}
                  className={`rounded-md px-2 py-1.5 text-center text-xs font-semibold transition-all ${
                    view === key
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {view === 'error' ? (
              <div className="mt-2 flex flex-wrap gap-1 border-t border-outline-variant/30 pt-2">
                {(Object.keys(ERRORS) as ErrorKind[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setErrorKind(key)}
                    className={`rounded px-2 py-1 text-[11px] ${
                      errorKind === key
                        ? 'bg-secondary-container font-bold text-on-secondary-container'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {ERRORS[key].category}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-between rounded-full bg-surface-container-lowest px-4 py-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-secondary-fixed text-[12px] font-bold text-on-secondary-fixed">
              <Icon name="check" className="text-[13px]" />
            </span>
            <span className="text-[11px] font-medium text-on-surface-variant">
              Scan & Confirm
            </span>
          </div>
          <div className="mx-3 h-0.5 flex-1 bg-secondary-fixed" />
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-bold shadow-sm ${
                view === 'error'
                  ? 'bg-error text-on-error'
                  : view === 'success'
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'bg-primary text-on-primary'
              }`}
            >
              {view === 'success' ? (
                <Icon name="check" className="text-[14px]" />
              ) : view === 'error' ? (
                '!'
              ) : (
                '3'
              )}
            </span>
            <span className="text-xs font-bold text-primary">
              {view === 'success'
                ? 'Complete'
                : view === 'error'
                  ? 'Exception'
                  : isReturn
                    ? 'Ready to Lock'
                    : 'Ready to Take'}
            </span>
          </div>
        </div>

        {view === 'dispensing' ? (
          <section className="flex flex-col gap-4">
            <div className="flex justify-center pt-2">
              <div className="inline-flex items-center gap-2.5 rounded bg-secondary-fixed/50 px-4 py-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-secondary" />
                <span className="text-xs font-semibold tracking-wide text-on-secondary-fixed">
                  {stationLabel}
                </span>
              </div>
            </div>
            <div className="relative flex flex-col items-center overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 text-center shadow-sm">
              <div className="relative my-2 mb-4 flex h-44 w-44 items-center justify-center">
                <div
                  className="absolute inset-0 animate-spin rounded-full border-4 border-secondary-fixed-dim/40"
                  style={{ animationDuration: '12s' }}
                />
                <div
                  className="absolute inset-3 animate-pulse rounded bg-secondary-fixed/20"
                  style={{ animationDuration: '3s' }}
                />
                <div className="relative z-10 flex h-32 w-32 flex-col items-center justify-center rounded-full border-2 border-secondary-fixed bg-surface-container-lowest shadow-md">
                  <Icon name="umbrella" className="animate-bounce text-[54px] text-primary" />
                  <div className="mt-1 flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[12px] font-bold text-on-primary shadow-sm">
                    <Icon name="sync" className="animate-spin text-[13px]" />
                    {isReturn ? 'Locking' : 'Readying'}
                  </div>
                </div>
              </div>
              <div className="mb-3 inline-flex items-center gap-2 rounded bg-secondary-fixed/40 px-4 py-1.5">
                <Icon
                  name={isReturn ? 'lock' : 'lock_open'}
                  className="text-[18px] text-primary"
                />
                <span className="text-xs font-semibold text-on-surface">
                  {isReturn
                    ? 'Securing the return bay now'
                    : 'Releasing your umbrella now'}
                </span>
              </div>
              <h1 className="mb-2 text-2xl font-extrabold text-on-surface sm:text-[28px]">
                {isReturn ? 'Locking your umbrella...' : 'Releasing your umbrella...'}
              </h1>
              <p className="max-w-xs text-base font-medium text-on-surface-variant">
                {isReturn
                  ? 'Insert the umbrella into an open bay, then wait for the latch to close.'
                  : 'Please take your umbrella from the dispenser right below this screen.'}
              </p>
              <div className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm">
                  <Icon
                    name={isReturn ? 'arrow_upward' : 'arrow_downward'}
                    className="text-[22px]"
                  />
                </div>
                <span className="text-lg font-bold text-on-surface">
                  {isReturn
                    ? 'Push until you feel the dock click'
                    : 'Look for the lit release indicator'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => (isReturn ? completeReturn() : completeUnlock())}
              className="flex h-16 w-full items-center justify-center gap-3 rounded-xl bg-primary text-lg font-bold text-on-primary shadow-md hover:bg-primary-container active:scale-[0.99]"
            >
              <Icon name="check_circle" className="text-[28px]" />
              {isReturn ? 'I Have Returned My Umbrella' : 'I Have Taken My Umbrella'}
            </button>
          </section>
        ) : null}

        {view === 'success' && !isReturn ? (
          <section className="flex flex-col gap-4">
            <div className="relative flex flex-col items-center overflow-hidden rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm">
              <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
                <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15%" cy="18%" fill="#a36700" r="4" />
                  <circle cx="82%" cy="22%" fill="#39b8fd" r="5" />
                  <circle cx="75%" cy="85%" fill="#006591" r="3.5" />
                </svg>
              </div>
              <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded bg-secondary-fixed shadow-md">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-inner">
                  <Icon name="check_circle" className="text-[36px]" filled />
                </div>
                <div className="absolute -right-1 -bottom-1 flex h-9 w-9 items-center justify-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed shadow-md">
                  <Icon name="umbrella" className="text-[20px]" filled />
                </div>
              </div>
              <StatusChip
                label="Dispensed successfully"
                status="info"
                className="mb-3 rounded-full bg-surface-container-low"
              />
              <h1 className="mb-2 text-2xl font-extrabold text-on-surface">
                Take your umbrella from the dispenser
              </h1>
              <p className="mb-4 max-w-xs text-sm text-on-surface-variant">
                The motorized safety latch has released. Pull umbrella gently to retrieve.
              </p>
              <div className="flex w-full items-center gap-4 rounded-xl bg-surface-container-low p-4 text-left">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest text-primary">
                  <Icon name="arrow_downward" className="text-[28px]" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-on-surface">Release Verified</div>
                  <div className="truncate text-sm text-on-surface-variant">
                    The release indicator is blinking green
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-surface-container p-4 shadow-sm">
              <Icon name="verified_user" className="mt-0.5 shrink-0 text-[22px] text-primary" />
              <div>
                <div className="text-sm font-semibold text-on-surface">
                  Dry commuter guarantee
                </div>
                <p className="text-sm text-on-surface-variant">
                  Return within 15 minutes at any station across the metro network for a
                  complimentary zero-charge checkout.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => navigate('/scan')}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-on-primary shadow-md hover:bg-primary-container active:scale-[0.99]"
              >
                <Icon name="qr_code_scanner" className="text-[20px]" />
                Scan to lock umbrella
                <Icon name="lock" className="text-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface-container-lowest text-sm font-semibold text-on-surface shadow-sm hover:bg-surface-container-high"
              >
                Done (Return to Home)
              </button>
              <Link
                to="/history"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface-container-lowest text-sm font-semibold text-on-surface shadow-sm hover:bg-surface-container-high"
              >
                <Icon name="receipt_long" className="text-[18px]" />
                View in History
              </Link>
            </div>
          </section>
        ) : null}

        {view === 'success' && isReturn ? (
          <section className="flex flex-col gap-4">
            <div className="relative flex flex-col items-center overflow-hidden rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm">
              <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded bg-secondary-fixed shadow-md">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-inner">
                  <Icon name="lock" className="text-[36px]" filled />
                </div>
                <div className="absolute -right-1 -bottom-1 flex h-9 w-9 items-center justify-center rounded-full bg-success text-on-primary shadow-md">
                  <Icon name="check" className="text-[20px]" filled />
                </div>
              </div>
              <StatusChip
                label="Returned successfully"
                status="success"
                className="mb-3 rounded-full bg-success-soft"
              />
              <h1 className="mb-2 text-2xl font-extrabold text-on-surface">
                Umbrella locked in the bay
              </h1>
              <p className="mb-4 max-w-xs text-sm text-on-surface-variant">
                The return latch closed. Your rental is complete and the timer has stopped.
              </p>
              <div className="flex w-full items-center gap-4 rounded-xl bg-surface-container-low p-4 text-left">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest text-primary">
                  <Icon name="payments" className="text-[28px]" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-on-surface">Checkout complete</div>
                  <div className="truncate text-sm text-on-surface-variant">
                    ฿0 charged · free under 45 minutes
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-on-primary shadow-md hover:bg-primary-container active:scale-[0.99]"
              >
                Done (Return to Home)
                <Icon name="arrow_forward" className="text-[20px]" />
              </button>
              <Link
                to="/history"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface-container-lowest text-sm font-semibold text-on-surface shadow-sm hover:bg-surface-container-high"
              >
                <Icon name="receipt_long" className="text-[18px]" />
                View in History
              </Link>
            </div>
          </section>
        ) : null}

        {view === 'error' ? (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col items-center rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-error-container p-4 text-on-error-container shadow-sm">
                <Icon name={error.icon} className="text-[42px]" />
              </div>
              <StatusChip label={error.category} status="empty" className="mb-3" />
              <h2 className="mb-2 text-2xl font-extrabold text-on-surface">{error.title}</h2>
              <p className="mb-4 max-w-xs text-sm text-on-surface-variant">{error.desc}</p>
              <div className="flex w-full items-center justify-between rounded-xl bg-surface-container-low p-4 text-left">
                <div className="flex items-center gap-2">
                  <Icon name="near_me" className="text-[22px] text-secondary" />
                  <div>
                    <div className="text-xs font-semibold text-on-surface">{error.diagTitle}</div>
                    <div className="text-sm text-on-surface-variant">{error.diagDesc}</div>
                  </div>
                </div>
                <Icon name="chevron_right" className="text-[18px] text-on-surface-variant" />
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate(
                  errorKind === 'invalid_qr' || errorKind === 'cam_denied'
                    ? '/scan'
                    : '/stations',
                )
              }
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-on-primary shadow-md"
            >
              <Icon name={error.ctaIcon} className="text-[20px]" />
              {error.ctaLabel}
            </button>
            <button
              type="button"
              onClick={() => setDispenseView('dispensing')}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface-container-lowest text-sm font-semibold shadow-sm"
            >
              <Icon name="refresh" className="text-[18px]" />
              Re-test {isReturn ? 'Locking' : 'Dispensing'} Flow
            </button>
            <div className="flex items-center justify-center gap-2 pt-1 text-on-surface-variant">
              <Icon name="support_agent" className="text-[16px]" />
              <span className="text-xs">Need immediate help? Station ID #CP-104</span>
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  )
}
