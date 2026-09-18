from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.academic import Course, Department, SuggestedBook
from app.schemas.academic import CourseOut, DepartmentOut, SuggestedBookOut

router = APIRouter(tags=["academic"])


@router.get("/departments", response_model=list[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()


@router.get("/courses", response_model=list[CourseOut])
def list_courses(department_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Course)
    if department_id is not None:
        query = query.filter(Course.department_id == department_id)
    return query.all()


@router.get("/courses/{course_id}/suggested-books", response_model=list[SuggestedBookOut])
def list_suggested_books(course_id: int, db: Session = Depends(get_db)):
    return db.query(SuggestedBook).filter(SuggestedBook.course_id == course_id).all()
