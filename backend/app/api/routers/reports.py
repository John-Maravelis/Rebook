from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.report import Report
from app.models.user import User
from app.schemas.report import ReportCreate, ReportOut

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.reported_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Δεν μπορείς να αναφέρεις τον εαυτό σου")

    reported_user = db.query(User).filter(User.id == payload.reported_user_id).first()
    if reported_user is None:
        raise HTTPException(status_code=404, detail="Ο χρήστης δεν βρέθηκε")

    report = Report(
        reporter_id=current_user.id,
        reported_user_id=payload.reported_user_id,
        reason=payload.reason,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
