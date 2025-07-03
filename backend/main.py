"""Main FastAPI application with properly separated routes"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import auth_router
from routes.deals import deals_router

# Initialize FastAPI application
app = FastAPI(
    title="Altius Capital API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication routes under /auth prefix
app.include_router(auth_router, prefix="/auth")

# Include deals routes under /deals prefix  
app.include_router(deals_router, prefix="/deals")


print("\033[92mServer is running on http://localhost:8000\033[0m")
print("\033[92mAPI Documentation available at: http://localhost:8000/docs\033[0m")