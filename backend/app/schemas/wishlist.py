from typing import Optional

from pydantic import BaseModel, model_validator


class WishlistCreate(BaseModel):
    course_id: Optional[int] = None
    title: Optional[str] = None
    isbn: Optional[str] = None

    @model_validator(mode="after")
    def at_least_one_criterion(self):
        if not (self.course_id or self.title or self.isbn):
            raise ValueError("Χρειάζεται τουλάχιστον ένα από: course_id, title, isbn")
        return self


class WishlistOut(BaseModel):
    id: int
    user_id: int
    course_id: Optional[int]
    title: Optional[str]
    isbn: Optional[str]

    class Config:
        from_attributes = True
