import os
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.academic import Course
from app.models.listing import Listing, ListingCondition, ListingPhoto, ListingStatus, ListingType
from app.models.notification import Notification
from app.models.user import User
from app.models.wishlist import Wishlist
from app.schemas.listing import ListingCreate, ListingOut, ListingStatusUpdate

router = APIRouter(prefix="/listings", tags=["listings"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def _to_listing_out(listing: Listing) -> ListingOut:
    return ListingOut(
        id=listing.id,
        owner_id=listing.owner_id,
        owner_full_name=listing.owner.full_name,
        course_id=listing.course_id,
        title=listing.title,
        isbn=listing.isbn,
        edition=listing.edition,
        condition=listing.condition,
        type=listing.type,
        price=listing.price,
        status=listing.status,
        photos=[p.url for p in listing.photos],
    )


def _notify_matching_wishlists(listing: Listing, db: Session) -> None:
    """Ελέγχει τη λίστα επιθυμιών όλων των άλλων χρηστών και ειδοποιεί όσους ταιριάζουν
    με τη νέα αγγελία, βάσει μαθήματος, ISBN, ή μερικού ταιριάσματος τίτλου."""
    candidates = db.query(Wishlist).filter(Wishlist.user_id != listing.owner_id).all()
    already_notified: set[int] = set()

    for item in candidates:
        if item.user_id in already_notified:
            continue

        matches = (
            (item.course_id is not None and item.course_id == listing.course_id)
            or (item.isbn and listing.isbn and item.isbn == listing.isbn)
            or (item.title and listing.title and item.title.lower() in listing.title.lower())
        )
        if matches:
            db.add(
                Notification(
                    user_id=item.user_id,
                    listing_id=listing.id,
                    content=f"Νέα αγγελία ταιριάζει με τη λίστα επιθυμιών σου: '{listing.title}'",
                )
            )
            already_notified.add(item.user_id)

    if already_notified:
        db.commit()


@router.post("/upload-photo")
async def upload_listing_photo(
    file: UploadFile = File(...),
    _current_user: User = Depends(get_current_user),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Μη αποδεκτός τύπος αρχείου. Επιτρέπονται μόνο αρχεία .jpg, .jpeg, .png, .webp",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Το μέγεθος του αρχείου υπερβαίνει το μέγιστο επιτρεπόμενο όριο (5 MB)",
        )

    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(filepath, "wb") as f:
        f.write(content)

    return {"url": f"/uploads/{filename}"}


@router.post("", response_model=ListingOut, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_in: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if listing_in.type == ListingType.sale and listing_in.price is None:
        raise HTTPException(status_code=400, detail="Απαιτείται τιμή για αγγελία πώλησης")

    data = listing_in.model_dump()
    photo_url = data.pop("photo_url", None)

    listing = Listing(owner_id=current_user.id, **data)
    if photo_url:
        listing.photos.append(ListingPhoto(url=photo_url))

    db.add(listing)
    db.commit()
    db.refresh(listing)

    _notify_matching_wishlists(listing, db)

    return _to_listing_out(listing)


@router.get("", response_model=list[ListingOut])
def search_listings(
    owner_id: Optional[int] = None,
    course_id: Optional[int] = None,
    department_id: Optional[int] = None,
    title: Optional[str] = None,
    isbn: Optional[str] = None,
    condition: Optional[ListingCondition] = None,
    type: Optional[ListingType] = None,
    status_filter: Optional[ListingStatus] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Listing)
    if status_filter is not None:
        query = query.filter(Listing.status == status_filter)

    if owner_id is not None:
        query = query.filter(Listing.owner_id == owner_id)

    if course_id is not None:
        query = query.filter(Listing.course_id == course_id)
    if department_id is not None:
        query = query.join(Course, Listing.course_id == Course.id).filter(
            Course.department_id == department_id
        )
    if title:
        query = query.filter(Listing.title.ilike(f"%{title}%"))
    if isbn:
        query = query.filter(Listing.isbn == isbn)
    if condition is not None:
        query = query.filter(Listing.condition == condition)
    if type is not None:
        query = query.filter(Listing.type == type)

    return [_to_listing_out(listing) for listing in query.all()]


@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if listing is None:
        raise HTTPException(status_code=404, detail="Η αγγελία δεν βρέθηκε")
    return _to_listing_out(listing)


@router.patch("/{listing_id}/status", response_model=ListingOut)
def update_listing_status(
    listing_id: int,
    payload: ListingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if listing is None:
        raise HTTPException(status_code=404, detail="Η αγγελία δεν βρέθηκε")
    if listing.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Μόνο ο ιδιοκτήτης μπορεί να την αλλάξει")

    listing.status = payload.status
    db.commit()
    db.refresh(listing)
    return _to_listing_out(listing)
