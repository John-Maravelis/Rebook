from pydantic import BaseModel

from app.models.report import ReportStatus


class ReportCreate(BaseModel):
    reported_user_id: int
    reason: str


class ReportOut(BaseModel):
    id: int
    reporter_id: int
    reported_user_id: int
    reason: str
    status: ReportStatus

    class Config:
        from_attributes = True
