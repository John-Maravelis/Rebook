from typing import Optional

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class ReviewOut(BaseModel):
    id: int
    proposal_id: int
    reviewer_id: int
    reviewee_id: int
    rating: int
    comment: Optional[str]

    class Config:
        from_attributes = True


class UserRatingOut(BaseModel):
    average_rating: Optional[float] = None
    review_count: int = 0
