const ROUTING_URL =
  import.meta.env.VITE_ROUTING_URL ||
  "https://router.project-osrm.org/route/v1/driving";

export async function getRoute(origin, destination) {
  const coordinates = `${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
  const url = `${ROUTING_URL}/${coordinates}`;

  const requestUrl = new URL(url);
  requestUrl.searchParams.set("overview", "full");
  requestUrl.searchParams.set("geometries", "geojson");
  requestUrl.searchParams.set("steps", "false");

  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error(`Routing service returned ${response.status}`);
  }

  const data = await response.json();
  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("Unable to find a route between these locations.");
  }

  const route = data.routes[0];

  return {
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    geometry: route.geometry,
  };
}