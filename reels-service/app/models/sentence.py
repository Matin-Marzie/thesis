from sqlalchemy import Column, BigInteger, Integer, SmallInteger, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Sentence(Base):
    """SQLAlchemy model for the sentences table."""
    
    __tablename__ = "sentences"

    id = Column(BigInteger, primary_key=True, index=True)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=False)
    text = Column(Text, nullable=False)
    normalized_text = Column(Text, nullable=True)
    audio_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    language = relationship("Language", lazy="joined")
    tokens = relationship("SentenceToken", back_populates="sentence", lazy="selectin")


class SentenceToken(Base):
    """SQLAlchemy model for the sentence_tokens table."""
    
    __tablename__ = "sentence_tokens"

    id = Column(BigInteger, primary_key=True, index=True)
    sentence_id = Column(BigInteger, ForeignKey("sentences.id"), nullable=False)
    word_id = Column(Integer, ForeignKey("words.id"), nullable=False)
    position = Column(SmallInteger, nullable=False)
    part_of_speech = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    sentence = relationship("Sentence", back_populates="tokens")
    word = relationship("Word", lazy="joined")


class SentenceTranslation(Base):
    """SQLAlchemy model for the sentence_translations table."""
    
    __tablename__ = "sentence_translations"

    id = Column(BigInteger, primary_key=True, index=True)
    sentence_id = Column(BigInteger, ForeignKey("sentences.id"), nullable=False)
    translation_sentence_id = Column(BigInteger, ForeignKey("sentences.id"), nullable=False)
    
    # Relationships
    sentence = relationship("Sentence", foreign_keys=[sentence_id], lazy="joined")
    translation_sentence = relationship("Sentence", foreign_keys=[translation_sentence_id], lazy="joined")
