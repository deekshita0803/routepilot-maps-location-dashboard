import { useCallback, useEffect, useMemo, useState } from "react";
import MapView from "./components/MapView";
import SearchPanel from "./components/SearchPanel";
import RouteCard from "./components/RouteCard";
import StatusPill from "./components/StatusPill";
import { searchPlaces } from "./services/geocoding";
import { getRoute } from "./services/routing";

const DEFAULT_RECENT = [];

export default function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [locationMessage, setLocationMessage] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [searching, setSearching] = useState(false);
  const [routing, setRouting] = useState(false);
  const [error, setError] = useState("");

  const [dark, setDark] = useState(
    () => localStorage.getItem("routepilot-dark") === "true"
  );

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("routepilot-recent")) ||
        DEFAULT_RECENT
      );
    } catch {
      return DEFAULT_RECENT;
    }
  });

  /* =========================
     DARK MODE
  ========================= */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("routepilot-dark", String(dark));
  }, [dark]);

  /* =========================
     RECENT SEARCHES
  ========================= */
  useEffect(() => {
    localStorage.setItem(
      "routepilot-recent",
      JSON.stringify(recentSearches.slice(0, 8))
    );
  }, [recentSearches]);

  /* =========================
     GET USER LOCATION
  ========================= */
  const requestLocation = useCallback(() => {
    setError("");
    setLocationStatus("loading");
    setLocationMessage("Requesting your browser location...");

    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      setLocationMessage(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setUserLocation(next);
        setLocationStatus("granted");
        setLocationMessage("Current location detected.");
      },
      (geoError) => {
        setLocationStatus(
          geoError.code === 1 ? "denied" : "error"
        );

        const message =
          geoError.code === 1
            ? "Location permission was denied. You can still search manually."
            : "Unable to determine your location. Please try again.";

        setLocationMessage(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  /* =========================
     SEARCH PLACES
  ========================= */
  const performSearch = useCallback(
    async (forcedQuery) => {
      const value = (forcedQuery ?? query).trim();

      if (!value) return;

      setQuery(value);
      setSearching(true);
      setError("");

      try {
        const places = await searchPlaces(value, userLocation);

        setResults(places);

        if (!userLocation) {
          setError(
            "Location is unavailable, so results are not location-biased. Allow location access for nearby results."
          );
        }
      } catch {
        setResults([]);
        setError(
          "Search service is unavailable right now. Please try again."
        );
      } finally {
        setSearching(false);
      }
    },
    [query, userLocation]
  );

  /* =========================
     SELECT DESTINATION
  ========================= */
  const selectDestination = useCallback((place) => {
    setDestination(place);
    setRoute(null);
    setResults([]);
    setQuery(place.name);
    setError("");

    setRecentSearches((current) =>
      [
        place,
        ...current.filter((item) => item.id !== place.id),
      ].slice(0, 8)
    );
  }, []);

  /* =========================
     CALCULATE ROUTE
  ========================= */
  const calculateRoute = useCallback(async () => {
    if (!userLocation || !destination) {
      setError(
        "Enable location access before requesting a route."
      );
      return;
    }

    setRouting(true);
    setError("");

    try {
      const nextRoute = await getRoute(
        userLocation,
        destination
      );

      setRoute(nextRoute);
    } catch (routeError) {
      setRoute(null);
      setError(
        routeError.message ||
          "Unable to find a route between these locations."
      );
    } finally {
      setRouting(false);
    }
  }, [userLocation, destination]);

  /* =========================
     CLEAR ROUTE
  ========================= */
  const clearRoute = () => {
    setRoute(null);
    setDestination(null);
    setResults([]);
    setQuery("");
    setError("");
  };

  /* =========================
     MAP CLICK
  ========================= */
  const handleMapClick = () => {
    // Reserved for future arbitrary origin/destination feature.
  };

  /* =========================
     LOCATION STATUS
  ========================= */
  const locationTone = useMemo(() => {
    if (locationStatus === "granted") return "success";
    if (locationStatus === "loading") return "warning";
    if (
      locationStatus === "denied" ||
      locationStatus === "error"
    ) {
      return "danger";
    }

    return "neutral";
  }, [locationStatus]);

  return (
    <div className="app-shell">
      {/* =========================
          HEADER
      ========================= */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">R</div>

          <div>
            <strong>RoutePilot</strong>
            <span>Maps & Location Intelligence</span>
          </div>
        </div>

        <div className="top-actions">
          <StatusPill tone={locationTone}>
            <span className="live-dot" />

            {locationStatus === "granted"
              ? "Location ready"
              : "Location status"}
          </StatusPill>

          <button
            className="theme-button"
            onClick={() => setDark((value) => !value)}
            aria-label="Toggle dark mode"
          >
            {dark ? "☀" : "☾"}
          </button>
        </div>
      </header>

      {/* =========================
          MAIN WORKSPACE
      ========================= */}
      <main className="workspace">
        <MapView
          userLocation={userLocation}
          destination={destination}
          route={route}
          onMapClick={handleMapClick}
          dark={dark}
        />

        {/* =========================
            SEARCH
        ========================= */}
        <div className="floating-search">
          <SearchPanel
            query={query}
            setQuery={setQuery}
            results={results}
            onSearch={performSearch}
            onSelect={selectDestination}
            searching={searching}
            recentSearches={recentSearches}
            onRecentSelect={selectDestination}
            destination={destination}
          />
        </div>

        {/* =========================
            MAP CONTROLS
        ========================= */}
        <div className="map-controls">
          <button
            className="map-control primary-control"
            onClick={requestLocation}
            title="Use my current location"
          >
            ◎
            <span>My location</span>
          </button>
        </div>

        {/* =========================
            MAP BRANDING
        ========================= */}
        <div className="map-branding">
          <span>ROUTEPILOT</span>
          <small>OpenStreetMap-powered demo</small>
        </div>

        {/* =========================
            LOCATION MESSAGE
        ========================= */}
        {locationMessage && (
          <div className="location-toast">
            <StatusPill tone={locationTone}>
              {locationMessage}
            </StatusPill>
          </div>
        )}

        {/* =========================
            ROUTE CARD
        ========================= */}
        {destination && (
          <div className="route-card-position">
            <RouteCard
              destination={destination}
              route={route}
              userLocation={userLocation}
              onRoute={calculateRoute}
              onClear={clearRoute}
              routing={routing}
              locationStatus={locationStatus}
            />
          </div>
        )}

        {/* =========================
            ERROR MESSAGE
        ========================= */}
        {error && (
          <div className="error-toast" role="alert">
            <span>!</span>

            <div>
              <strong>Something needs attention</strong>
              <p>{error}</p>
            </div>

            <button onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}

        {/* =========================
            WELCOME CARD
        ========================= */}
        {!destination && (
          <div className="welcome-card">
            <div className="welcome-icon">⌖</div>

            <div>
              <strong>Where are you going?</strong>

              <p>
                Search any supported place and RoutePilot
                will build a real road route from your current
                position.
              </p>

              <div className="feature-row">
                <span>● Live location</span>
                <span>● Place search</span>
                <span>● Road routing</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================
          FOOTER
      ========================= */}
      <footer className="footer-bar">
        <span>RoutePilot Internship Project</span>
        <span>
          Geolocation · Search · Routing · Error Handling
        </span>
      </footer>
    </div>
  );
}