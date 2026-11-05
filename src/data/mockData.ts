export type StationStatus = 'available' | 'low' | 'empty' | 'offline'

export type Station = {
  id: string
  name: string
  shortName: string
  location: string
  available: number
  total: number
  /** Fallback straight-line distance when GPS / Directions are unavailable. */
  distanceM: number
  walkSeconds: number
  status: StationStatus
  coords: { lat: number; lng: number }
}

export type PickupRecord = {
  id: string
  station: string
  rentedAt: string
  duration: string
  returnedAt: string
  cost: string
  payment: string
  umbrellaId: string
  status: 'completed' | 'active' | 'dispute'
}

export const PROFILE = {
  name: 'Alex Rivera',
  firstName: 'Alex',
  badge: 'Member Pro',
  wallet: 180,
  promptPayLinked: true,
  avatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA5kGuTwZ9UcPI6V720FtXJiG9_8JLRto4l2NDlo10XrWQEwwYU6S4BtAVjXBKNbenZ7cRbZHkijIypEiGYdPFvsiETChBUZIHiUGs9zTzkMbATroz0WaBe7K1-4uHMet_KbjdDnXy6Whrzk_dDd1bO11HOo_FJDmVmwVCVtQU5jkleYDJLaQuswZuzIOmDlF1E_teZFp3eVvYyl3hYoobtvxGIrBNtB5WvdhDLuA',
}

const NEARBY_STATIONS: Station[] = [
  {
    id: '104',
    name: 'Station Central Plaza - Dispenser #104',
    shortName: 'Central Plaza #04',
    location: 'Next to Exit B Escalator',
    available: 14,
    total: 20,
    distanceM: 20,
    walkSeconds: 30,
    status: 'available',
    coords: { lat: 13.7467, lng: 100.5395 },
  },
  {
    id: '208',
    name: 'Station North Gate - Dispenser #208',
    shortName: 'Metro North',
    location: 'Opposite Ticket Gate 3',
    available: 8,
    total: 20,
    distanceM: 180,
    walkSeconds: 150,
    status: 'available',
    coords: { lat: 13.8026, lng: 100.5539 },
  },
  {
    id: '301',
    name: 'Library Square - Dispenser #301',
    shortName: 'Library Sq',
    location: 'Main plaza entrance',
    available: 3,
    total: 16,
    distanceM: 320,
    walkSeconds: 240,
    status: 'low',
    coords: { lat: 13.7382, lng: 100.5301 },
  },
]

export const STATIONS = NEARBY_STATIONS

const MORE_STATIONS: Station[] = [
  {
    id: '412',
    name: 'Siam Paragon - Dispenser #412',
    shortName: 'Siam Paragon',
    location: 'Exit 3, BTS walkway',
    available: 11,
    total: 18,
    distanceM: 95,
    walkSeconds: 80,
    status: 'available',
    coords: { lat: 13.746, lng: 100.5347 },
  },
  {
    id: '515',
    name: 'Asok Hub - Dispenser #515',
    shortName: 'Asok Hub',
    location: 'Interchange mezzanine',
    available: 0,
    total: 16,
    distanceM: 140,
    walkSeconds: 110,
    status: 'empty',
    coords: { lat: 13.737, lng: 100.5604 },
  },
  {
    id: '620',
    name: 'Thong Lo Skybridge - Dispenser #620',
    shortName: 'Thong Lo',
    location: 'Skybridge north end',
    available: 6,
    total: 12,
    distanceM: 210,
    walkSeconds: 170,
    status: 'available',
    coords: { lat: 13.7244, lng: 100.5782 },
  },
  {
    id: '733',
    name: 'Ekkamai Gate - Dispenser #733',
    shortName: 'Ekkamai',
    location: 'Gate 2, street level',
    available: 2,
    total: 14,
    distanceM: 260,
    walkSeconds: 200,
    status: 'low',
    coords: { lat: 13.7195, lng: 100.5851 },
  },
  {
    id: '844',
    name: 'Chidlom Plaza - Dispenser #844',
    shortName: 'Chidlom',
    location: 'Department store lobby',
    available: 9,
    total: 16,
    distanceM: 310,
    walkSeconds: 230,
    status: 'available',
    coords: { lat: 13.744, lng: 100.5431 },
  },
  {
    id: '901',
    name: 'Victory Monument - Dispenser #901',
    shortName: 'Victory Mon.',
    location: 'Bus terminal shelter',
    available: 0,
    total: 20,
    distanceM: 360,
    walkSeconds: 280,
    status: 'offline',
    coords: { lat: 13.7627, lng: 100.5372 },
  },
  {
    id: '118',
    name: 'Phrom Phong - Dispenser #118',
    shortName: 'Phrom Phong',
    location: 'Exit 1, EmQuartier link',
    available: 5,
    total: 12,
    distanceM: 410,
    walkSeconds: 320,
    status: 'available',
    coords: { lat: 13.7305, lng: 100.5696 },
  },
  {
    id: '226',
    name: 'Sala Daeng - Dispenser #226',
    shortName: 'Sala Daeng',
    location: 'Silom Road corner',
    available: 1,
    total: 10,
    distanceM: 455,
    walkSeconds: 360,
    status: 'low',
    coords: { lat: 13.7285, lng: 100.5344 },
  },
  {
    id: '337',
    name: 'Ari Station - Dispenser #337',
    shortName: 'Ari',
    location: 'Exit 2, market lane',
    available: 7,
    total: 12,
    distanceM: 490,
    walkSeconds: 400,
    status: 'available',
    coords: { lat: 13.7796, lng: 100.5446 },
  },
]

export const STATION_DIRECTORY: Station[] = [...NEARBY_STATIONS, ...MORE_STATIONS]

export const ACTIVE_RENTAL = {
  station: 'Central Plaza #04',
  rentedAt: 'Rented Today, 14:15',
  ago: '42 mins ago',
  umbrellaId: '#UB-8821',
}

export const PICKUPS: PickupRecord[] = [
  {
    id: 'p1',
    station: 'Metro North Station #02',
    rentedAt: 'Yesterday, 17:30',
    duration: '1h 20m',
    returnedAt: 'Library Square #01',
    cost: '฿45',
    payment: 'PromptPay',
    umbrellaId: '#UB-4091',
    status: 'completed',
  },
  {
    id: 'p2',
    station: 'Central Plaza #04',
    rentedAt: 'Oct 24, 09:10',
    duration: '35m',
    returnedAt: 'Central Plaza #04',
    cost: '฿0 (Free <45m)',
    payment: 'Free Tier',
    umbrellaId: '#UB-5520',
    status: 'completed',
  },
  {
    id: 'p3',
    station: 'Siam Paragon Exit 3',
    rentedAt: 'Oct 22, 18:45',
    duration: '2h 15m',
    returnedAt: 'Asok Station Hub',
    cost: '฿90',
    payment: 'Credit Card ••88',
    umbrellaId: '#UB-9912',
    status: 'completed',
  },
  {
    id: 'p4',
    station: 'Thong Lo Skybridge #01',
    rentedAt: 'Oct 20, 13:10',
    duration: '52m',
    returnedAt: 'Ekkamai Gate 2',
    cost: '฿45',
    payment: 'TrueMoney',
    umbrellaId: '#UB-4190',
    status: 'completed',
  },
]

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Scan',
    body: 'Point camera at the station QR code.',
  },
  {
    step: 2,
    title: 'Confirm',
    body: 'Verify station ID and tap unlock on your screen.',
  },
  {
    step: 3,
    title: 'Dispense',
    body: 'Umbrella releases instantly; grab and stay dry!',
  },
]
