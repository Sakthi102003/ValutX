from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from app.db.session import Base
import uuid
import datetime

def generate_uuid():
    return str(uuid.uuid4())

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    event_type = Column(String, nullable=False) # 'LOGIN', 'LOGOUT', 'VAULT_PURGE', 'KEY_ROTATION', 'ITEM_ACCESS', 'EXPORT'
    severity = Column(String, default='INFO') # INFO, WARNING, CRITICAL
    
    details = Column(Text, nullable=True) # JSON or String details
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
