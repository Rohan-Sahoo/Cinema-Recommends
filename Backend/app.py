from fastapi import FastAPI, HTTPException
import pickle
import pandas as pd
import requests
from concurrent.futures import ThreadPoolExecutor
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

# ✅ In-memory poster cache — avoids re-fetching the same movie twice
POSTER_CACHE = {}

# ---------------- FETCH POSTER ---------------- #
def fetch_poster(movie_id):
    if movie_id in POSTER_CACHE:
        return POSTER_CACHE[movie_id]

    url = (
        f"https://api.themoviedb.org/3/movie/{movie_id}"
        f"?api_key=26f543dc7746a664d36cec9cb5f9ae6e&language=en-US"
    )
    try:
        response = requests.get(url, timeout=3)  # ⬅️ short timeout, fail fast
        data = response.json()
        poster_path = data.get("poster_path")
        result = (
            "https://image.tmdb.org/t/p/w500/" + poster_path
            if poster_path
            else "https://via.placeholder.com/500x750?text=No+Image"
        )
    except Exception as e:
        print(f"Poster fetch error (id={movie_id}):", e)
        result = "https://via.placeholder.com/500x750?text=No+Image"

    POSTER_CACHE[movie_id] = result
    return result

# ---------------- RECOMMEND FUNCTION ---------------- #
def recommend(title):
    match = movie[movie['title'].str.lower() == title.strip().lower()]

    if match.empty:
        return None

    movie_index = match.index[0]
    distances = similarity[movie_index]

    # Get top 5 similar movies (excluding itself)
    movies_list = sorted(
        list(enumerate(distances)), reverse=True, key=lambda x: x[1]
    )[1:6]

    # Fetch all 5 posters in parallel instead of one by one
    def build_entry(item):
        i, _ = item
        return {
            "title": movie.iloc[i].title,
            "poster": fetch_poster(movie.iloc[i].movie_id)
        }

    with ThreadPoolExecutor(max_workers=5) as executor:
        recommended = list(executor.map(build_entry, movies_list))

    return recommended

# ---------------- MOVIES LIST API ---------------- #
@app.get("/movies")
def get_movies():
    try:
        return {"movies": movie['title'].tolist()}
    except Exception as e:
        print("Movies API error:", e)
        return {"movies": []}

# ---------------- RECOMMEND API ---------------- #
@app.get("/recommend/{title}")
def get_recommendations(title: str):
    results = recommend(title)

    if results is None:
        raise HTTPException(
            status_code=404,
            detail=f"Movie '{title}' not found in dataset."
        )

    return {"recommendations": results}