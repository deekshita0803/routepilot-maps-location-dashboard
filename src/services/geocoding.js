const GEOCODER_URL =
  "https://photon.komoot.io/api/";

export async function searchPlaces(query) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const url = new URL(GEOCODER_URL);

  url.searchParams.set("q", trimmedQuery);
  url.searchParams.set("limit", "6");
  url.searchParams.set("lang", "en");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Search service returned ${response.status}`
    );
  }

  const data = await response.json();

  return (data.features || []).map((feature) => {
    const [longitude, latitude] =
      feature.geometry.coordinates;

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
          array.indexOf(value) === index &&
          value !== name
      )
      .join(", ");

    return {
      id: `${latitude}-${longitude}-${name}`,
      name,
      label: label || "Location result",
      latitude,
      longitude,
    };
  });
}