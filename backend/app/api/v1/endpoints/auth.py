from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import Any
from app.schemas import UserCreate, UserLogin, Token, UserResponse
from app.models.user import User
from app.db.session import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from pydantic import BaseModel

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    """
    Register a new user.
    """
    # Check if user exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Create User
    # Note: We hash the 'auth_hash_derived' again before storing it for defense-in-depth.
    # If the database is leaked, the attacker cannot login because they only have Hash(Hash(AuthKey)).
    # They would need to reverse this to get Hash(AuthKey), which is what the login endpoint expects.
    server_side_hash = get_password_hash(user_in.auth_hash_derived)

    new_user = User(
        email=user_in.email,
        auth_hash=server_side_hash,
        kdf_salt=user_in.kdf_salt,
        encrypted_dek=user_in.encrypted_dek
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)) -> Any:
    """
    OAuth2 compatible token login.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user:
        # TIMING ATTACK MIMIC (in production do this better)
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not verify_password(user_in.auth_hash_derived, user.auth_hash):
         raise HTTPException(status_code=400, detail="Incorrect email or password")
         
    access_token = create_access_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

class UserSaltResponse(BaseModel):
    kdf_salt: str

@router.get("/salt/{email}", response_model=UserSaltResponse)
def get_user_salt(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"kdf_salt": user.kdf_salt}
