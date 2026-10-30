from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_tables
from app.routers import auth, dashboard, metrics, nutrition, workouts
from app.seed import seed_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs once when the server starts
    await create_tables()
    await seed_data()
    yield


app = FastAPI(title="FitLog API", version="1.0.0", lifespan=lifespan)

# Allow the mobile app / Expo web to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(workouts.router, prefix="/api")
app.include_router(nutrition.router, prefix="/api")
app.include_router(metrics.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/")
async def home():
    return {"message": "FitLog API is running"}
