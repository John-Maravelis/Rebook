from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.academic import Course
from app.models.listing import Listing, ListingStatus
from app.models.proposal import Proposal
from app.models.report import Report, ReportStatus
from app.models.user import User
from app.models.wishlist import Wishlist
from app.schemas.report import ReportOut
from app.schemas.stats import CourseDemandStats
from app.schemas.user import UserOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return db.query(User).all()


@router.get("/reports", response_model=list[ReportOut])
def list_reports(
    status_filter: Optional[ReportStatus] = None,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    query = db.query(Report)
    if status_filter is not None:
        query = query.filter(Report.status == status_filter)
    return query.all()


@router.patch("/reports/{report_id}/resolve", response_model=ReportOut)
def resolve_report(
    report_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if report is None:
        raise HTTPException(status_code=404, detail="Δεν βρέθηκε")

    report.status = ReportStatus.resolved
    db.commit()
    db.refresh(report)
    return report


@router.patch("/users/{user_id}/block", response_model=UserOut)
def block_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Δεν βρέθηκε")

    user.is_blocked = True
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/unblock", response_model=UserOut)
def unblock_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Δεν βρέθηκε")

    user.is_blocked = False
    db.commit()
    db.refresh(user)
    return user


@router.get("/stats/demand", response_model=list[CourseDemandStats])
def get_demand_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Απλές per-course μετρήσεις. Χωρίς joins/group-by για ευκολία ανάγνωσης —
    το πλήθος των μαθημάτων σε ένα φοιτητικό project είναι μικρό, δεν έχει σημασία
    η απόδοση εδώ."""
    results = []
    for course in db.query(Course).all():
        wishlist_count = db.query(Wishlist).filter(Wishlist.course_id == course.id).count()
        active_listing_count = (
            db.query(Listing)
            .filter(Listing.course_id == course.id, Listing.status == ListingStatus.active)
            .count()
        )
        total_listing_count = db.query(Listing).filter(Listing.course_id == course.id).count()
        proposal_count = (
            db.query(Proposal)
            .join(Listing, Proposal.listing_id == Listing.id)
            .filter(Listing.course_id == course.id)
            .count()
        )
        results.append(
            CourseDemandStats(
                course_id=course.id,
                course_name=course.name,
                wishlist_count=wishlist_count,
                active_listing_count=active_listing_count,
                total_listing_count=total_listing_count,
                proposal_count=proposal_count,
            )
        )
    return results
