from typing import Optional

from pydantic import BaseModel


class NotificationOut(BaseModel):
    id: int
    listing_id: Optional[int]
    content: str
    is_read: bool

    class Config:
        from_attributes = True
