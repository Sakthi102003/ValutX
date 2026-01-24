from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import List, Any
from app.schemas import VaultItemCreate, VaultItemResponse, VaultItemUpdate
from app.models.item import VaultItem
from app.models.user import User
from app.db.session import get_db
from app.core import security
from app.api.deps import get_current_user
from app.utils.security_logging import log_event

router = APIRouter()

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
    request: Request,
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
    
    log_event(db, current_user.id, "ITEM_CREATE", severity="INFO", details=f"New {item.type} record added", request=request)
    
    return item

@router.put("/{item_id}", response_model=VaultItemResponse)
def update_item(
    item_id: str, 
    item_in: VaultItemUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a vault entry.
    """
    item = db.query(VaultItem).filter(VaultItem.id == item_id, VaultItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Conflict Detection
    if item_in.version is not None and item_in.version != item.version:
        raise HTTPException(status_code=409, detail="CONFLICT: Remote record is newer. Sync required.")

    if item_in.enc_data:
        item.enc_data = item_in.enc_data
    if item_in.iv:
        item.iv = item_in.iv
    if item_in.auth_tag:
        item.auth_tag = item_in.auth_tag
    
    # Increment version on update
    item.version += 1
        
    db.commit()
    db.refresh(item)
    
    log_event(db, current_user.id, "ITEM_UPDATE", severity="INFO", details=f"Record {item.type} updated", request=request)
    
    return item
@router.delete("/{item_id}")
def delete_item(
    item_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = db.query(VaultItem).filter(VaultItem.id == item_id, VaultItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    db.delete(item)
    db.commit()
    
    log_event(db, current_user.id, "ITEM_DELETE", severity="WARNING", details=f"Record {item.type} purged", request=request)
    
    return {"status": "success"}
