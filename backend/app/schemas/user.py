from pydantic import BaseModel, EmailStr, field_validator

from app.models.user import UserRole

INSTITUTIONAL_DOMAIN = "@unipi.gr"


class UserCreate(BaseModel):
    institutional_email: EmailStr
    password: str
    full_name: str

    @field_validator("institutional_email")
    @classmethod
    def must_be_institutional_email(cls, value: str) -> str:
        if not value.lower().endswith(INSTITUTIONAL_DOMAIN):
            raise ValueError(f"Απαιτείται ιδρυματικό email ({INSTITUTIONAL_DOMAIN})")
        return value


class UserOut(BaseModel):
    id: int
    institutional_email: str
    full_name: str
    role: UserRole
    is_blocked: bool

    class Config:
        from_attributes = True  # επιτρέπει τη μετατροπή απευθείας από SQLAlchemy model


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
