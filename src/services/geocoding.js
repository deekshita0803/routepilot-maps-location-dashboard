const GEOCODER_URL =
  "https://photon.komoot.io/api/";

/* =========================
   TEXT NORMALIZATION
========================= */

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(value) {
  return normalizeText(value).replace(
    /\s/g,
    ""
  );
}

function getWords(value) {
  return normalizeText(value)
    .split(" ")
    .filter(Boolean);
}

/* =========================
   DISTANCE
========================= */

function calculateDistanceKm(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const earthRadius = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) /
    180;

  const dLon =
    ((lon2 - lon1) * Math.PI) /
    180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLon / 2) ** 2;

  return (
    earthRadius *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

/* =========================
   EDIT DISTANCE
========================= */

function editDistance(a, b) {
  const aa = normalizeText(a);
  const bb = normalizeText(b);

  const dp = Array.from(
    {
      length: aa.length + 1,
    },
    () =>
      Array(
        bb.length + 1
      ).fill(0)
  );

  for (
    let i = 0;
    i <= aa.length;
    i++
  ) {
    dp[i][0] = i;
  }

  for (
    let j = 0;
    j <= bb.length;
    j++
  ) {
    dp[0][j] = j;
  }

  for (
    let i = 1;
    i <= aa.length;
    i++
  ) {
    for (
      let j = 1;
      j <= bb.length;
      j++
    ) {
      const cost =
        aa[i - 1] ===
        bb[j - 1]
          ? 0
          : 1;

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] +
          cost
      );
    }
  }

  return dp[aa.length][bb.length];
}

/* =========================
   RELEVANCE
========================= */

function calculateRelevance(
  place,
  query
) {
  const q =
    normalizeText(query);

  const qc =
    compactText(query);

  const name =
    normalizeText(place.name);

  const nc =
    compactText(place.name);

  const queryWords =
    getWords(query);

  const nameWords =
    getWords(place.name);

  /* Exact name */
  if (name === q) {
    return 100;
  }

  /* Exact compact name */
  if (nc === qc) {
    return 98;
  }

  /* All words in name */
  const allWordsMatch =
    queryWords.length > 0 &&
    queryWords.every(
      (word) =>
        name.includes(word)
    );

  if (allWordsMatch) {
    return 95;
  }

  /* Fuzzy matching */
  let fuzzyMatches = 0;

  for (const queryWord of queryWords) {
    let bestDistance =
      Infinity;

    for (const nameWord of nameWords) {
      const distance =
        editDistance(
          queryWord,
          nameWord
        );

      bestDistance =
        Math.min(
          bestDistance,
          distance
        );
    }

    const allowedDistance =
      queryWord.length >= 8
        ? 2
        : queryWord.length >= 5
        ? 1
        : 0;

    if (
      bestDistance <=
      allowedDistance
    ) {
      fuzzyMatches++;
    }
  }

  if (
    queryWords.length > 0 &&
    fuzzyMatches ===
      queryWords.length
  ) {
    return 93;
  }

  /* Starts with query */
  if (
    name.startsWith(q) ||
    nc.startsWith(qc)
  ) {
    return 90;
  }

  /* Query occurs in name */
  if (
    name.includes(q) ||
    nc.includes(qc)
  ) {
    return 85;
  }

  /* Some words match */
  if (fuzzyMatches > 0) {
    return 70;
  }

  /* Direct word matching */
  const directMatches =
    queryWords.filter(
      (word) =>
        name.includes(word)
    ).length;

  if (directMatches > 0) {
    return 65;
  }

  /* Address matching */
  const label =
    normalizeText(
      place.label
    );

  if (
    queryWords.some(
      (word) =>
        label.includes(word)
    )
  ) {
    return 30;
  }

  return 0;
}

/* =========================
   PHOTON SEARCH
========================= */

