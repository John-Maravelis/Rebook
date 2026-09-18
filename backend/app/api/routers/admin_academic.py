from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.academic import Course, Department, SuggestedBook
from app.models.user import User
from app.schemas.academic import (
    CourseCreate,
    CourseOut,
    DepartmentCreate,
    DepartmentOut,
    SuggestedBookCreate,
    SuggestedBookOut,
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/departments", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    department = Department(name=payload.name)
    db.add(department)
    db.commit()
    db.refresh(department)
    return department


@router.delete("/departments/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    department = db.query(Department).filter(Department.id == department_id).first()
    if department is None:
        raise HTTPException(status_code=404, detail="Δεν βρέθηκε")
    db.delete(department)
    db.commit()


@router.post("/courses", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    department = db.query(Department).filter(Department.id == payload.department_id).first()
    if department is None:
        raise HTTPException(status_code=400, detail="Το τμήμα δεν βρέθηκε")

    course = Course(name=payload.name, department_id=payload.department_id)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if course is None:
        raise HTTPException(status_code=404, detail="Δεν βρέθηκε")
    db.delete(course)
    db.commit()


@router.post("/suggested-books", response_model=SuggestedBookOut, status_code=status.HTTP_201_CREATED)
def create_suggested_book(
    payload: SuggestedBookCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if course is None:
        raise HTTPException(status_code=400, detail="Το μάθημα δεν βρέθηκε")

    book = SuggestedBook(title=payload.title, isbn=payload.isbn, course_id=payload.course_id)
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@router.delete("/suggested-books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_suggested_book(
    book_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    book = db.query(SuggestedBook).filter(SuggestedBook.id == book_id).first()
    if book is None:
        raise HTTPException(status_code=404, detail="Δεν βρέθηκε")
    db.delete(book)
    db.commit()
