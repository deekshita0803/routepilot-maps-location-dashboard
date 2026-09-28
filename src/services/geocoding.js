const GEOCODER_URL = "https://photon.komoot.io/api/";

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

function convertResults(data, userLocation) {
  return (data.features || [])
    .map((feature) => {
      const coordinates = feature.geometry?.coordinates;

      if (!coordinates || coordinates.length < 2) {
        return null;
      }

      const [lon, lat] = coordinates;
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
    })
    .filter(Boolean);
}

async function fetchPlaces(
  query,
  userLocation,
  nearbySearch = false
) {
  const url = new URL(GEOCODER_URL);

  url.searchParams.set("q", query);

  // Ask for many results.
  url.searchParams.set("limit", "50");

  url.searchParams.set("lang", "en");

  /*
   * First request:
   * strongly bias the search around the user's location.
   */
  if (nearbySearch && userLocation) {
    url.searchParams.set("lat", String(userLocation.lat));
    url.searchParams.set("lon", String(userLocation.lon));

    // Smaller zoom value gives a wider geographic search area.
    url.searchParams.set("zoom", "10");

    // Stronger location preference.
    url.searchParams.set("location_bias_scale", "1");
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Search service returned ${response.status}`);
  }

  return response.json();
}

export async function searchPlaces(query, userLocation = null) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  /*
   * If we have the user's location:
   *
   * Request 1 = nearby/location-biased results
   * Request 2 = normal/global results
   *
   * This is important because the global request keeps
   * famous/far-away places such as Puri Jagannath Temple.
   */
  if (userLocation) {
    const [nearbyData, globalData] = await Promise.all([
      fetchPlaces(trimmedQuery, userLocation, true),
      fetchPlaces(trimmedQuery, null, false),
    ]);

    const nearbyPlaces = convertResults(
      nearbyData,
      userLocation
    );

    const globalPlaces = convertResults(
      globalData,
      userLocation
    );

    /*
     * Combine both sets.
     */
    const combined = [
      ...nearbyPlaces,
      ...globalPlaces,
    ];

    /*
     * Remove duplicate locations.
     */
    const uniquePlaces = [];

    const seen = new Set();

    for (const place of combined) {
      /*
       * Round coordinates slightly so the same place
       * returned by both searches is detected as duplicate.
       */
      const key = [
        place.name.toLowerCase().trim(),
        Number(place.lat).toFixed(4),
        Number(place.lon).toFixed(4),
      ].join("|");

      if (!seen.has(key)) {
        seen.add(key);
        uniquePlaces.push(place);
      }
    }

    /*
     * THIS IS THE IMPORTANT PART.
     *
     * Sort EVERYTHING by distance from the user.
     *
     * Therefore:
     *
     * 1. Nearest matching place
     * 2. Next nearest matching place
     * 3. Next nearest...
     * ...
     * Far-away famous places remain in the list.
     */
    uniquePlaces.sort((a, b) => {
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;

      return a.distanceKm - b.distanceKm;
    });

    return uniquePlaces.slice(0, 20);
  }

  /*
   * If browser location is unavailable,
   * still return normal search results.
   */
  const data = await fetchPlaces(
    trimmedQuery,
    null,
    false
  );

  return convertResults(data, null).slice(0, 20);
}