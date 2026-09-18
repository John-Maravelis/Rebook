from pydantic import BaseModel


class CourseDemandStats(BaseModel):
    course_id: int
    course_name: str
    wishlist_count: int
    active_listing_count: int
    total_listing_count: int
    proposal_count: int
