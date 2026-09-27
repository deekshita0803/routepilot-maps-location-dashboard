import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
  Polyline,
} from "react-leaflet";
import L from "leaflet";

const userIcon = L.divIcon({
  className: "custom-marker-wrap",
  html: '<div class="user-marker"><span></span></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const destinationIcon = L.divIcon({
  className: "custom-marker-wrap",
  html: '<div class="destination-marker">●</div>',
  iconSize: [34, 42],
  iconAnchor: [17, 38],
});

function MapController({ userLocation, destination, route }) {
  const map = useMap();

  useEffect(() => {
    if (!route?.geometry?.coordinates?.length) return;
    const points = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    map.fitBounds(L.latLngBounds(points), { padding: [80, 80] });
  }, [map, route]);

  useEffect(() => {
    if (destination && !route) {
      map.flyTo([destination.lat, destination.lon], 14, { duration: 0.8 });
    }
  }, [map, destination, route]);

  useEffect(() => {
    if (userLocation && !destination && !route) {
      map.flyTo([userLocation.lat, userLocation.lon], 14, { duration: 0.8 });
    }
  }, [map, userLocation, destination, route]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (event) => onMapClick?.(event.latlng),
  });
  return null;
}

export default function MapView({
  userLocation,
  destination,
  route,
  onMapClick,
  dark,
}) {
  const defaultCenter = [16.5062, 80.648];
  const center = userLocation
    ? [userLocation.lat, userLocation.lon]
    : defaultCenter;

  const routePositions = route?.geometry?.coordinates?.map(([lon, lat]) => [lat, lon]) || [];

  return (
    <MapContainer center={center} zoom={12} className="map">
   <TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

      <MapController
        userLocation={userLocation}
        destination={destination}
        route={route}
      />

      <MapClickHandler onMapClick={onMapClick} />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
          <Popup>
            <strong>Your current location</strong>
            <br />
            {userLocation.lat.toFixed(5)}, {userLocation.lon.toFixed(5)}
          </Popup>
        </Marker>
      )}

      {destination && (
        <Marker position={[destination.lat, destination.lon]} icon={destinationIcon}>
          <Popup>
            <strong>{destination.name}</strong>
            <br />
            {destination.label}
          </Popup>
        </Marker>
      )}

      {routePositions.length > 1 && (
        <Polyline
          positions={routePositions}
          pathOptions={{ className: "route-line-map", weight: 6 }}
        />
      )}
    </MapContainer>
  );
}