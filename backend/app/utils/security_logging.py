from fastapi import Request
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

def log_event(db: Session, user_id: str, event_type: str, severity: str = "INFO", details: str = None, request: Request = None):
    ip = request.client.host if request else "Unknown"
    ua = request.headers.get("user-agent") if request else "Unknown"
    
    log = AuditLog(
        user_id=user_id,
        event_type=event_type,
        severity=severity,
        details=details,
        ip_address=ip,
        user_agent=ua
    )
    db.add(log)
    db.commit()
