from sqlalchemy import Column, BigInteger, String, Text, Boolean, Integer, DateTime
from sqlalchemy.sql import func
from app.db.session import Base


class User(Base):
    """SQLAlchemy model for the users table."""
    
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True)
    google_id = Column(Text, unique=True, nullable=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    username = Column(String(50), nullable=False, unique=True)
    password_hash = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    email = Column(String(255), nullable=True)
    profile_picture = Column(Text, nullable=True)
    joined_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    energy = Column(Integer, default=100, nullable=False)
    coins = Column(Integer, default=0, nullable=False)
    age = Column(Integer, nullable=True)
    preferences = Column(String(100), nullable=True)
    notifications = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
