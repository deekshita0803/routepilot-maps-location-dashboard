import { useState } from "react";

function SearchPanel({
  onSearch,
  results,
  loading,
  onSelect,
  recentSearches = [],
  onRecentSelect,
}) {
  const [query, setQuery] =
    useState("");

  const [
    focused,
    setFocused,
  ] = useState(false);

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    const value =
      query.trim();

    if (!value) {
      return;
    }

    onSearch(value);
  };

  const handleRecentClick = (
    place
  ) => {
    setQuery(place.name);

    onRecentSelect(place);
  };

  return (
    <section className="search-panel">

      <form
        className="search-box"
        onSubmit={handleSubmit}
      >

        <span className="search-icon">
          ⌕
        </span>

        <input
          type="text"
          value={query}
          placeholder="Search a place, address or landmark"
          onChange={(event) =>
            setQuery(
              event.target.value
            )
          }
          onFocus={() =>
            setFocused(true)
          }
          aria-label="Search destination"
        />

        {query && (
          <button
            type="button"
            className="clear-search"
            onClick={() =>
              setQuery("")
            }
          >
            ×
          </button>
        )}

        <button
          type="submit"
          className="search-submit"
          disabled={loading}
        >
          {loading
            ? "Searching..."
            : "Search"}
        </button>

      </form>

      {/* RECENT SEARCHES */}

      {focused &&
        !query &&
        recentSearches.length >
          0 && (
          <div className="search-dropdown">

            <div className="dropdown-title">
              Recent searches
            </div>

            {recentSearches.map(
              (place) => (
                <button
                  type="button"
                  className="recent-item"
                  key={place.id}
                  onClick={() =>
                    handleRecentClick(
                      place
                    )
                  }
                >

                  <span className="recent-icon">
                    ↗
                  </span>

                  <span>
                    <strong>
                      {place.name}
                    </strong>

                    <small>
                      {place.label}
                    </small>
                  </span>

                </button>
              )
            )}

          </div>
        )}

      {/* RESULTS */}

      {results.length > 0 && (
        <div className="search-dropdown">

          <div className="dropdown-title">
            Search results
          </div>

          {results.map(
            (result) => (
              <button
                type="button"
                className="result-item"
                key={result.id}
                onClick={() =>
                  onSelect(result)
                }
              >

                <span className="result-icon">
                  ●
                </span>

                <span>
                  <strong>
                    {result.name}
                  </strong>

                  <small>
                    {result.label}
                  </small>
                </span>

                <span className="result-arrow">
                  ›
                </span>

              </button>
            )
          )}

        </div>
      )}

    </section>
  );
}

export default SearchPanel;