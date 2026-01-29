import bcrypt
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Any, Union
from jose import jwt
from app.core.config import settings

ALGORITHM = "HS256"

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def _get_prehashed_password(password: str) -> bytes:
    """
    Bcrypt has a 72-character limit. To safely handle any input length,
    we SHA-256 hash the password first.
    """
    return hashlib.sha256(password.encode("utf-8")).hexdigest().encode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a password against its hash.
    Tries the NEW format (SHA256 pre-hash) first.
    If that fails, tries the OLD format (Direct) for backwards compatibility.
    """
    try:
        # 1. Try NEW format (Safe for any length)
        password_bytes = _get_prehashed_password(plain_password)
        if bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8")):
            return True
        
        # 2. Try OLD format (Backwards compatibility)
        # Note: bcrypt.checkpw only accepts passwords <= 72 bytes.
        original_password_bytes = plain_password.encode("utf-8")
        if len(original_password_bytes) <= 72:
            return bcrypt.checkpw(original_password_bytes, hashed_password.encode("utf-8"))
            
        return False
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """
    Hashes a password using direct bcrypt call.
    """
    password_bytes = _get_prehashed_password(password)
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")
