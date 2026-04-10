from fastapi import FastAPI
import pickle
import pandas as pd
import requests
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ Enable CORS (for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load data
movies_dict = pickle.load(open('movies_dict.pkl', 'rb'))
movie = pd.DataFrame(movies_dict)
similarity = pickle.load(open('similarity.pkl', 'rb'))

# ✅ Clean titles (important for matching)
movie['title'] = movie['title'].str.strip()

# ---------------- FETCH POSTER ---------------- #
def fetch_poster(movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key=26f543dc7746a664d36cec9cb5f9ae6e&language=en-US"

    try:
        session = requests.Session()

        retry = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[500, 502, 503, 504]
        )

        adapter = HTTPAdapter(max_retries=retry)
        session.mount("https://", adapter)

        response = session.get(url, timeout=10)  # ⬅️ increased timeout
        data = response.json()

        poster_path = data.get("poster_path")

        if poster_path:
            return "https://image.tmdb.org/t/p/w500/" + poster_path
        else:
            return "https://via.placeholder.com/500x750?text=No+Image"

    except Exception as e:
        print("Poster fetch error:", e)
        return "https://via.placeholder.com/500x750?text=No+Image"


# ---------------- MOVIES LIST API ---------------- #
@app.get("/movies")
def get_movies():
    try:
        return {"movies": movie['title'].tolist()}
    except Exception as e:
        print("Movies API error:", e)
        return {"movies": []}