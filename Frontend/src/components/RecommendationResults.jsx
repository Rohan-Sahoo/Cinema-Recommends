// components/RecommendationResults.jsx
function RecommendationResults({ recommendations }) {
  if (!recommendations.length) return null;

  return (
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
  );
}

export default RecommendationResults;
