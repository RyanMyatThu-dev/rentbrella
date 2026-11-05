import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MapRef,
} from 'react-map-gl/mapbox'
import type { Station } from '../../data/mockData'
import {
  BANGKOK_CENTER,
  fetchWalkingRoute,
  formatDistance,
  formatDuration,
  type LatLng,
  type WalkingRoute,
} from '../../lib/geo'
import { Icon } from '../ui/Icon'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAP_STYLES = [
  { id: 'streets', label: 'Streets', url: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'outdoors', label: 'Outdoors', url: 'mapbox://styles/mapbox/outdoors-v12' },
  { id: 'light', label: 'Light', url: 'mapbox://styles/mapbox/light-v11' },
] as const

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

type StationMapProps = {
  stations: Station[]
  /** Bounds target — usually the current search/page slice. Falls back to `stations`. */
  fitStations?: Station[]
  heightClassName?: string
  onSelect?: (station: Station) => void
}

export function StationMap({
  stations,
  fitStations,
  heightClassName = 'h-[280px] sm:h-[340px] md:h-full md:min-h-[420px]',
  onSelect,
}: StationMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [styleIndex, setStyleIndex] = useState(0)
  const [userLocation, setUserLocation] = useState<LatLng | null>(null)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [route, setRoute] = useState<WalkingRoute | null>(null)
  const [routeError, setRouteError] = useState<string | null>(null)
  const [routing, setRouting] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const boundsStations = fitStations?.length ? fitStations : stations
  const fitKey = boundsStations.map((s) => s.id).join('|')
  const focused = stations.find((s) => s.id === focusedId) ?? null
  const mapStyle = MAP_STYLES[styleIndex]

  const fitToStations = useCallback((list: Station[], includeUser?: LatLng | null) => {
    const map = mapRef.current
    if (!map || list.length === 0) return

    if (list.length === 1 && !includeUser) {
      map.flyTo({
        center: [list[0].coords.lng, list[0].coords.lat],
        zoom: 15,
        duration: 700,
      })
      return
    }

    let minLng = Infinity
    let minLat = Infinity
    let maxLng = -Infinity
    let maxLat = -Infinity
    for (const station of list) {
      minLng = Math.min(minLng, station.coords.lng)
      maxLng = Math.max(maxLng, station.coords.lng)
      minLat = Math.min(minLat, station.coords.lat)
      maxLat = Math.max(maxLat, station.coords.lat)
    }
    if (includeUser) {
      minLng = Math.min(minLng, includeUser.lng)
      maxLng = Math.max(maxLng, includeUser.lng)
      minLat = Math.min(minLat, includeUser.lat)
      maxLat = Math.max(maxLat, includeUser.lat)
    }

    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 56, duration: 700, maxZoom: 15 },
    )
  }, [])

  useEffect(() => {
    fitToStations(boundsStations)
  }, [fitKey, fitToStations, boundsStations])

  const origin = userLocation ?? BANGKOK_CENTER

  useEffect(() => {
    if (!focused || !TOKEN) {
      setRoute(null)
      setRouteError(null)
      return
    }

    let cancelled = false
    setRouting(true)
    setRouteError(null)

    fetchWalkingRoute(origin, focused.coords, TOKEN)
      .then((next) => {
        if (cancelled) return
        setRoute(next)
        fitToStations([focused], origin)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setRoute(null)
        setRouteError(err instanceof Error ? err.message : 'Could not load directions')
      })
      .finally(() => {
        if (!cancelled) setRouting(false)
      })

    return () => {
      cancelled = true
    }
  }, [focused, origin, fitToStations])

  const routeGeoJson = useMemo<GeoJSON.FeatureCollection | null>(() => {
    if (!route) return null
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: route.geometry,
        },
      ],
    }
  }, [route])

  const recenter = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser')
      fitToStations(boundsStations, BANGKOK_CENTER)
      setUserLocation(BANGKOK_CENTER)
      return
    }

    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(next)
        mapRef.current?.flyTo({
          center: [next.lng, next.lat],
          zoom: 14.5,
          duration: 800,
        })
      },
      () => {
        setGeoError('Location permission denied — using Bangkok center')
        setUserLocation(BANGKOK_CENTER)
        mapRef.current?.flyTo({
          center: [BANGKOK_CENTER.lng, BANGKOK_CENTER.lat],
          zoom: 13.5,
          duration: 800,
        })
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const cycleStyle = () => setStyleIndex((i) => (i + 1) % MAP_STYLES.length)

  if (!TOKEN) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-high p-6 text-center shadow-[var(--shadow-card)] ${heightClassName}`}
      >
        <Icon name="map" className="text-[36px] text-primary" />
        <p className="text-sm font-bold text-on-surface">Mapbox token missing</p>
        <p className="max-w-sm text-xs text-on-surface-variant">
          Add <code className="font-mono">VITE_MAPBOX_TOKEN</code> to{' '}
          <code className="font-mono">.env</code>, then restart the app. See{' '}
          <code className="font-mono">.env.example</code>.
        </p>
      </div>
    )
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-high shadow-[var(--shadow-card)] ${heightClassName}`}
    >
      <Map
        ref={mapRef}
        mapboxAccessToken={TOKEN}
        mapStyle={mapStyle.url}
        initialViewState={{
          longitude: BANGKOK_CENTER.lng,
          latitude: BANGKOK_CENTER.lat,
          zoom: 12.5,
        }}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <NavigationControl position="bottom-left" showCompass={false} />

        {routeGeoJson ? (
          <Source id="walking-route" type="geojson" data={routeGeoJson}>
            <Layer
              id="walking-route-line"
              type="line"
              paint={{
                'line-color': '#006194',
                'line-width': 4,
                'line-opacity': 0.9,
              }}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            />
          </Source>
        ) : null}

        {userLocation ? (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <div className="relative flex h-4 w-4 items-center justify-center">
              <span className="absolute h-8 w-8 animate-ping rounded-full bg-primary/30" />
              <span className="relative h-3.5 w-3.5 rounded-full border-2 border-white bg-primary shadow" />
            </div>
          </Marker>
        ) : null}

        {stations.map((station, index) => {
          const active = station.id === focusedId
          return (
            <Marker
              key={station.id}
              longitude={station.coords.lng}
              latitude={station.coords.lat}
              anchor="bottom"
              onClick={(event) => {
                event.originalEvent.stopPropagation()
                setFocusedId(station.id)
              }}
            >
              <button
                type="button"
                className="flex -translate-y-0.5 flex-col items-center active:scale-95"
              >
                <div
                  className={`flex items-center gap-1.5 rounded-md border px-2 py-1 shadow-md whitespace-nowrap ${
                    active
                      ? 'border-primary bg-primary text-on-primary'
                      : index === 0
                        ? 'border-primary/30 bg-surface-container-lowest'
                        : 'border-outline-variant/40 bg-surface-container-lowest/95'
                  }`}
                >
                  <Icon
                    name="umbrella"
                    className={`text-[15px] ${active ? 'text-on-primary' : 'text-primary'}`}
                  />
                  <div className="flex flex-col text-left">
                    <span
                      className={`text-[11px] leading-tight font-bold ${
                        active ? 'text-on-primary' : 'text-on-surface'
                      }`}
                    >
                      {station.shortName}
                    </span>
                    <span
                      className={`text-[11px] leading-tight font-bold ${
                        active ? 'text-primary-fixed' : 'text-primary'
                      }`}
                    >
                      {station.available} · {station.distanceM}m
                    </span>
                  </div>
                </div>
                <div
                  className={`-mt-1 h-2 w-2 rotate-45 ${active ? 'bg-primary' : 'bg-primary'}`}
                />
              </button>
            </Marker>
          )
        })}
      </Map>

      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <MapControl icon="my_location" label="Recenter map" onClick={recenter} />
        <MapControl
          icon="layers"
          label={`Map style: ${mapStyle.label}`}
          onClick={cycleStyle}
        />
      </div>

      {focused ? (
        <div className="absolute inset-x-3 bottom-3 z-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest/95 p-3 shadow-[var(--shadow-float)] backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-bold text-on-surface">{focused.shortName}</div>
              <p className="truncate text-[12px] text-on-surface-variant">{focused.location}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-bold text-on-surface-variant">
                {routing ? (
                  <span className="inline-flex items-center gap-1 text-primary">
                    <Icon name="progress_activity" className="animate-spin text-[14px]" />
                    Getting walking ETA…
                  </span>
                ) : route ? (
                  <>
                    <span className="inline-flex items-center gap-1 rounded bg-secondary-fixed/60 px-2 py-0.5 text-on-secondary-fixed-variant">
                      <Icon name="directions_walk" className="text-[14px]" />
                      ETA {formatDuration(route.durationSec)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="straighten" className="text-[14px] text-primary" />
                      {formatDistance(route.distanceM)} walk
                    </span>
                  </>
                ) : (
                  <span className="text-warning">
                    {routeError ?? 'Directions unavailable'}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              aria-label="Close directions"
              onClick={() => {
                setFocusedId(null)
                setRoute(null)
              }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant"
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          </div>
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (!route) return
                fitToStations([focused], origin)
              }}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-[12px] font-bold text-on-surface"
            >
              <Icon name="route" className="text-[16px] text-primary" />
              Show route
            </button>
            <button
              type="button"
              onClick={() => onSelect?.(focused)}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary text-[12px] font-bold text-on-primary"
            >
              <Icon name="qr_code_scanner" className="text-[16px]" />
              Go to station
            </button>
          </div>
        </div>
      ) : (
        <div className="absolute right-3 bottom-3 z-10 rounded border border-outline-variant/30 bg-surface-container-lowest/90 px-2 py-1 text-[11px] font-bold text-on-surface-variant backdrop-blur-md">
          {stations.length} station{stations.length === 1 ? '' : 's'}
          {fitStations && fitStations.length !== stations.length
            ? ` · page ${fitStations.length}`
            : ''}
        </div>
      )}

      {geoError ? (
        <div className="absolute top-3 left-3 z-10 max-w-[14rem] rounded-md border border-warning/30 bg-warning-soft px-2 py-1 text-[11px] font-semibold text-warning">
          {geoError}
        </div>
      ) : null}
    </div>
  )
}

function MapControl({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-outline-variant/30 bg-surface-container-lowest/90 text-on-surface shadow-sm backdrop-blur-md transition-all hover:text-primary active:scale-95"
    >
      <Icon name={icon} className="text-[18px]" />
    </button>
  )
}
