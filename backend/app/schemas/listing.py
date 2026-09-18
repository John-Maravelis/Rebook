from typing import Optional

from pydantic import BaseModel

from app.models.listing import ListingCondition, ListingStatus, ListingType


class ListingCreate(BaseModel):
    title: str
    isbn: Optional[str] = None
    edition: Optional[str] = None
    condition: ListingCondition
    type: ListingType
    price: Optional[float] = None
    course_id: Optional[int] = None
    photo_url: Optional[str] = None


class ListingOut(BaseModel):
    id: int
    owner_id: int
    owner_full_name: str
    course_id: Optional[int]
    title: str
    isbn: Optional[str]
    edition: Optional[str]
    condition: ListingCondition
    type: ListingType
    price: Optional[float]
    status: ListingStatus
    photos: list[str] = []


class ListingStatusUpdate(BaseModel):
    status: ListingStatus
