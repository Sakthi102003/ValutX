from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import Any
from app.schemas import UserCreate, UserLogin, Token, UserResponse, UserRotateKey
from app.models.user import User
from app.db.session import get_db
from app.core.security import create_access_token, get_password_hash, verify_password, ALGORITHM
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

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

@router.put("/rotate-key", response_model=UserResponse)
def rotate_key(
    data: UserRotateKey, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Rotate the Master Password (re-encrypt DEK with new KEK).
    """
    # 1. Update Auth Hash
    server_side_hash = get_password_hash(data.auth_hash_derived)
    current_user.auth_hash = server_side_hash
    
    # 2. Update KDF Salt (so new KEK derivation is clean)
    current_user.kdf_salt = data.kdf_salt
    
    # 3. Update Encrypted DEK (wrapped with new KEK)
    current_user.encrypted_dek = data.encrypted_dek
    
    db.commit()
    db.refresh(current_user)
    return current_user

class UserSaltResponse(BaseModel):
    kdf_salt: str

@router.get("/salt/{email}", response_model=UserSaltResponse)
def get_user_salt(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"kdf_salt": user.kdf_salt}
