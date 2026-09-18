import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.deps import get_current_user
from app.api.routers.academic import router as academic_router
from app.api.routers.admin_academic import router as admin_academic_router
from app.api.routers.admin_moderation import router as admin_moderation_router
from app.api.routers.auth import router as auth_router
from app.api.routers.listings import router as listings_router
from app.api.routers.notifications import router as notifications_router
from app.api.routers.proposals import router as proposals_router
from app.api.routers.reports import router as reports_router
from app.api.routers.wishlist import router as wishlist_router
from app.models.user import User
from app.schemas.user import UserOut

app = FastAPI(title="ReBook API")

# Επιτρέπουμε στο React dev server να καλεί το API κατά την ανάπτυξη.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(academic_router)
app.include_router(admin_academic_router)
app.include_router(admin_moderation_router)
app.include_router(listings_router)
app.include_router(proposals_router)
app.include_router(wishlist_router)
app.include_router(notifications_router)
app.include_router(reports_router)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Protected endpoint μόνο για επιβεβαίωση ότι το JWT flow δουλεύει."""
    return current_user
