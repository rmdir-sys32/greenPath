# GreenPath UI (Next.js)

Frontend for GreenPath: pollution-aware route discovery and comparison UI.

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Mapbox GL + Leaflet ecosystem
- Axios for backend integration

## Project Architecture

```
greenpath-ui/
├─ app/
│  ├─ page.tsx                     # composition root for app experience
│  └─ api/geocode/route.ts         # proxy to Nominatim geocoding API
├─ components/
│  ├─ Map.tsx                      # base map + route rendering
│  ├─ SearchBar.tsx                # origin/destination search + suggestions
│  ├─ RouteComparisonPanel.tsx     # route cards and route switching
│  ├─ HealthExposureWidget.tsx     # exposure delta card
│  └─ ...                          # UI/supporting widgets
├─ hooks/
│  ├─ useRoute.ts                  # route fetch lifecycle + dedupe
│  ├─ useGeocoder.ts               # debounced geocoder
│  ├─ useHealthScore.ts            # route exposure calculations
│  └─ useUserLocation.ts           # GPS/manual source of truth
├─ services/
│  ├─ routeService.ts              # fetch Mapbox candidates + backend scoring
│  └─ geocodingService.ts          # geocoder service adapters
├─ lib/
│  ├─ constants.ts                 # endpoints + app constants
│  └─ exposure.ts                  # pure exposure logic
├─ types/                          # shared TS models
├─ Dockerfile
└─ docker-compose.yml
```

## Data Flow

1. User sets start/destination in `SearchBar`.
2. `useRoute` requests route candidates from Mapbox through `routeService`.
3. UI sends all candidates to backend `/score-routes` for AQI scoring.
4. Backend returns fully sorted routes; UI renders map + comparison cards + health widgets.

## Prerequisites

- Node.js 20+
- npm 10+
- Backend running (`backend-2`) reachable by UI

## Environment Variables

Create `.env.local` in this folder:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token
```

## Local Initialization (Team Setup)

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## Quality Commands

```bash
npm run lint
npm run build
npm run start
```

## Docker

### Build & Run (direct)

```bash
docker build -t greenpath-ui .
docker run --rm -p 3000:3000 \
	-e NEXT_PUBLIC_API_URL=http://host.docker.internal:8000 \
	-e NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token \
	greenpath-ui
```

### Docker Compose

```bash
docker compose up --build
```

## Notes for Team

- `NEXT_PUBLIC_*` variables are baked into client output at build/runtime boundaries.
- Keep UI endpoint aligned with backend host/port (`NEXT_PUBLIC_API_URL`).
- For same-place-name ambiguity, suggestions show primary + city/state context.

## Troubleshooting

- **No routes shown**: check backend health at `http://localhost:8000/health`.
- **Wrong location selected**: verify geocoder dropdown secondary text and choose full match.
- **Map not loading**: ensure valid `NEXT_PUBLIC_MAPBOX_TOKEN`.
