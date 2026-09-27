import StatusPill from "./StatusPill";

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours} hr ${mins} min` : `${hours} hr`;
}

export default function RouteCard({
  destination,
  route,
  userLocation,
  onRoute,
  onClear,
  routing,
  locationStatus,
}) {
  if (!destination) return null;

  return (
    <aside className="route-card">
      <div className="route-card-top">
        <div>
          <StatusPill tone={locationStatus === "granted" ? "success" : "neutral"}>
            {locationStatus === "granted" ? "Live location" : "Location needed"}
          </StatusPill>
          <h2>{destination.name}</h2>
          <p>{destination.label}</p>
        </div>
        <button className="icon-button" onClick={onClear} aria-label="Clear destination">×</button>
      </div>

      <div className="route-points">
        <div className="route-point">
          <span className="point-dot origin" />
          <div>
            <small>FROM</small>
            <strong>{userLocation ? "Your current location" : "Location unavailable"}</strong>
          </div>
        </div>
        <div className="route-line" />
        <div className="route-point">
          <span className="point-dot destination" />
          <div>
            <small>TO</small>
            <strong>{destination.name}</strong>
          </div>
        </div>
      </div>

      {route && (
        <div className="route-stats">
          <div>
            <strong>{formatDistance(route.distanceMeters)}</strong>
            <span>Distance</span>
          </div>
          <div>
            <strong>{formatDuration(route.durationSeconds)}</strong>
            <span>Estimated time</span>
          </div>
        </div>
      )}

      {!route && (
        <button className="route-button" onClick={onRoute} disabled={routing || !userLocation}>
          {routing ? "Finding best road route..." : userLocation ? "Show Route" : "Enable Location to Route"}
        </button>
      )}

      {route && (
        <button className="route-button secondary" onClick={onRoute} disabled={routing}>
          {routing ? "Recalculating..." : "Recalculate Route"}
        </button>
      )}

      <div className="route-hint">
        {userLocation
          ? "Route uses your actual browser coordinates and the selected destination."
          : "Allow location access to calculate a route from your current position."}
      </div>
    </aside>
  );
}