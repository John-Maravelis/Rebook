from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    already_exists = (
        db.query(User)
        .filter(User.institutional_email == user_in.institutional_email)
        .first()
    )
    if already_exists:
        raise HTTPException(status_code=400, detail="Το email είναι ήδη καταχωρημένο")

    user = User(
        institutional_email=user_in.institutional_email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Το OAuth2PasswordRequestForm ονομάζει το πεδίο "username" εξ ορισμού,
    # αλλά εδώ περνάμε μέσα το institutional_email.
    user = db.query(User).filter(User.institutional_email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Λάθος email ή κωδικός",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.is_blocked:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ο λογαριασμός έχει αποκλειστεί")

    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token)
