import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Table, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class ProposalType(str, enum.Enum):
    exchange = "exchange"
    sale = "sale"
    donation = "donation"


class ProposalStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


# Πίνακας-σύνδεσμος: σε μια πρόταση ανταλλαγής, ο requester προσφέρει ένα ή
# περισσότερα δικά του βιβλία (κάθε προσφερόμενο βιβλίο είναι μια δική του Listing).
proposal_offered_books = Table(
    "proposal_offered_books",
    Base.metadata,
    Column("proposal_id", Integer, ForeignKey("proposals.id"), primary_key=True),
    Column("listing_id", Integer, ForeignKey("listings.id"), primary_key=True),
)


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    type = Column(Enum(ProposalType), nullable=False)
    status = Column(Enum(ProposalStatus), nullable=False, default=ProposalStatus.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    listing = relationship("Listing", foreign_keys=[listing_id])
    requester = relationship("User", foreign_keys=[requester_id])
    offered_books = relationship("Listing", secondary=proposal_offered_books)
    messages = relationship("Message", back_populates="proposal", cascade="all, delete-orphan")
