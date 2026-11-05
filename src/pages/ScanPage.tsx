import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STATIONS, type Station } from '../data/mockData'
import { AppShell } from '../components/layout/AppShell'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { StatusChip } from '../components/ui/StatusChip'
import { StepIndicator } from '../components/ui/StepIndicator'
import { useRentalStore } from '../store/rentalStore'

const RENT_STEPS = [
  { label: 'Scan QR', detail: 'Step 1 of 3' },
  { label: 'Confirm', detail: 'Details' },
  { label: 'Dispense', detail: 'Unlock Bay' },
]

const RETURN_STEPS = [
  { label: 'Scan QR', detail: 'Step 1 of 3' },
  { label: 'Confirm', detail: 'Return bay' },
  { label: 'Lock', detail: 'Secure Bay' },
]

export function ScanPage() {
  const navigate = useNavigate()
  const scanStep = useRentalStore((s) => s.scanStep)
  const selectedStation = useRentalStore((s) => s.selectedStation)
  const activeRental = useRentalStore((s) => s.activeRental)
  const selectStation = useRentalStore((s) => s.selectStation)
  const setScanStep = useRentalStore((s) => s.setScanStep)
  const resetScan = useRentalStore((s) => s.resetScan)
  const startUnlock = useRentalStore((s) => s.startUnlock)
  const startReturn = useRentalStore((s) => s.startReturn)
  const showToast = useRentalStore((s) => s.showToast)

  const isReturn = !!activeRental
  const steps = isReturn ? RETURN_STEPS : RENT_STEPS

  const [torchOn, setTorchOn] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [flipKey, setFlipKey] = useState(0)

  const openConfirm = (station: Station) => {
    selectStation(station)
    setScanStep(2)
    setConfirmOpen(true)
  }

  const cancelConfirm = () => {
    setConfirmOpen(false)
    setScanStep(1)
  }

  const confirmAction = async () => {
    if (!selectedStation || busy) return
    setBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 1100))
    setBusy(false)
    setConfirmOpen(false)

    if (isReturn) {
      startReturn()
      showToast({
        type: 'success',
        title: 'Return bay ready',
        message: 'Insert umbrella until the latch clicks.',
      })
    } else {
      startUnlock()
      showToast({
        type: 'success',
        title: 'Umbrella unlocked!',
        message: 'Pull umbrella straight out. Timer started.',
      })
    }
    navigate('/dispense')
  }

  return (
    <AppShell
      title="Rentbrella"
      subtitle={isReturn ? 'Return when you are dry' : 'Ready when rain strikes'}
      showBack
      backTo="/"
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3 animate-fade-up">
        <StepIndicator steps={steps} current={scanStep} />

        {isReturn ? (
          <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-secondary-fixed/40 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
              <Icon name="lock" className="text-[22px]" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-on-surface">Active rental · return mode</div>
              <p className="text-[12px] text-on-surface-variant">
                {activeRental.umbrellaId} from {activeRental.station}. Scan any station QR to lock.
              </p>
            </div>
          </div>
        ) : null}

        <div
          key={flipKey}
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-outline-variant/30 bg-inverse-surface shadow-[var(--shadow-card)] transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1427] via-[#1a233a] to-[#0f172a] opacity-95" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,184,253,0.12),transparent_65%)]" />
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(#93ccff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative flex h-48 w-48 items-center justify-center">
            <Corner className="-top-1 -left-1 rounded-tl-lg border-t-4 border-l-4" />
            <Corner className="-top-1 -right-1 rounded-tr-lg border-t-4 border-r-4" />
            <Corner className="-bottom-1 -left-1 rounded-bl-lg border-b-4 border-l-4" />
            <Corner className="-right-1 -bottom-1 rounded-br-lg border-r-4 border-b-4" />
            <div className="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-md bg-white/5 backdrop-blur-[2px]">
              <Icon
                name="qr_code_scanner"
                className="pointer-events-none text-[56px] text-primary-fixed/30"
              />
              <div className="absolute z-10 h-1.5 w-full animate-laser bg-gradient-to-r from-transparent via-secondary-container to-transparent shadow-[0_0_15px_#39b8fd]" />
            </div>
          </div>

          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-secondary-container" />
            {isReturn ? 'Ready to Return' : 'Ready to Scan'}
          </div>

          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Toggle torch"
              onClick={() => setTorchOn((v) => !v)}
              className={`flex h-9 w-9 items-center justify-center rounded-md backdrop-blur-md transition-all active:scale-95 ${
                torchOn
                  ? 'bg-surface-container-lowest text-on-surface'
                  : 'bg-white/20 text-white'
              }`}
            >
              <Icon
                name={torchOn ? 'flashlight_on' : 'flashlight_off'}
                className="text-[18px]"
              />
            </button>
            <button
              type="button"
              aria-label="Flip camera"
              onClick={() => setFlipKey((k) => k + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-md bg-white/20 text-white backdrop-blur-md transition-all active:scale-95"
            >
              <Icon name="flip_camera_ios" className="text-[18px]" />
            </button>
          </div>

          <div className="absolute inset-x-4 bottom-3 rounded-md bg-inverse-surface/80 px-3 py-1.5 text-center text-[12px] font-semibold text-white backdrop-blur-md">
            Hold phone steadily over the code
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
            <Icon name={isReturn ? 'lock' : 'qr_code_scanner'} className="text-[22px]" />
          </div>
          <div className="min-w-0">
            <div className="text-[16px] leading-tight font-bold text-on-surface">
              {isReturn ? 'Hold over station QR to lock' : 'Hold over machine QR code'}
            </div>
            <p className="text-[13px] leading-snug text-on-surface-variant">
              {isReturn
                ? 'Same station tag opens a return bay instead of unlocking a rent dock.'
                : 'The dispenser tag will scan automatically once aligned.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 pt-1">
          <span className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
            Simulate Machine Scan
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openConfirm(STATIONS[0])}
              className="inline-flex items-center gap-1.5 rounded bg-secondary-fixed px-3 py-1.5 text-[12px] font-bold text-on-secondary-fixed-variant transition-colors hover:bg-secondary-fixed-dim"
            >
              <Icon name="qr_code_2" className="text-[16px]" />
              Central Plaza (#104)
            </button>
            <button
              type="button"
              onClick={() => openConfirm(STATIONS[1])}
              className="inline-flex items-center gap-1.5 rounded bg-surface-container-high px-3 py-1.5 text-[12px] font-bold text-on-surface transition-colors hover:bg-surface-variant"
            >
              North Gate (#208)
            </button>
          </div>
        </div>
      </div>

      <Modal open={confirmOpen && !!selectedStation} onClose={cancelConfirm}>
        {selectedStation ? (
          isReturn ? (
            <ReturnConfirmSheet
              station={selectedStation}
              umbrellaId={activeRental.umbrellaId}
              busy={busy}
              onCancel={cancelConfirm}
              onConfirm={confirmAction}
            />
          ) : (
            <RentConfirmSheet
              station={selectedStation}
              unlocking={busy}
              onCancel={cancelConfirm}
              onUnlock={confirmAction}
            />
          )
        ) : null}
      </Modal>

      <button type="button" className="sr-only" onClick={resetScan}>
        Reset scan
      </button>
    </AppShell>
  )
}

function Corner({ className }: { className: string }) {
  return (
    <div
      className={`absolute h-8 w-8 border-secondary-container shadow-[0_0_12px_#39b8fd] ${className}`}
    />
  )
}

function RentConfirmSheet({
  station,
  unlocking,
  onCancel,
  onUnlock,
}: {
  station: Station
  unlocking: boolean
  onCancel: () => void
  onUnlock: () => void
}) {
  const badgeStatus =
    station.status === 'low'
      ? 'low'
      : station.status === 'empty'
        ? 'empty'
        : 'available'

  return (
    <div className="space-y-3">
      <div className="mx-auto -mt-1 h-1 w-10 rounded-full bg-outline-variant" />
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Icon name="umbrella" className="text-[18px] text-primary" />
            <span className="text-[11px] font-bold tracking-wider text-primary uppercase">
              Dispenser Verified
            </span>
          </div>
          <h2 className="text-lg font-bold text-on-surface">{station.name}</h2>
          <div className="flex items-center gap-1 text-[13px] text-on-surface-variant">
            <Icon name="location_on" className="text-[15px] text-primary" />
            <span>{station.location}</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onCancel}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>

      <div className="space-y-2 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-on-surface-variant">
            Inventory Status
          </span>
          <StatusChip
            status={badgeStatus}
            label={
              station.status === 'low'
                ? `Low Stock (${station.available}/${station.total})`
                : `Available (${station.available}/${station.total} umbrellas)`
            }
          />
        </div>
        <p className="text-[12px] text-on-surface-variant">
          An umbrella will unlock at this dispenser when you confirm.
        </p>
      </div>

      <div className="flex items-center justify-between px-1 text-[13px] text-on-surface-variant">
        <span>Standard Rate</span>
        <span className="font-bold text-on-surface">Free first 45 min · then ฿45/hr</span>
      </div>

      <div className="space-y-2 pt-1">
        <button
          type="button"
          disabled={unlocking}
          onClick={onUnlock}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-on-primary shadow-lg transition-transform active:scale-[0.99] disabled:opacity-90"
        >
          {unlocking ? (
            <Icon name="progress_activity" className="animate-spin text-[20px]" />
          ) : (
            <Icon name="lock_open" className="text-[20px]" />
          )}
          {unlocking ? 'Unlocking umbrella...' : 'Get Umbrella Now'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-variant"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function ReturnConfirmSheet({
  station,
  umbrellaId,
  busy,
  onCancel,
  onConfirm,
}: {
  station: Station
  umbrellaId: string
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const openSlots = Math.max(0, station.total - station.available)

  return (
    <div className="space-y-3">
      <div className="mx-auto -mt-1 h-1 w-10 rounded-full bg-outline-variant" />
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Icon name="lock" className="text-[18px] text-primary" />
            <span className="text-[11px] font-bold tracking-wider text-primary uppercase">
              Return Station Verified
            </span>
          </div>
          <h2 className="text-lg font-bold text-on-surface">{station.name}</h2>
          <div className="flex items-center gap-1 text-[13px] text-on-surface-variant">
            <Icon name="location_on" className="text-[15px] text-primary" />
            <span>{station.location}</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onCancel}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>

      <div className="space-y-2 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-on-surface-variant">
            Return bay
          </span>
          <StatusChip
            status={openSlots > 0 ? 'available' : 'empty'}
            label={
              openSlots > 0
                ? `${openSlots} open slot${openSlots === 1 ? '' : 's'}`
                : 'No open slots'
            }
          />
        </div>
        <p className="text-[12px] text-on-surface-variant">
          Dock {umbrellaId} into an open bay. The station QR opens lock mode, not rent.
        </p>
      </div>

      <div className="flex items-center justify-between px-1 text-[13px] text-on-surface-variant">
        <span>Estimated charge</span>
        <span className="font-bold text-on-surface">฿0 · under free window</span>
      </div>

      <div className="space-y-2 pt-1">
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-on-primary shadow-lg transition-transform active:scale-[0.99] disabled:opacity-90"
        >
          {busy ? (
            <Icon name="progress_activity" className="animate-spin text-[20px]" />
          ) : (
            <Icon name="lock" className="text-[20px]" />
          )}
          {busy ? 'Opening return bay...' : 'Lock Umbrella Now'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-variant"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
