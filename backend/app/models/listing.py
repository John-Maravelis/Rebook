import enum

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class ListingType(str, enum.Enum):
    exchange = "exchange"
    sale = "sale"
    donation = "donation"


class ListingCondition(str, enum.Enum):
    new = "new"
    good = "good"
    worn = "worn"


class ListingStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    withdrawn = "withdrawn"


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)

    title = Column(String, nullable=False)
    isbn = Column(String, nullable=True)
    edition = Column(String, nullable=True)
    condition = Column(Enum(ListingCondition), nullable=False)
    type = Column(Enum(ListingType), nullable=False)
    price = Column(Float, nullable=True)  # μόνο για type == sale
    status = Column(Enum(ListingStatus), nullable=False, default=ListingStatus.active)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User")
    course = relationship("Course")
    photos = relationship("ListingPhoto", back_populates="listing", cascade="all, delete-orphan")


class ListingPhoto(Base):
    __tablename__ = "listing_photos"

    id = Column(Integer, primary_key=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    url = Column(String, nullable=False)

    listing = relationship("Listing", back_populates="photos")
