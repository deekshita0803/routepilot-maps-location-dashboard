import { useEffect, useState } from "react";

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
  destination,
}) {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Enter") {
        onSearch();
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [onSearch]);

  return (
    <section className="search-panel">
      <div className="search-input-wrap">
        <span className="search-icon">⌕</span>

        <input
          aria-label="Search destination"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setFocused(true);
          }}
          onFocus={() => setFocused(true)}
          placeholder="Search nearby places, addresses or landmarks"
        />

        {query && (
          <button
            className="clear-input"
            onClick={() => {
              setQuery("");
              setFocused(false);
            }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}

        <button
          className="search-btn"
          onClick={onSearch}
          disabled={searching}
        >
          {searching ? "..." : "Search"}
        </button>
      </div>

      {/* Quick destinations */}
      {focused && !query && !destination && (
        <div className="suggestion-area">
          <div className="suggestion-title">Quick destinations</div>

          <div className="quick-grid">
            {quickPlaces.map((place) => (
              <button
                key={place}
                onClick={() => {
                  setQuery(place);
                  onSearch(place);
                  setFocused(false);
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

      {/* Search results */}
      {focused && query && !destination && (
        <div className="results-panel">
          {searching && (
            <div className="empty-state">
              Searching...
            </div>
          )}

          {!searching && results.length === 0 && (
            <div className="empty-state">
              No nearby locations found. Try a place, landmark or full
              address.
            </div>
          )}

          {!searching &&
            results.map((result) => (
              <button
                className="result-row"
                key={result.id}
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

                <span className="result-arrow">›</span>
              </button>
            ))}
        </div>
      )}
    </section>
  );
}