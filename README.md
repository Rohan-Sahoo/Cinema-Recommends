# 🎬 CINÉMA RECOMMENDS

A movie recommendation web app built with **React** (frontend) and **FastAPI** (backend), powered by a content-based filtering model using cosine similarity.

---

## 📸 Preview

> Select a movie from the searchable dropdown → get 5 similar film recommendations with posters fetched live from TMDB.

---

## 🗂️ Project Structure

```
Cinema-Recommends/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx                 # Logo, brand name, tagline
│   │   │   ├── MovieSearch.jsx            # Searchable dropdown combobox + CTA button
│   │   │   ├── RecommendationResults.jsx  # Movie cards grid with posters
│   │   │   ├── LoadingState.jsx           # Animated film reel loading indicator
│   │   │   └── Footer.jsx                 # Footer
│   │   ├── App.jsx                        # Root — owns all state & API calls
│   │   └── App.css                        # All styles (grain, orbs, cards, etc.)
│   └── package.json
│
├── Backend/
│   ├── app.py                             # FastAPI server
│   ├── requirements.txt                   # Python dependencies
│   ├── movies_dict.pkl                    # Movie metadata (title, movie_id)
│   └── similarity.pkl                     # Precomputed cosine similarity matrix (176MB — see note below)
│
└── README.md
```

---

## ⚙️ How It Works

```
User types movie title
        │
        ▼
React fetches /movies  ──►  FastAPI loads movies_dict.pkl  ──►  returns title list
        │
        ▼
User selects a movie & clicks "Find Similar Films"
        │
        ▼
React calls /recommend/{title}
        │
        ▼
FastAPI looks up movie index in DataFrame
        │
        ▼
Cosine similarity matrix queried → top 5 matches found
        │
        ▼
5 TMDB poster fetches run in parallel (ThreadPoolExecutor)
        │
        ▼
Results cached in POSTER_CACHE + returned to React
        │
        ▼
React renders movie cards with poster images
```

---

## 🚀 Getting Started

### Prerequisites

- Python **3.8+**
- Node.js **18+**
- A free [TMDB API key](https://www.themoviedb.org/settings/api)

---

### 1. Clone the repo

```bash
git clone https://github.com/Rohan-Sahoo/Cinema-Recommends.git
cd Cinema-Recommends
```

---

### 2. Backend Setup

```bash
cd Backend

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app:app --reload
```

Server runs at → `http://127.0.0.1:8000`

> ⚠️ **TMDB blocked on your network?** (common in India)
> Posters will fall back to a placeholder image. Enable a VPN (e.g. [ProtonVPN](https://protonvpn.com) — free tier works) before starting the server and posters will load normally.

---

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

App runs at → `http://localhost:5173`

---

## 🔌 API Reference

### `GET /movies`
Returns the full list of movie titles for the search dropdown.

**Response**
```json
{
  "movies": ["Avatar", "The Dark Knight", "Inception", "..."]
}
```

---

### `GET /recommend/{title}`
Returns 5 recommended movies similar to the given title.

**Example:** `GET /recommend/Avatar`

**Response**
```json
{
  "recommendations": [
    {
      "title": "Aliens vs Predator: Requiem",
      "poster": "https://image.tmdb.org/t/p/w500/..."
    },
    {
      "title": "Independence Day",
      "poster": "https://image.tmdb.org/t/p/w500/..."
    }
  ]
}
```

**Error — title not in dataset**
```json
{
  "detail": "Movie 'XYZ' not found in dataset."
}
```
Status: `404 Not Found`

---

## 📦 Tech Stack

### Backend

| Package | Purpose |
|---|---|
| `fastapi` | Web framework |
| `uvicorn` | ASGI server |
| `pandas` | DataFrame for movie metadata |
| `requests` | TMDB API HTTP calls |
| `pickle` | Loading precomputed model files |
| `concurrent.futures` | Parallel poster fetching |

### Frontend

| Package | Purpose |
|---|---|
| `react` | UI framework |
| `axios` | HTTP client for API calls |
| `vite` | Dev server & bundler |

---

## 🧠 ML Model

- **Type:** Content-based filtering
- **Method:** Cosine similarity on movie feature vectors
- **Input:** `movies_dict.pkl` — movie titles and TMDB IDs
- **Model:** `similarity.pkl` — precomputed N×N cosine similarity matrix
- **Inference:** At query time, the movie's row is retrieved from the matrix, sorted, and the top 5 non-self matches are returned

---

## 🗄️ Large File Handling

`similarity.pkl` is **176 MB** — exceeding GitHub's 100 MB per-file limit.

**Options to handle it:**

| Option | How |
|---|---|
| Git LFS | `git lfs track "*.pkl"` then push normally |
| Hugging Face Datasets | Upload via `huggingface_hub`, download at server startup |
| Google Drive | Share link, download with `gdown` in `app.py` |

To download from Hugging Face automatically at startup, add this to `app.py`:

```python
from huggingface_hub import hf_hub_download
import os

if not os.path.exists("similarity.pkl"):
    hf_hub_download(
        repo_id="YOUR_USERNAME/cinema-recommends-data",
        filename="similarity.pkl",
        repo_type="dataset",
        local_dir="."
    )
```


---

## 🙌 Acknowledgements

- [TMDB](https://www.themoviedb.org/) for movie metadata and poster images
- [FastAPI](https://fastapi.tiangolo.com/) for the blazing fast backend
- [Vite](https://vitejs.dev/) + [React](https://react.dev/) for the frontend
