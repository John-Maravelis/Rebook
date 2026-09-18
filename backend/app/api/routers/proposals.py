from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.listing import Listing, ListingStatus, ListingType
from app.models.message import Message
from app.models.proposal import Proposal, ProposalStatus, ProposalType
from app.models.review import Review
from app.models.user import User
from app.schemas.message import MessageCreate, MessageOut
from app.schemas.proposal import OfferedBookOut, ProposalCreate, ProposalOut, ProposalStatusUpdate
from app.schemas.review import ReviewCreate, ReviewOut
from app.schemas.review import ReviewCreate, ReviewOut, UserRatingOut

router = APIRouter(tags=["proposals"])


def _to_proposal_out(proposal: Proposal) -> ProposalOut:
    return ProposalOut(
        id=proposal.id,
        listing_id=proposal.listing_id,
        listing_title=proposal.listing.title,
        listing_owner_full_name=proposal.listing.owner.full_name,
        requester_id=proposal.requester_id,
        requester_full_name=proposal.requester.full_name,
        type=proposal.type,
        status=proposal.status,
        offered_book_ids=[book.id for book in proposal.offered_books],
        offered_books=[
            OfferedBookOut(id=book.id, title=book.title, condition=book.condition)
            for book in proposal.offered_books
        ],
    )


def _get_listing_or_404(listing_id: int, db: Session) -> Listing:
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if listing is None:
        raise HTTPException(status_code=404, detail="Η αγγελία δεν βρέθηκε")
    return listing


def _get_proposal_or_404(proposal_id: int, db: Session) -> Proposal:
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if proposal is None:
        raise HTTPException(status_code=404, detail="Η πρόταση δεν βρέθηκε")
    return proposal


def _ensure_participant(proposal: Proposal, current_user: User) -> None:
    """Μόνο ο requester ή ο ιδιοκτήτης της αγγελίας έχουν πρόσβαση στην πρόταση."""
    if current_user.id not in (proposal.requester_id, proposal.listing.owner_id):
        raise HTTPException(status_code=403, detail="Δεν συμμετέχεις σε αυτή την πρόταση")


