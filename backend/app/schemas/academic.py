from typing import Optional

from pydantic import BaseModel


class DepartmentCreate(BaseModel):
    name: str


class DepartmentOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class CourseCreate(BaseModel):
    name: str
    department_id: int


class CourseOut(BaseModel):
    id: int
    name: str
    department_id: int

    class Config:
        from_attributes = True


class SuggestedBookCreate(BaseModel):
    title: str
    isbn: Optional[str] = None
    course_id: int


class SuggestedBookOut(BaseModel):
    id: int
    title: str
    isbn: Optional[str]
    course_id: int

    class Config:
        from_attributes = True
