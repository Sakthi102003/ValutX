from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base
import uuid
import datetime

# Helper for SQLite UUID compatibility if needed, though usually String is easier for cross-compat in simple demos
# But strictly following "Production-minded", we try to respect types. 
# For SQLite, UUID acts as CHAR(32).

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    
    # Authentication
    auth_hash = Column(String, nullable=False) # Hash of the Client's Auth Key
    
    # Key Management (Zero Knowledge)
    kdf_salt = Column(String, nullable=False)        # Public salt for Client KDF
    encrypted_dek = Column(String, nullable=False)   # DEK wrapped by KEK
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
