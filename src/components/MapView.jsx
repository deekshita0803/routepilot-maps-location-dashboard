import { useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function MapController({
  userLocation,
  destination,
  route,
}) {
  const map = useMap();

  useEffect(() => {
    // If a route exists, fit the entire route inside the map
    if (route?.geometry?.coordinates?.length) {
      const routePoints =
        route.geometry.coordinates.map(
          ([longitude, latitude]) => [
            latitude,
            longitude,
          ]
        );

      map.fitBounds(routePoints, {
        padding: [60, 60],
      });

      return;
    }

    // If a destination exists, move to destination
    if (destination) {
      map.flyTo(
        [
          destination.latitude,
          destination.longitude,
        ],
        15,
        {
          animate: true,
          duration: 1.5,
        }
      );

      return;
    }

    // Otherwise move to user's location
    if (userLocation) {
      map.flyTo(
        [
          userLocation.latitude,
          userLocation.longitude,
        ],
        15,
        {
          animate: true,
          duration: 1.5,
        }
      );
    }
  }, [userLocation, destination, route, map]);

  return null;
}

function MapView({
  userLocation,
  destination,
  route,
}) {
  const defaultCenter = [16.5062, 80.6480];

  const center = userLocation
    ? [
        userLocation.latitude,
        userLocation.longitude,
      ]
    : defaultCenter;

  // Convert GeoJSON coordinates:
  // [longitude, latitude]
  // into Leaflet coordinates:
  // [latitude, longitude]
  const routePositions =
    route?.geometry?.coordinates?.map(
      ([longitude, latitude]) => [
        latitude,
        longitude,
      ]
    ) || [];

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={true}
      className="leaflet-map"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        userLocation={userLocation}
        destination={destination}
        route={route}
      />

      {/* USER LOCATION */}
      {userLocation && (
        <CircleMarker
          center={[
            userLocation.latitude,
            userLocation.longitude,
          ]}
          radius={9}
          pathOptions={{
            color: "#ffffff",
            weight: 3,
            fillColor: "#2563eb",
            fillOpacity: 1,
          }}
        >
          <Popup>
            <strong>Your Current Location</strong>
            <br />
            Latitude:{" "}
            {userLocation.latitude.toFixed(6)}
            <br />
            Longitude:{" "}
            {userLocation.longitude.toFixed(6)}
            <br />
            Accuracy:{" "}
            {Math.round(userLocation.accuracy)} meters
          </Popup>
        </CircleMarker>
      )}

      {/* DESTINATION */}
      {destination && (
        <CircleMarker
          center={[
            destination.latitude,
            destination.longitude,
          ]}
          radius={10}
          pathOptions={{
            color: "#ffffff",
            weight: 3,
            fillColor: "#ff6b1a",
            fillOpacity: 1,
          }}
        >
          <Popup>
            <strong>{destination.name}</strong>
            <br />
            {destination.label}
            <br />
            Latitude:{" "}
            {destination.latitude.toFixed(6)}
            <br />
            Longitude:{" "}
            {destination.longitude.toFixed(6)}
          </Popup>
        </CircleMarker>
      )}

      {/* ACTUAL ROAD ROUTE */}
      {routePositions.length > 1 && (
        <Polyline
          positions={routePositions}
          pathOptions={{
            color: "#ff6b1a",
            weight: 6,
            opacity: 0.9,
          }}
        />
      )}
    </MapContainer>
  );
}

export default MapView;