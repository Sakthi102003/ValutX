from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List, Any
from app.schemas import AuditLogResponse
from app.models.audit import AuditLog
from app.models.user import User
from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[AuditLogResponse])
def read_audit_logs(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve security audit logs for the current user.
    """
    logs = db.query(AuditLog).filter(AuditLog.user_id == current_user.id).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    return logs

