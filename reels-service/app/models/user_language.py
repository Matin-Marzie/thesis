from sqlalchemy import Column, BigInteger, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.session import Base


class UserLanguage(Base):
    """SQLAlchemy model for the user_languages table - one row per
    (user, native language, learning language) pair the user has set up,
    carrying their proficiency level for that pair."""

    __tablename__ = "user_languages"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    native_language_id = Column(BigInteger, ForeignKey("languages.id"), nullable=False)
    learning_language_id = Column(BigInteger, ForeignKey("languages.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    proficiency_level = Column(String(50), default="A1", nullable=False)
    experience = Column(Integer, default=0, nullable=False)
    is_current_language = Column(Boolean, default=False)
