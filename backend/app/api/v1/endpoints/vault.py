from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Any
from app.schemas import VaultItemCreate, VaultItemResponse, VaultItemUpdate
from app.models.item import VaultItem
from app.models.user import User
from app.db.session import get_db
from app.core import security
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Dependency to get current user
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

@router.get("/", response_model=List[VaultItemResponse])
def read_items(
    db: Session = Depends(get_db),
    skip: int = 0, 
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve all encrypted vault items for the current user.
    """
    items = db.query(VaultItem).filter(VaultItem.user_id == current_user.id).offset(skip).limit(limit).all()
    return items

@router.post("/", response_model=VaultItemResponse)
def create_item(
    item_in: VaultItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new encrypted vault entry.
    """
    item = VaultItem(
        user_id=current_user.id,
        type=item_in.type,
        enc_data=item_in.enc_data,
        iv=item_in.iv,
        auth_tag=item_in.auth_tag
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/{item_id}", response_model=VaultItemResponse)
def update_item(
    item_id: str, 
    item_in: VaultItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a vault entry.
    """
    item = db.query(VaultItem).filter(VaultItem.id == item_id, VaultItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item_in.enc_data:
        item.enc_data = item_in.enc_data
    if item_in.iv:
        item.iv = item_in.iv
    if item_in.auth_tag:
        item.auth_tag = item_in.auth_tag
        
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = db.query(VaultItem).filter(VaultItem.id == item_id, VaultItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    db.delete(item)
    db.commit()
    return {"status": "success"}
