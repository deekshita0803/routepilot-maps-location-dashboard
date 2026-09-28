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
}) {
  const [focused, setFocused] =
    useState(false);

  /*
   * =========================
   * DYNAMIC SEARCH
   * =========================
   *
   * Search automatically while typing.
   */
  useEffect(() => {
    if (!focused) {
      return;
    }

    /*
     * IMPORTANT:
     * Use the original query.
     * Do not modify it.
     */
    const value = query;

    /*
     * Don't search for one character.
     */
    if (value.trim().length < 2) {
      return;
    }

    /*
     * If the user just pressed SPACE,
     * wait for the next word.
     *
     * Example:
     *
     * "durga "
     *
     * remains exactly "durga "
     * inside the input.
     */
    if (value.endsWith(" ")) {
      return;
    }

    const timer = setTimeout(() => {
      onSearch(value);
    }, 600);

    return () => {
      clearTimeout(timer);
    };
  }, [
    query,
    focused,
    onSearch,
  ]);

  /*
   * =========================
   * KEYBOARD
   * =========================
   */

  const handleKeyDown = (
    event
  ) => {
    /*
     * ENTER = search.
     */
    if (event.key === "Enter") {
      event.preventDefault();

      if (query.trim()) {
        onSearch(query);
      }

      return;
    }

    /*
     * IMPORTANT:
     *
     * There is intentionally
     * NO SPACE handling here.
     *
     * Spacebar is handled naturally
     * by the browser input.
     */
  };

  return (
    <section className="search-panel">
      <div className="search-input-wrap">
        <span className="search-icon">
          ⌕
        </span>

        <input
          type="text"
          value={query}
          aria-label="Search destination"
          placeholder="Search nearby places, addresses or landmarks"
          autoComplete="off"
          spellCheck={false}
          onFocus={() =>
            setFocused(true)
          }
          onChange={(event) => {
            /*
             * IMPORTANT:
             *
             * Store the EXACT value.
             *
             * DO NOT use:
             *
             * event.target.value.trim()
             *
             * because that would break
             * spaces while typing.
             */
            setQuery(
              event.target.value
            );

            setFocused(true);
          }}
          onKeyDown={
            handleKeyDown
          }
        />

        {query && (
          <button
            type="button"
            className="clear-input"
            onClick={() => {
              setQuery("");
              setFocused(true);
            }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}

        <button
          type="button"
          className="search-btn"
          disabled={
            searching ||
            !query.trim()
          }
          onClick={() => {
            if (query.trim()) {
              onSearch(query);
            }
          }}
        >
          {searching
            ? "..."
            : "Search"}
        </button>
      </div>

      {/* =========================
          QUICK DESTINATIONS
      ========================= */}

      {focused && !query && (
        <div className="suggestion-area">
          <div className="suggestion-title">
            Quick destinations
          </div>

          <div className="quick-grid">
            {quickPlaces.map(
              (place) => (
                <button
                  type="button"
                  key={place}
                  onClick={() => {
                    setQuery(place);
                    setFocused(false);
                    onSearch(place);
                  }}
                >
                  {place}
                </button>
              )
            )}
          </div>

          {recentSearches.length >
            0 && (
            <>
              <div className="suggestion-title recent-title">
                Recent searches
              </div>

              <div className="recent-list">
                {recentSearches
                  .slice(0, 5)
                  .map((place) => (
                    <button
                      type="button"
                      key={place.id}
                      onClick={() => {
                        setFocused(
                          false
                        );

                        onRecentSelect(
                          place
                        );
                      }}
                    >
                      <span>↗</span>

                      <span>
                        <strong>
                          {
                            place.name
                          }
                        </strong>

                        <small>
                          {
                            place.label
                          }
                        </small>
                      </span>
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================
          SEARCH RESULTS
      ========================= */}

      {focused &&
        query.trim().length >=
          2 && (
          <div className="results-panel">
            {searching && (
              <div className="empty-state">
                Searching...
              </div>
            )}

            {!searching &&
              results.length > 0 &&
              results.map(
                (result) => (
                  <button
                    type="button"
                    className="result-row"
                    key={result.id}
                    onClick={() => {
                      setFocused(
                        false
                      );

                      onSelect(
                        result
                      );
                    }}
                  >
                    <span className="result-pin">
                      ●
                    </span>

                    <span className="result-text">
                      <strong>
                        {
                          result.name
                        }
                      </strong>

                      <small>
                        {
                          result.label
                        }
                      </small>
                    </span>

                    {result.distanceKm !=
                      null && (
                      <span className="result-distance">
                        {result.distanceKm <
                        1
                          ? `${Math.round(
                              result.distanceKm *
                                1000
                            )} m`
                          : `${result.distanceKm.toFixed(
                              1
                            )} km`}
                      </span>
                    )}

                    <span className="result-arrow">
                      ›
                    </span>
                  </button>
                )
              )}

            {!searching &&
              results.length ===
                0 && (
                <div className="empty-state">
                  No matching locations
                  found.
                </div>
              )}
          </div>
        )}
    </section>
  );
}