import { useEffect, useState } from "react";

import MapView from "./components/MapView";
import LocationButton from "./components/LocationButton";
import SearchPanel from "./components/SearchPanel";

import { searchPlaces } from "./services/geocoding";
import { getRoute } from "./services/routing";

function App() {
  // ==========================================
  // LOCATION
  // ==========================================

  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] =
    useState(false);
  const [locationMessage, setLocationMessage] =
    useState("");

  // ==========================================
  // SEARCH
  // ==========================================

  const [searchResults, setSearchResults] =
    useState([]);
  const [searchLoading, setSearchLoading] =
    useState(false);
  const [searchError, setSearchError] =
    useState("");

  const [destination, setDestination] =
    useState(null);

  // ==========================================
  // ROUTING
  // ==========================================

  const [route, setRoute] = useState(null);
  const [routingLoading, setRoutingLoading] =
    useState(false);
  const [routingError, setRoutingError] =
    useState("");

  // ==========================================
  // BONUS FEATURES
  // ==========================================

  const [darkMode, setDarkMode] = useState(
    () =>
      localStorage.getItem(
        "routepilot-dark-mode"
      ) === "true"
  );

  const [recentSearches, setRecentSearches] =
    useState(() => {
      try {
        return (
          JSON.parse(
            localStorage.getItem(
              "routepilot-recent-searches"
            )
          ) || []
        );
      } catch {
        return [];
      }
    });

  // ==========================================
  // DARK MODE
  // ==========================================

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark-mode",
      darkMode
    );

    localStorage.setItem(
      "routepilot-dark-mode",
      String(darkMode)
    );
  }, [darkMode]);

  // ==========================================
  // SAVE RECENT SEARCHES
  // ==========================================

  useEffect(() => {
    localStorage.setItem(
      "routepilot-recent-searches",
      JSON.stringify(recentSearches)
    );
  }, [recentSearches]);

  // ==========================================
  // GET USER LOCATION
  // ==========================================

  const getUserLocation = () => {
    setLoadingLocation(true);
    setLocationMessage("");
    setRoutingError("");

    if (!navigator.geolocation) {
      setLoadingLocation(false);

      setLocationMessage(
        "Geolocation is not supported by this browser."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
          accuracy,
        } = position.coords;

        setUserLocation({
          latitude,
          longitude,
          accuracy,
        });

        setLoadingLocation(false);

        setLocationMessage(
          "Your current location was detected successfully."
        );
      },

      (error) => {
        setLoadingLocation(false);

        if (error.code === 1) {
          setLocationMessage(
            "Location permission was denied. You can still search manually."
          );
        } else if (error.code === 2) {
          setLocationMessage(
            "Your location is currently unavailable."
          );
        } else if (error.code === 3) {
          setLocationMessage(
            "Location request timed out. Please try again."
          );
        } else {
          setLocationMessage(
            "Unable to determine your location."
          );
        }
      },

      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  // Request location when the dashboard opens
  useEffect(() => {
    getUserLocation();
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = async (query) => {
    if (!query.trim()) {
      return;
    }

    setSearchLoading(true);
    setSearchError("");
    setSearchResults([]);

    try {
      const places =
        await searchPlaces(query);

      setSearchResults(places);

      if (places.length === 0) {
        setSearchError(
          "No locations found. Try another search."
        );
      }
    } catch (error) {
      console.error(
        "Search error:",
        error
      );

      setSearchResults([]);

      setSearchError(
        "Search service is unavailable. Please try again."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  // ==========================================
  // SELECT DESTINATION
  // ==========================================

  const handleSelectDestination = (
    place
  ) => {
    setDestination(place);

    setRoute(null);
    setRoutingError("");
    setSearchResults([]);
    setSearchError("");

    // Add to recent searches
    setRecentSearches((previous) => {
      const updated = [
        place,
        ...previous.filter(
          (item) => item.id !== place.id
        ),
      ];

      return updated.slice(0, 5);
    });
  };

  // ==========================================
  // ROUTE
  // ==========================================

  const handleRoute = async () => {
    setRoutingError("");

    if (!userLocation) {
      setRoutingError(
        "Please enable your current location before requesting a route."
      );

      return;
    }

    if (!destination) {
      setRoutingError(
        "Please select a destination first."
      );

      return;
    }

    setRoutingLoading(true);
    setRoute(null);

    try {
      const newRoute =
        await getRoute(
          userLocation,
          destination
        );

      setRoute(newRoute);
    } catch (error) {
      console.error(
        "Routing error:",
        error
      );

      setRoutingError(
        error.message ||
          "Unable to find a route between these locations."
      );
    } finally {
      setRoutingLoading(false);
    }
  };

  // ==========================================
  // CLEAR ROUTE
  // ==========================================

  const clearRoute = () => {
    setRoute(null);
    setRoutingError("");
  };

  // ==========================================
  // CLEAR DESTINATION
  // ==========================================

  const clearDestination = () => {
    setDestination(null);
    setRoute(null);
    setRoutingError("");
    setSearchError("");
  };

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="app-shell">

      {/* TOP BAR */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">
            R
          </div>

          <div className="brand-text">
            <strong>RoutePilot</strong>
            <span>
              Maps & Location Intelligence
            </span>
          </div>
        </div>

        <div className="topbar-actions">

          <div
            className={`location-status ${
              userLocation
                ? "ready"
                : "not-ready"
            }`}
          >
            <span className="status-dot" />

            {userLocation
              ? "Location ready"
              : "Location unavailable"}
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={() =>
              setDarkMode(
                (current) => !current
              )
            }
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀" : "☾"}
          </button>

        </div>
      </header>

      {/* WORKSPACE */}

      <main className="workspace">

        {/* MAP */}

        <MapView
          userLocation={userLocation}
          destination={destination}
          route={route}
        />

        {/* SEARCH */}

        <div className="search-wrapper">
          <SearchPanel
            onSearch={handleSearch}
            results={searchResults}
            loading={searchLoading}
            onSelect={
              handleSelectDestination
            }
            recentSearches={
              recentSearches
            }
            onRecentSelect={
              handleSelectDestination
            }
          />
        </div>

        {/* MY LOCATION */}

        <LocationButton
          onLocation={getUserLocation}
          loading={loadingLocation}
        />

        {/* LOCATION MESSAGE */}

        {locationMessage && (
          <div
            className={`floating-message ${
              userLocation
                ? "success"
                : "error"
            }`}
          >
            {locationMessage}
          </div>
        )}

        {/* SEARCH ERROR */}

        {searchError && (
          <div className="floating-error">
            {searchError}
          </div>
        )}

        {/* ROUTING ERROR */}

        {routingError && (
          <div className="floating-error route-error">
            {routingError}
          </div>
        )}

        {/* WELCOME CARD */}

        {!destination && (
          <div className="welcome-card">
            <div className="welcome-icon">
              ⌖
            </div>

            <div>
              <strong>
                Where are you going?
              </strong>

              <p>
                Search for a destination and
                RoutePilot will build a road
                route from your current
                location.
              </p>

              <div className="feature-list">
                <span>
                  ● Live location
                </span>

                <span>
                  ● Place search
                </span>

                <span>
                  ● Road routing
                </span>
              </div>
            </div>
          </div>
        )}

        {/* DESTINATION / ROUTE CARD */}

        {destination && (
          <aside className="route-card">

            <div className="route-card-header">

              <div>
                <span className="route-label">
                  DESTINATION
                </span>

                <h2>
                  {destination.name}
                </h2>

                <p>
                  {destination.label}
                </p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={
                  clearDestination
                }
              >
                ×
              </button>

            </div>

            <div className="route-points">

              <div className="route-point">
                <span className="origin-dot" />

                <div>
                  <small>
                    FROM
                  </small>

                  <strong>
                    {userLocation
                      ? "Your current location"
                      : "Location unavailable"}
                  </strong>
                </div>
              </div>

              <div className="route-connector" />

              <div className="route-point">
                <span className="destination-dot" />

                <div>
                  <small>
                    TO
                  </small>

                  <strong>
                    {destination.name}
                  </strong>
                </div>
              </div>

            </div>

            {route && (
              <div className="route-stats">

                <div>
                  <strong>
                    {(
                      route.distanceMeters /
                      1000
                    ).toFixed(1)}{" "}
                    km
                  </strong>

                  <span>
                    Distance
                  </span>
                </div>

                <div>
                  <strong>
                    {Math.max(
                      1,
                      Math.round(
                        route.durationSeconds /
                          60
                      )
                    )}{" "}
                    min
                  </strong>

                  <span>
                    Estimated time
                  </span>
                </div>

              </div>
            )}

            <button
              type="button"
              className="primary-route-button"
              onClick={handleRoute}
              disabled={routingLoading}
            >
              {routingLoading
                ? "Finding Route..."
                : route
                ? "Recalculate Route"
                : "Show Route"}
            </button>

            {route && (
              <button
                type="button"
                className="clear-button"
                onClick={
                  clearRoute
                }
              >
                Clear Route
              </button>
            )}

            <div className="route-note">
              {userLocation
                ? "Using your actual browser coordinates as the route origin."
                : "Allow location access to calculate a route from your current position."}
            </div>

          </aside>
        )}

        {/* MAP BRANDING */}

        <div className="map-branding">
          <strong>
            ROUTEPILOT
          </strong>

          <span>
            OpenStreetMap-powered demo
          </span>
        </div>

      </main>

      <footer className="footer">
        <span>
          RoutePilot Internship Project
        </span>

        <span>
          Geolocation · Search · Routing
        </span>
      </footer>

    </div>
  );
}

export default App;