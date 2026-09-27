const GEOCODER_URL = "https://photon.komoot.io/api/";

const MAX_NEARBY_DISTANCE_KM = 100;

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return (
    earthRadius *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

export async function searchPlaces(query, userLocation = null) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const url = new URL(GEOCODER_URL);

  url.searchParams.set("q", trimmedQuery);
  url.searchParams.set("limit", userLocation ? "20" : "6");
  url.searchParams.set("lang", "en");

  if (userLocation) {
    url.searchParams.set("lat", String(userLocation.lat));
    url.searchParams.set("lon", String(userLocation.lon));
    url.searchParams.set("zoom", "10");
    url.searchParams.set("location_bias_scale", "0.2");
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Search service returned ${response.status}`);
  }

  const data = await response.json();

  let places = (data.features || []).map((feature) => {
    const [lon, lat] = feature.geometry.coordinates;
    const properties = feature.properties || {};

    const name =
      properties.name ||
      properties.street ||
      properties.city ||
      properties.country ||
      "Unknown place";

    const label = [
      properties.city,
      properties.state,
      properties.country,
    ]
      .filter(Boolean)
      .filter(
        (value, index, array) =>
          array.indexOf(value) === index && value !== name
      )
      .join(", ");

    const distanceKm = userLocation
      ? calculateDistanceKm(
          userLocation.lat,
          userLocation.lon,
          lat,
          lon
        )
      : null;

    return {
      id: `${lat}-${lon}-${name}`,
      name,
      label: label || "Location result",
      lat,
      lon,
      distanceKm,
    };
  });

  if (userLocation) {
    places = places
      .filter(
        (place) =>
          place.distanceKm !== null &&
          place.distanceKm <= MAX_NEARBY_DISTANCE_KM
      )
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  return places.slice(0, 7);
}