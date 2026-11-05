import { useEffect, useState } from 'react'
import { Icon } from '../ui/Icon'
import { fetchWeather, resolveWeatherLocation, type WeatherSnapshot } from '../../lib/weather'

type WeatherState =
  | { status: 'loading' }
  | { status: 'ready'; weather: WeatherSnapshot }
  | { status: 'error' }

export function WeatherCard() {
  const [state, setState] = useState<WeatherState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { coords, place } = await resolveWeatherLocation()
        const weather = await fetchWeather(coords, place)
        if (!cancelled) setState({ status: 'ready', weather })
      } catch {
        if (!cancelled) setState({ status: 'error' })
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (state.status === 'loading') return <WeatherSkeleton />
  if (state.status === 'error') return <WeatherError />
  return <WeatherBody weather={state.weather} />
}

function WeatherBody({ weather }: { weather: WeatherSnapshot }) {
  const wet = weather.rainNow || weather.recommendation.startsWith('Rain')

  return (
    <div className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-fixed/50 text-secondary">
            <Icon name={weather.icon} className="text-[24px]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
              {weather.place}
            </span>
            <div className="mt-0.5 text-lg leading-tight font-extrabold text-on-surface">
              {weather.temperatureC}°
              <span className="ml-1.5 text-sm font-bold text-on-surface-variant">
                {weather.condition}
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
            Rain now
          </div>
          <div className="mt-0.5 text-sm font-extrabold text-on-surface">
            {weather.rainChanceNow}%
          </div>
        </div>
      </div>

      <p
        className={`mt-2 flex items-center gap-1.5 text-[12px] font-semibold ${
          wet ? 'text-primary' : 'text-on-surface-variant'
        }`}
      >
        <Icon name={wet ? 'umbrella' : 'check_circle'} className="text-[16px]" />
        {weather.recommendation}
      </p>

      {weather.hours.length > 0 && (
        <div
          className="mt-2.5 grid w-full gap-1.5"
          style={{ gridTemplateColumns: `repeat(${weather.hours.length}, minmax(0, 1fr))` }}
        >
          {weather.hours.map((hour) => (
            <div
              key={hour.timeLabel}
              className="flex min-w-0 flex-col items-center rounded-lg bg-surface-container-high px-0.5 py-1.5"
            >
              <span className="text-[10px] leading-none font-bold text-on-surface-variant tabular-nums">
                {hour.timeLabel}
              </span>
              <Icon name={hour.icon} className="my-1 text-[18px] text-secondary" />
              <span className="text-[11px] leading-none font-bold text-on-surface tabular-nums">
                {hour.temperatureC}°
              </span>
              <span className="mt-0.5 text-[10px] leading-none font-semibold text-on-surface-variant tabular-nums">
                {hour.rainChance}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WeatherSkeleton() {
  return (
    <div
      className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-sm"
      aria-hidden
    >
      <div className="flex items-center justify-between gap-3">
        <div className="h-11 w-40 animate-pulse rounded-lg bg-surface-container-high" />
        <div className="h-11 w-14 animate-pulse rounded-lg bg-surface-container-high" />
      </div>
      <div className="mt-2 h-4 w-48 animate-pulse rounded bg-surface-container-high" />
      <div className="mt-2.5 grid grid-cols-6 gap-1.5">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-[72px] animate-pulse rounded-lg bg-surface-container-high" />
        ))}
      </div>
    </div>
  )
}

function WeatherError() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3 text-[12px] text-on-surface-variant shadow-sm">
      <Icon name="cloud_off" className="text-[18px] text-secondary" />
      Weather unavailable
    </div>
  )
}
