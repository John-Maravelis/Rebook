from pydantic import BaseModel, field_validator

from app.models.listing import ListingCondition
from app.models.proposal import ProposalStatus, ProposalType


class ProposalCreate(BaseModel):
    type: ProposalType
    offered_book_ids: list[int] = []  # μόνο για type == exchange


class OfferedBookOut(BaseModel):
    id: int
    title: str
    condition: ListingCondition


class ProposalOut(BaseModel):
    id: int
    listing_id: int
    listing_title: str
    listing_owner_full_name: str
    requester_id: int
    requester_full_name: str
    type: ProposalType
    status: ProposalStatus
    offered_book_ids: list[int]
    offered_books: list[OfferedBookOut] = []


class ProposalStatusUpdate(BaseModel):
    status: ProposalStatus

    @field_validator("status")
    @classmethod
    def only_accept_or_reject(cls, value: ProposalStatus) -> ProposalStatus:
        if value == ProposalStatus.pending:
            raise ValueError("Η κατάσταση μπορεί να αλλάξει μόνο σε accepted ή rejected")
        return value
