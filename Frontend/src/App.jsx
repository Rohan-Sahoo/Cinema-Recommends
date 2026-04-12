// App.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

import Header from "./components/Header";
import MovieSearch from "./components/MovieSearch";
import RecommendationResults from "./components/RecommendationResults";
import LoadingState from "./components/LoadingState";
import Footer from "./components/Footer";

function App() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Fetch all movies on mount
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/movies")
      .then((res) => setMovies(res.data.movies))
      .catch((err) => console.error(err));
  }, []);

  const handleQueryChange = (value) => {
    setQuery(value);
    setSelected("");
    setOpen(true);
  };

  const handleSelect = (m) => {
    setSelected(m);
    setQuery(m);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setSelected("");
    setOpen(false);
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

      <Header />

      <main className="main">
        <MovieSearch
          movies={movies}
          query={query}
          selected={selected}
          open={open}
          loading={loading}
          onQueryChange={handleQueryChange}
          onSelect={handleSelect}
          onClear={handleClear}
          onOpenChange={setOpen}
          onGetRecommendations={getRecommendations}
        />

        <RecommendationResults recommendations={recommendations} />

        <LoadingState loading={loading} />
      </main>

      <Footer />
    </div>
  );
}

export default App;
