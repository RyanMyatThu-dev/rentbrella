import { BANGKOK_CENTER, type LatLng } from './geo'

export type WeatherSnapshot = {
  place: string
  temperatureC: number
  condition: string
  icon: string
  rainNow: boolean
  rainChanceNow: number
  recommendation: string
  hours: HourForecast[]
}

export type HourForecast = {
  timeLabel: string
  temperatureC: number
  rainChance: number
  icon: string
}

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number
    weather_code?: number
    precipitation?: number
    is_day?: number
  }
  hourly?: {
    time?: string[]
    precipitation_probability?: Array<number | null>
    temperature_2m?: Array<number | null>
    weather_code?: Array<number | null>
  }
}

const RAIN_THRESHOLD = 50
const HOUR_COUNT = 6

function parseBangkokTime(stamp: string): Date {
  const hasZone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(stamp)
  return new Date(hasZone ? stamp : `${stamp}+07:00`)
}

export function describeWeather(code: number, isDay: boolean): { icon: string; label: string } {
  if (code === 0) {
    return isDay
      ? { icon: 'wb_sunny', label: 'Clear' }
      : { icon: 'bedtime', label: 'Clear' }
  }
  if (code === 1 || code === 2) {
    return isDay
      ? { icon: 'partly_cloudy_day', label: 'Partly cloudy' }
      : { icon: 'partly_cloudy_night', label: 'Partly cloudy' }
  }
  if (code === 3) return { icon: 'cloud', label: 'Overcast' }
  if (code === 45 || code === 48) return { icon: 'foggy', label: 'Fog' }
  if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67)) {
    return { icon: 'rainy', label: 'Rain' }
  }
  if (code >= 71 && code <= 77) return { icon: 'ac_unit', label: 'Snow' }
  if (code >= 80 && code <= 82) return { icon: 'rainy', label: 'Showers' }
  if (code === 85 || code === 86) return { icon: 'weather_snowy', label: 'Snow showers' }
  if (code >= 95) return { icon: 'thunderstorm', label: 'Thunderstorm' }
  return { icon: 'cloud', label: 'Cloudy' }
}

export function isRainingCode(code: number): boolean {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95
}

export function umbrellaRecommendation(rainNow: boolean, upcomingRain: number[]): string {
  const likely = rainNow || upcomingRain.some((chance) => chance >= RAIN_THRESHOLD)
  return likely ? 'Rain likely — grab an umbrella' : 'Looking dry for the next few hours'
}

export async function resolveWeatherLocation(): Promise<{ coords: LatLng; place: string }> {
  if (!navigator.geolocation) {
    return { coords: BANGKOK_CENTER, place: 'Bangkok' }
  }

  const coords = await new Promise<LatLng | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    )
  })

  if (!coords) return { coords: BANGKOK_CENTER, place: 'Bangkok' }
  return { coords, place: 'Near you' }
}

export async function fetchWeather(coords: LatLng, place: string): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(coords.lat),
    longitude: String(coords.lng),
    current: 'temperature_2m,weather_code,precipitation,is_day',
    hourly: 'precipitation_probability,temperature_2m,weather_code',
    forecast_hours: '8',
    timezone: 'Asia/Bangkok',
  })

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error(`Weather failed (${res.status})`)

  const data = (await res.json()) as OpenMeteoResponse
  const current = data.current
  const hourly = data.hourly
  if (
    current?.temperature_2m == null ||
    current.weather_code == null ||
    !hourly?.time ||
    !hourly.precipitation_probability ||
    !hourly.temperature_2m ||
    !hourly.weather_code
  ) {
    throw new Error('Weather response was incomplete')
  }

  const isDay = current.is_day !== 0
  const condition = describeWeather(current.weather_code, isDay)
  const now = Date.now()
  const hours: HourForecast[] = []
  let currentHourChance: number | null = null

  for (let i = 0; i < hourly.time.length; i++) {
    const at = parseBangkokTime(hourly.time[i])
    if (Number.isNaN(at.getTime())) continue
    const rainChance = hourly.precipitation_probability[i] ?? 0
    if (at.getTime() <= now) {
      currentHourChance = rainChance
      continue
    }
    if (hours.length >= HOUR_COUNT) continue
    const temperatureC = hourly.temperature_2m[i]
    const code = hourly.weather_code[i]
    if (temperatureC == null || code == null) continue
    const hourIsDay = at.getHours() >= 6 && at.getHours() < 18
    hours.push({
      timeLabel: at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      temperatureC: Math.round(temperatureC),
      rainChance,
      icon: describeWeather(code, hourIsDay).icon,
    })
  }

  const rainNow = (current.precipitation ?? 0) > 0 || isRainingCode(current.weather_code)
  const rainChanceNow = currentHourChance ?? (rainNow ? 100 : 0)

  return {
    place,
    temperatureC: Math.round(current.temperature_2m),
    condition: condition.label,
    icon: condition.icon,
    rainNow,
    rainChanceNow,
    recommendation: umbrellaRecommendation(
      rainNow,
      hours.map((hour) => hour.rainChance),
    ),
    hours,
  }
}
