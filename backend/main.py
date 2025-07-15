from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import log_routes

app = FastAPI()

from fastapi import FastAPI

app = FastAPI()


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API de gestion des logs"}

# Register routes
app.include_router(log_routes.router)