@router.post(
    "/listings/{listing_id}/proposals",
    response_model=ProposalOut,
    status_code=status.HTTP_201_CREATED,
)
def create_proposal(
    listing_id: int,
    payload: ProposalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = _get_listing_or_404(listing_id, db)

    if listing.status != ListingStatus.active:
        raise HTTPException(status_code=400, detail="Η αγγελία δεν είναι πλέον ενεργή")
    if listing.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Δεν μπορείς να υποβάλεις πρόταση στη δική σου αγγελία")

    existing_proposal = (
        db.query(Proposal)
        .filter(Proposal.listing_id == listing_id, Proposal.requester_id == current_user.id)
        .first()
    )
    if existing_proposal is not None:
        raise HTTPException(
            status_code=400,
            detail="Έχεις ήδη υποβάλει πρόταση για αυτή την αγγελία (δεν επιτρέπεται δεύτερη, ούτε μετά από απόρριψη)",
        )

    if listing.type == ListingType.exchange:
        if payload.type != ProposalType.exchange:
            raise HTTPException(status_code=400, detail="Η αγγελία δέχεται μόνο προτάσεις ανταλλαγής")
        if not payload.offered_book_ids:
            raise HTTPException(status_code=400, detail="Χρειάζεται τουλάχιστον ένα προσφερόμενο βιβλίο")

        offered_books = (
            db.query(Listing).filter(Listing.id.in_(payload.offered_book_ids)).all()
        )
        if len(offered_books) != len(set(payload.offered_book_ids)):
            raise HTTPException(status_code=400, detail="Κάποιο από τα προσφερόμενα βιβλία δεν βρέθηκε")
        for book in offered_books:
            if book.owner_id != current_user.id:
                raise HTTPException(status_code=403, detail="Μπορείς να προσφέρεις μόνο δικά σου βιβλία")
            if book.status != ListingStatus.active:
                raise HTTPException(status_code=400, detail=f"Το βιβλίο '{book.title}' δεν είναι ενεργή αγγελία")

    elif listing.type == ListingType.sale:
        if payload.type != ProposalType.sale:
            raise HTTPException(status_code=400, detail="Η αγγελία δέχεται μόνο αίτημα αγοράς")
        offered_books = []

    else:  # ListingType.donation
        if payload.type != ProposalType.donation:
            raise HTTPException(status_code=400, detail="Η αγγελία δέχεται μόνο αίτημα δωρεάς")
        offered_books = []

    proposal = Proposal(listing_id=listing_id, requester_id=current_user.id, type=payload.type)
    proposal.offered_books = offered_books
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return _to_proposal_out(proposal)


@router.get("/listings/{listing_id}/proposals", response_model=list[ProposalOut])
def list_proposals_for_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = _get_listing_or_404(listing_id, db)
    if listing.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Μόνο ο ιδιοκτήτης βλέπει τις προτάσεις της αγγελίας")

    proposals = db.query(Proposal).filter(Proposal.listing_id == listing_id).all()
    return [_to_proposal_out(p) for p in proposals]


@router.get("/proposals/mine", response_model=list[ProposalOut])
def list_my_proposals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    proposals = db.query(Proposal).filter(Proposal.requester_id == current_user.id).all()
    return [_to_proposal_out(p) for p in proposals]


@router.get("/proposals/{proposal_id}", response_model=ProposalOut)
def get_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    proposal = _get_proposal_or_404(proposal_id, db)
    _ensure_participant(proposal, current_user)
    return _to_proposal_out(proposal)


@router.patch("/proposals/{proposal_id}/status", response_model=ProposalOut)
def update_proposal_status(
    proposal_id: int,
    payload: ProposalStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    proposal = _get_proposal_or_404(proposal_id, db)
    if proposal.listing.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Μόνο ο ιδιοκτήτης της αγγελίας απαντάει στην πρόταση")
    if proposal.status != ProposalStatus.pending:
        raise HTTPException(status_code=400, detail="Η πρόταση έχει ήδη απαντηθεί")

    proposal.status = payload.status
    db.commit()
    db.refresh(proposal)
    return _to_proposal_out(proposal)


@router.post(
    "/proposals/{proposal_id}/messages",
    response_model=MessageOut,
    status_code=status.HTTP_201_CREATED,
)
def create_message(
    proposal_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    proposal = _get_proposal_or_404(proposal_id, db)
    _ensure_participant(proposal, current_user)

    message = Message(proposal_id=proposal_id, sender_id=current_user.id, content=payload.content)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.get("/proposals/{proposal_id}/messages", response_model=list[MessageOut])
def list_messages(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    proposal = _get_proposal_or_404(proposal_id, db)
    _ensure_participant(proposal, current_user)

    return (
        db.query(Message)
        .filter(Message.proposal_id == proposal_id)
        .order_by(Message.created_at)
        .all()
    )


@router.post(
    "/proposals/{proposal_id}/reviews",
    response_model=ReviewOut,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    proposal_id: int,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    proposal = _get_proposal_or_404(proposal_id, db)
    _ensure_participant(proposal, current_user)

    if proposal.status != ProposalStatus.accepted:
        raise HTTPException(
            status_code=400,
            detail="Μπορείς να αξιολογήσεις μόνο αφού η πρόταση έχει γίνει δεκτή",
        )

    owner_id = proposal.listing.owner_id
    reviewee_id = proposal.requester_id if current_user.id == owner_id else owner_id

    already_reviewed = (
        db.query(Review)
        .filter(Review.proposal_id == proposal_id, Review.reviewer_id == current_user.id)
        .first()
    )
    if already_reviewed:
        raise HTTPException(status_code=400, detail="Έχεις ήδη αξιολογήσει αυτή τη συναλλαγή")

    review = Review(
        proposal_id=proposal_id,
        reviewer_id=current_user.id,
        reviewee_id=reviewee_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/users/{user_id}/rating", response_model=UserRatingOut)
def get_user_rating(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.reviewee_id == user_id).all()
    if not reviews:
        return UserRatingOut(average_rating=None, review_count=0)
    avg = round(sum(r.rating for r in reviews) / len(reviews), 1)
    return UserRatingOut(average_rating=avg, review_count=len(reviews))


@router.get("/proposals/{proposal_id}/reviews", response_model=list[ReviewOut])
def list_proposal_reviews(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    proposal = _get_proposal_or_404(proposal_id, db)
    _ensure_participant(proposal, current_user)
    return db.query(Review).filter(Review.proposal_id == proposal_id).all()

