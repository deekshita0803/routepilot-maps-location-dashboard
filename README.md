# RoutePilot — Maps API & Location-Based Dashboard

A polished internship project demonstrating:

- Interactive map integration
- Browser geolocation and permission handling
- Real API-based nearby place search using the user\'s current location
- Destination selection and markers
- Road routing from the user's actual coordinates
- Distance and ETA
- Automatic viewport fitting
- Route clear/recalculate without reload
- Recent search history
- Quick-place shortcuts\n- Location-biased search with proximity sorting when browser location is available
- Loading, empty, permission, network and routing error states
- Responsive desktop/tablet/mobile UI

## Stack

- React + Vite
- Leaflet + React-Leaflet
- OpenStreetMap map tiles
- Photon geocoding API for place search
- OSRM routing API for road routes
- Browser Geolocation API
- CSS (no UI framework required)

## Why this provider choice?

The internship brief permits OpenStreetMap-based services. This version uses public OpenStreetMap ecosystem services so the project can be demonstrated without putting a secret API key in a frontend repository.

For production deployment, replace the public demo endpoints with an approved provider/account and follow that provider's rate limits, attribution and API-key restrictions.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

Build:

```bash
npm run build
npm run preview
```

## Important

The browser location feature requires a secure context in normal deployment (HTTPS; localhost is allowed by modern browsers).

Do not commit `.env` or private API credentials.

## Core flow

Open dashboard → request location → search destination → select result → Show Route → view road route + distance + ETA → clear/re-route.

## Bonus features

- Recent searches saved in localStorage
- Quick destination chips
- "Use my location" recenter button
- Route status card
- Copyable coordinates
- Dark mode
- Mobile bottom-sheet style controls
- Graceful fallback when geolocation is unavailable

## Suggested Git commits

1. Initial React/Vite setup
2. Added Leaflet map integration
3. Added browser geolocation
4. Added API-based place search
5. Added destination selection and marker
6. Added OSRM routing
7. Added route information and viewport fitting
8. Added error/loading states
9. Added recent searches and quick places
10. Added responsive UI and dark mode

## Project structure

```text
routepilot-maps-dashboard/
├── src/
│   ├── components/
│   │   ├── MapView.jsx
│   │   ├── SearchPanel.jsx
│   │   ├── RouteCard.jsx
│   │   └── StatusPill.jsx
│   ├── services/
│   │   ├── geocoding.js
│   │   └── routing.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```
