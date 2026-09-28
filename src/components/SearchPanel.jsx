import { useEffect, useRef, useState } from "react";

const quickPlaces = [
  "SRM University AP",
  "Vijayawada Airport",
  "Bengaluru",
  "Hyderabad",
  "MG Road",
];

export default function SearchPanel({
  query,
  setQuery,
  results,
  onSearch,
  onSelect,
  searching,
  recentSearches,
  onRecentSelect,
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  /*
   * Dynamic search:
   * Search automatically while the user types.
   *
   * The small delay prevents sending a request for every
   * single keystroke.
   */
  useEffect(() => {
    const value = query.trim();

    if (!focused || !value) {
      return;
    }

    const timer = setTimeout(() => {
      onSearch(value);
    }, 450);

    return () => clearTimeout(timer);
  }, [query, focused, onSearch]);

  /*
   * Enter key searches immediately.
   *
   * Spacebar is NOT captured here.
   * Therefore normal spaces work correctly.
   */
  useEffect(() => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onSearch();
      }
    };

    input.addEventListener("keydown", handleKeyDown);

    return () => {
      input.removeEventListener("keydown", handleKeyDown);
    };
  }, [onSearch]);

  return (
    <section className="search-panel">
      <div className="search-input-wrap">
        <span className="search-icon">⌕</span>

        <input
          ref={inputRef}
          aria-label="Search destination"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search nearby places, addresses or landmarks"
          autoComplete="off"
        />

        {query && (
          <button
            className="clear-input"
            onClick={() => {
              setQuery("");
              setFocused(true);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            type="button"
          >
            ×
          </button>
        )}

        <button
          className="search-btn"
          onClick={() => onSearch()}
          disabled={searching}
          type="button"
        >
          {searching ? "..." : "Search"}
        </button>
      </div>

      {focused && !query && (
        <div className="suggestion-area">
          <div className="suggestion-title">
            Quick destinations
          </div>

          <div className="quick-grid">
            {quickPlaces.map((place) => (
              <button
                key={place}
                type="button"
                onClick={() => {
                  setQuery(place);
                  setFocused(true);
                  onSearch(place);
                }}
              >
                {place}
              </button>
            ))}
          </div>

          {recentSearches.length > 0 && (
            <>
              <div className="suggestion-title recent-title">
                Recent searches
              </div>

              <div className="recent-list">
                {recentSearches.slice(0, 5).map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => {
                      setFocused(false);
                      onRecentSelect(place);
                    }}
                  >
                    <span>↗</span>

                    <span>
                      <strong>{place.name}</strong>
                      <small>{place.label}</small>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {focused && query && (
        <div className="results-panel">
          {searching && (
            <div className="empty-state">
              Searching nearby and other relevant locations...
            </div>
          )}

          {!searching && results.length === 0 && (
            <div className="empty-state">
              No locations found. Try a place, landmark or full address.
            </div>
          )}

          {!searching &&
            results.map((result) => (
              <button
                className="result-row"
                key={result.id}
                type="button"
                onClick={() => {
                  setFocused(false);
                  onSelect(result);
                }}
              >
                <span className="result-pin">●</span>

                <span className="result-text">
                  <strong>{result.name}</strong>
                  <small>{result.label}</small>
                </span>

                {result.distanceKm !== null &&
                  result.distanceKm !== undefined && (
                    <span className="result-distance">
                      {result.distanceKm < 1
                        ? `${Math.round(
                            result.distanceKm * 1000
                          )} m`
                        : `${result.distanceKm.toFixed(1)} km`}
                    </span>
                  )}

                <span className="result-arrow">›</span>
              </button>
            ))}
        </div>
      )}
    </section>
  );
}