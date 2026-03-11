from sqlalchemy import Column, BigInteger, Integer, SmallInteger, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Reel(Base):
    """SQLAlchemy model for the reels table."""
    
    __tablename__ = "reels"

    id = Column(BigInteger, primary_key=True, index=True)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=True)
    dialogue_id = Column(BigInteger, ForeignKey("dialogues.id"), nullable=True)
    created_by = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    url = Column(Text, nullable=False)
    thumbnail_url = Column(Text, nullable=True)
    title = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    duration = Column(SmallInteger, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    language = relationship("Language", lazy="joined")
    dialogue = relationship("Dialogue", lazy="joined")
    creator = relationship("User", lazy="joined")
    interactions = relationship("ReelInteraction", back_populates="reel", lazy="noload")


class ReelInteraction(Base):
    """SQLAlchemy model for the reel_interactions table."""
    
    __tablename__ = "reel_interactions"

    id = Column(BigInteger, primary_key=True, index=True)
    reel_id = Column(BigInteger, ForeignKey("reels.id"), nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_liked = Column(Boolean, default=False, nullable=False)
    is_saved = Column(Boolean, default=False, nullable=False)
    comment = Column(Text, nullable=True)
    commented_at = Column(DateTime(timezone=True), nullable=True)
    is_shared = Column(Boolean, default=False, nullable=False)
    is_reported = Column(Boolean, default=False, nullable=False)
    report_reason = Column(Text, nullable=True)
    reported_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    reel = relationship("Reel", back_populates="interactions")
    user = relationship("User", lazy="joined")
