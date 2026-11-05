import { create } from 'zustand'
import { STATION_DIRECTORY, type Station } from '../data/mockData'

export type DispenseView = 'dispensing' | 'success' | 'error'
export type SessionKind = 'rent' | 'return'
export type ErrorKind =
  | 'empty'
  | 'offline'
  | 'timeout'
  | 'invalid_qr'
  | 'cam_denied'

export type ActiveRental = {
  stationId: string
  station: string
  umbrellaId: string
  rentedAt: string
  startedAt: number
}

type RentalState = {
  wallet: number
  selectedStation: Station | null
  activeRental: ActiveRental | null
  sessionKind: SessionKind
  scanStep: 1 | 2 | 3
  dispenseView: DispenseView
  errorKind: ErrorKind
  toast: { type: 'success' | 'warning' | 'error'; title: string; message: string } | null
  setWallet: (value: number) => void
  selectStation: (station: Station | null) => void
  setScanStep: (step: 1 | 2 | 3) => void
  resetScan: () => void
  startUnlock: () => void
  completeUnlock: () => void
  startReturn: () => void
  completeReturn: () => void
  setDispenseView: (view: DispenseView) => void
  setSessionKind: (kind: SessionKind) => void
  setErrorKind: (kind: ErrorKind) => void
  showToast: (toast: RentalState['toast']) => void
  clearToast: () => void
  findStationById: (id: string) => Station | undefined
}

function makeActiveRental(station: Station | null): ActiveRental {
  const now = new Date()
  const rentedAt = `Rented Today, ${now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`
  return {
    stationId: station?.id ?? '104',
    station: station?.shortName ?? 'Central Plaza #04',
    umbrellaId: `#UB-${String(8800 + Math.floor(Math.random() * 100)).padStart(4, '0')}`,
    rentedAt,
    startedAt: Date.now(),
  }
}

export const useRentalStore = create<RentalState>((set, get) => ({
  wallet: 180,
  selectedStation: null,
  activeRental: null,
  sessionKind: 'rent',
  scanStep: 1,
  dispenseView: 'success',
  errorKind: 'empty',
  toast: null,
  setWallet: (wallet) => set({ wallet }),
  selectStation: (selectedStation) => set({ selectedStation }),
  setScanStep: (scanStep) => set({ scanStep }),
  resetScan: () => set({ scanStep: 1, selectedStation: null }),
  startUnlock: () =>
    set({
      sessionKind: 'rent',
      dispenseView: 'dispensing',
      scanStep: 3,
    }),
  completeUnlock: () =>
    set({
      sessionKind: 'rent',
      dispenseView: 'success',
      scanStep: 3,
      activeRental: makeActiveRental(get().selectedStation),
    }),
  startReturn: () =>
    set({
      sessionKind: 'return',
      dispenseView: 'dispensing',
      scanStep: 3,
    }),
  completeReturn: () =>
    set({
      sessionKind: 'return',
      dispenseView: 'success',
      scanStep: 3,
      activeRental: null,
      selectedStation: null,
    }),
  setDispenseView: (dispenseView) => set({ dispenseView }),
  setSessionKind: (sessionKind) => set({ sessionKind }),
  setErrorKind: (errorKind) => set({ errorKind, dispenseView: 'error' }),
  showToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
  findStationById: (id) =>
    STATION_DIRECTORY.find((station) => station.id === id) ??
    get().selectedStation ??
    undefined,
}))
