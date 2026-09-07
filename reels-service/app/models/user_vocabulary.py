from sqlalchemy import Column, BigInteger, Integer, SmallInteger, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.session import Base


class UserVocabulary(Base):
    """SQLAlchemy model for the user_vocabulary table - the words a user
    has been introduced to for a given (user, learning language) pair,
    tracked with FSRS scheduling fields. Used here to test comprehension:
    a word counts as "known" for the recommendation engine's
    ComprehensibilityFilter simply by having a row here, regardless of its
    FSRS review state."""

    __tablename__ = "user_vocabulary"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    word_id = Column(BigInteger, ForeignKey("words.id"), nullable=False)
    user_languages_id = Column(BigInteger, ForeignKey("user_languages.id"), nullable=False)
    last_review = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    review_count = Column(Integer, default=0, nullable=False)
    next_review_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    stability = Column(Float, nullable=True)
    difficulty = Column(Float, nullable=True)
    lapses = Column(SmallInteger, default=0, nullable=False)
    fsrs_state = Column(SmallInteger, default=0, nullable=False)
    learning_steps = Column(SmallInteger, default=0, nullable=False)
