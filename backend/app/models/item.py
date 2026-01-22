from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid
import datetime

def generate_uuid():
    return str(uuid.uuid4())

class VaultItem(Base):
    __tablename__ = "vault_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    # Metadata (Visible to Server)
    type = Column(String, nullable=False) # 'login', 'card', 'id', 'note'
    
    # Encrypted Data (Zero Knowledge)
    enc_data = Column(Text, nullable=False) # The big encrypted JSON blob
    iv = Column(String, nullable=False)     # Unique IV for this item
    auth_tag = Column(String, nullable=True) # Optional, depends on GCM implementation details
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_modified = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    owner = relationship("User", backref="items")
