// components/MovieSearch.jsx
import { useEffect, useRef } from "react";

function MovieSearch({
  movies,
  query,
  selected,
  open,
  loading,
  onQueryChange,
  onSelect,
  onClear,
  onOpenChange,
  onGetRecommendations,
}) {
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        listRef.current &&
        !listRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOpenChange]);

  const filtered = query.trim()
    ? movies.filter((m) => m.toLowerCase().includes(query.toLowerCase()))
    : movies;

  return (
    <div className="selector-card">
      <p className="selector-label">CHOOSE YOUR FILM</p>

      {/* Searchable combobox */}
      <div className={`dropdown ${open && filtered.length > 0 ? "is-open" : ""}`}>
        <div className="search-input-wrap" ref={inputRef}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Type a movie title…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => {
              if (filtered.length > 0) onOpenChange(true);
            }}
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button className="clear-btn" onClick={onClear} aria-label="Clear">
              ✕
            </button>
          )}
          {selected && <span className="confirmed-tick">✔</span>}
        </div>

        {open && filtered.length > 0 && (
          <ul className="dropdown-list" role="listbox" ref={listRef}>
            {filtered.map((m, i) => {
              const idx = m.toLowerCase().indexOf(query.toLowerCase());
              const before = m.slice(0, idx);
              const match = m.slice(idx, idx + query.length);
              const after = m.slice(idx + query.length);
              return (
                <li
                  key={i}
                  role="option"
                  aria-selected={m === selected}
                  className={`dropdown-item ${m === selected ? "is-active" : ""}`}
                  onMouseDown={() => onSelect(m)}
                >
                  <span className="item-index">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    {before}
                    <mark className="highlight">{match}</mark>
                    {after}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {open && query && filtered.length === 0 && (
          <div className="no-results">
            No titles found for "<em>{query}</em>"
          </div>
        )}
      </div>

      <button
        className={`cta-btn ${!selected ? "is-disabled" : ""}`}
        onClick={onGetRecommendations}
        disabled={!selected}
      >
        {loading ? (
          <span className="spinner" />
        ) : (
          <>
            <span className="cta-icon">✦</span>
            FIND SIMILAR FILMS
          </>
        )}
      </button>
    </div>
  );
}

export default MovieSearch;
