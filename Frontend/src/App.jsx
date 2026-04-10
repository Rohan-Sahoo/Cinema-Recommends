import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css"

function App() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/movies")
      .then((res) => setMovies(res.data.movies))
      .catch((err) => console.error(err));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        listRef.current && !listRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim()
    ? movies.filter((m) => m.toLowerCase().includes(query.toLowerCase()))
    : movies;

  const handleSelect = (m) => {
    setSelected(m);
    setQuery(m);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelected("");
    setOpen(true);
  };

  const handleClear = () => {
    setQuery("");
    setSelected("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const getRecommendations = () => {
    if (!selected) return;
    setLoading(true);
    setRecommendations([]);
    axios
      .get(`http://127.0.0.1:8000/recommend/${encodeURIComponent(selected)}`)
      .then((res) => {
        setRecommendations(res.data.recommendations);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div className="app">
      {/* Grain overlay */}
      <div className="grain" />

      {/* Ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo-mark">
            <span className="logo-icon">▶</span>
          </div>
          <span className="brand">CINÉMA</span>
          <span className="brand-sub">RECOMMENDS</span>
        </div>
        <p className="tagline">YOUR NEXT OBSESSION AWAITS</p>
      </header>

      {/* Main */}
      <main className="main">
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
                onChange={handleInputChange}
                onFocus={() => { if (filtered.length > 0) setOpen(true); }}
                autoComplete="off"
                spellCheck="false"
              />
              {query && (
                <button className="clear-btn" onClick={handleClear} aria-label="Clear">✕</button>
              )}
              {selected && <span className="confirmed-tick">✔</span>}
            </div>

            {open && filtered.length > 0 && (
              <ul className="dropdown-list" role="listbox" ref={listRef}>
                {filtered.map((m, i) => {
                  // Highlight matching part
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
                      onMouseDown={() => handleSelect(m)}
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
              <div className="no-results">No titles found for "<em>{query}</em>"</div>
            )}
          </div>

          <button
            className={`cta-btn ${!selected ? "is-disabled" : ""}`}
            onClick={getRecommendations}
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

        {/* Results */}
        {recommendations.length > 0 && (
          <section className="results">
            <div className="results-header">
              <span className="results-rule" />
              <p className="results-label">RECOMMENDED FOR YOU</p>
              <span className="results-rule" />
            </div>

            <div className="cards-grid">
              {recommendations.map((m, i) => (
                <article
                  key={i}
                  className="movie-card"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="poster-wrap">
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="poster-img"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="poster-fallback">
                      <span>🎬</span>
                    </div>
                    <div className="poster-overlay">
                      <span className="overlay-num">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                  </div>
                  <p className="movie-title">{m.title}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {loading && (
          <div className="loading-state">
            <div className="loading-reel">
              <div className="reel-ring" />
              <div className="reel-ring reel-ring-2" />
              <span className="reel-dot" />
            </div>
            <p className="loading-text">Searching the archives…</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <span>© CINÉMA RECOMMENDS</span>
        <span className="footer-dot">·</span>
        <span>POWERED BY AI</span>
      </footer>
    </div>
  );
}

export default App;
