const ROUTING_URL =
  "https://router.project-osrm.org/route/v1/driving";

export async function getRoute(origin, destination) {
  const coordinates =
    `${origin.longitude},${origin.latitude};` +
    `${destination.longitude},${destination.latitude}`;

  const url =
    `${ROUTING_URL}/${coordinates}` +
    "?overview=full&geometries=geojson";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Routing service returned ${response.status}`
    );
  }

  const data = await response.json();

  if (
    data.code !== "Ok" ||
    !data.routes ||
    data.routes.length === 0
  ) {
    throw new Error(
      "Unable to find a route between these locations."
    );
  }

  const route = data.routes[0];

  return {
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    geometry: route.geometry,
  };
}