async function photonSearch(
  query,
  userLocation
) {
  const url = new URL(
    GEOCODER_URL
  );

  url.searchParams.set(
    "q",
    query
  );

  /*
   * Request many results.
   */
  url.searchParams.set(
    "limit",
    "50"
  );

  url.searchParams.set(
    "lang",
    "en"
  );

  /*
   * Location is a BIAS,
   * NOT a filter.
   */
  if (userLocation) {
    url.searchParams.set(
      "lat",
      String(
        userLocation.lat
      )
    );

    url.searchParams.set(
      "lon",
      String(
        userLocation.lon
      )
    );

    url.searchParams.set(
      "zoom",
      "12"
    );

    url.searchParams.set(
      "location_bias_scale",
      "0.5"
    );
  }

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Search service returned ${response.status}`
    );
  }

  return response.json();
}

/* =========================
   CONVERT RESULTS
========================= */

function convertFeatures(
  features,
  userLocation
) {
  return (features || [])
    .map((feature) => {
      const coordinates =
        feature.geometry
          ?.coordinates;

      if (
        !coordinates ||
        coordinates.length < 2
      ) {
        return null;
      }

      const [lon, lat] =
        coordinates;

      const p =
        feature.properties || {};

      const name =
        p.name ||
        p.street ||
        p.city ||
        p.country ||
        "Unknown place";

      const label = [
        p.city,
        p.state,
        p.country,
      ]
        .filter(Boolean)
        .filter(
          (value, index, array) =>
            array.indexOf(
              value
            ) === index &&
            value !== name
        )
        .join(", ");

      const distanceKm =
        userLocation
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
        label:
          label ||
          "Location result",
        lat,
        lon,
        distanceKm,
      };
    })
    .filter(Boolean);
}

/* =========================
   MAIN SEARCH
========================= */

export async function searchPlaces(
  query,
  userLocation = null
) {
  const trimmed =
    query.trim();

  if (!trimmed) {
    return [];
  }

  /*
   * Main location-biased search.
   *
   * IMPORTANT:
   * This does NOT restrict results
   * to 100 km / 200 km etc.
   */
  const response =
    await photonSearch(
      trimmed,
      userLocation
    );

  let places =
    convertFeatures(
      response.features,
      userLocation
    );

  /*
   * For joined words such as:
   *
   * narsimhatemple
   *
   * try common spaced forms.
   */
  const compact =
    compactText(trimmed);

  const extraQueries = [];

  if (
    compact.includes(
      "narsimhatemple"
    )
  ) {
    extraQueries.push(
      "narsimha temple"
    );
  }

  if (
    compact.includes(
      "narasimhatemple"
    )
  ) {
    extraQueries.push(
      "narasimha temple"
    );
  }

  if (
    compact.includes(
      "durgatemple"
    )
  ) {
    extraQueries.push(
      "durga temple"
    );
  }

  if (
    compact.includes(
      "srm university"
    )
  ) {
    extraQueries.push(
      "SRM University"
    );
  }

  if (
    compact.includes(
      "vijayawadaairport"
    )
  ) {
    extraQueries.push(
      "Vijayawada Airport"
    );
  }

  for (
    const extraQuery of extraQueries
  ) {
    try {
      const extraResponse =
        await photonSearch(
          extraQuery,
          userLocation
        );

      places = [
        ...places,
        ...convertFeatures(
          extraResponse.features,
          userLocation
        ),
      ];
    } catch {
      // Keep original results.
    }
  }

  /*
   * Remove duplicate locations.
   */
  const unique =
    new Map();

  for (
    const place of places
  ) {
    const key = [
      normalizeText(
        place.name
      ),
      Number(place.lat).toFixed(
        5
      ),
      Number(place.lon).toFixed(
        5
      ),
    ].join("|");

    if (!unique.has(key)) {
      unique.set(
        key,
        place
      );
    }
  }

  places =
    Array.from(
      unique.values()
    );

  /*
   * Calculate relevance.
   */
  places = places.map(
    (place) => ({
      ...place,
      relevance:
        calculateRelevance(
          place,
          trimmed
        ),
    })
  );

  /*
   * Keep matching results.
   *
   * Distant relevant results
   * are NOT removed.
   */
  const relevant =
    places.filter(
      (place) =>
        place.relevance > 0
    );

  if (relevant.length > 0) {
    places = relevant;
  }

  /*
   * =========================
   * FINAL RANKING
   * =========================
   *
   * RELEVANCE FIRST
   * DISTANCE SECOND
   *
   * This means:
   *
   * Relevant nearby
   *       ↓
   * Relevant farther
   *       ↓
   * weaker matches
   */
  places.sort((a, b) => {
    if (
      b.relevance !==
      a.relevance
    ) {
      return (
        b.relevance -
        a.relevance
      );
    }

    if (
      a.distanceKm !==
        null &&
      b.distanceKm !==
        null
    ) {
      return (
        a.distanceKm -
        b.distanceKm
      );
    }

    return 0;
  });

  /*
   * Keep 25 results.
   */
  return places
    .slice(0, 25)
    .map(
      ({
        relevance,
        ...place
      }) => place
    );
}