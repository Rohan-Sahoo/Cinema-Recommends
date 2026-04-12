// components/LoadingState.jsx
function LoadingState({ loading }) {
  if (!loading) return null;

  return (
    <div className="loading-state">
      <div className="loading-reel">
        <div className="reel-ring" />
        <div className="reel-ring reel-ring-2" />
        <span className="reel-dot" />
      </div>
      <p className="loading-text">Searching the archives…</p>
    </div>
  );
}

export default LoadingState;
