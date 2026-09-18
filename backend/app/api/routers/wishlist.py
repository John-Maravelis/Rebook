from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.wishlist import Wishlist
from app.schemas.wishlist import WishlistCreate, WishlistOut

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.post("", response_model=WishlistOut, status_code=status.HTTP_201_CREATED)
def create_wishlist_item(
    payload: WishlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = Wishlist(user_id=current_user.id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("", response_model=list[WishlistOut])
def list_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wishlist_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(Wishlist).filter(Wishlist.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Δεν βρέθηκε")
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Δεν σου ανήκει αυτή η εγγραφή")

    db.delete(item)
    db.commit()
