# RoutePilot — Internship Submission Notes

## Problem solved

Most map demos stop at displaying a map. RoutePilot demonstrates the complete interaction chain requested in the internship brief:

1. Load an interactive map.
2. Request browser location permission.
3. Display the real current location when permitted.
4. Search a destination through a location-search API.
5. Select a real search result.
6. Request a road route from the user's actual coordinates.
7. Draw the returned route geometry.
8. Show distance and estimated travel time.
9. Fit the map viewport to the route.
10. Clear the route and choose another destination without reloading.

## Innovation layer

The interface is designed as a lightweight "location intelligence" dashboard rather than a plain map clone.

- Recent searches are persisted locally.
- Quick destinations reduce repetitive typing.
- The route card exposes the origin/destination relationship.
- Location/search/routing states are visible instead of silently failing.
- Dark mode is included without changing the core workflow.
- The architecture isolates geocoding and routing services, making provider replacement straightforward.

## Viva explanation — 60 seconds

"RoutePilot is a React-based location dashboard. On startup it loads an interactive Leaflet map and requests the browser's Geolocation API. If permission is granted, the user's actual latitude and longitude are stored as the route origin. The search box calls a geocoding API instead of hardcoded places. When the user selects a result, its real coordinates become the destination. Clicking Show Route calls the OSRM routing API with origin and destination coordinates. The returned road geometry is rendered as a polyline, while distance and estimated travel time are displayed in a route card. I also handled permission denial, empty search results, API failures and loading states. Service code is separated from UI components so the mapping provider can be replaced later."

## Evaluation checklist

- [x] Map API integration
- [x] Browser geolocation
- [x] Current user location marker
- [x] Permission/error handling
- [x] Place search
- [x] Search result selection
- [x] Map zoom/pan
- [x] Current location button
- [x] Destination marker
- [x] Actual route from user to destination
- [x] Distance/time
- [x] Route fits viewport
- [x] Clear route
- [x] New destination without reload
- [x] No hardcoded secret
- [x] README
- [x] Responsive UI
- [x] Bonus recent searches/dark mode

## Screenshots to include in README

1. Initial map + search
2. Location permission/current marker
3. Search results
4. Destination selected
5. Route + distance + ETA
6. Permission denied state
7. No-search-results state
8. Mobile responsive view
