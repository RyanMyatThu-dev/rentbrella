# Rentbrella

Rental website for finding a station, scanning a dispenser, and picking up or returning an umbrella.

## Run locally

```bash
npm install
cp .env.example .env   # paste a Mapbox public token
npm run dev
```

Open http://127.0.0.1:8000/.

```bash
npm run build    # production build → dist/
npm run preview  # serve the production build locally
```

The map needs `VITE_MAPBOX_TOKEN` in `.env`. Weather uses the public Open-Meteo API.
