from sqlalchemy import Column, BigInteger, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class Word(Base):
    """SQLAlchemy model for the words table."""
    
    __tablename__ = "words"

    id = Column(BigInteger, primary_key=True, index=True)
    written_form = Column(String(255), nullable=False)
    part_of_speech = Column(String(50), nullable=True) # Todo: move this field to sentence_tokens table
    image_url = Column(Text, nullable=True)
    audio_url = Column(Text, nullable=True)
    language_id = Column(BigInteger, ForeignKey("languages.id"), nullable=False)
    level = Column(String(2), nullable=True)
    article = Column(String(10), nullable=True)
    
    # Relationships
    language = relationship("Language", lazy="joined")


class WordTranslation(Base):
    """SQLAlchemy model for the word_translations table."""
    
    __tablename__ = "word_translations"

    id = Column(BigInteger, primary_key=True, index=True)
    word_id = Column(BigInteger, ForeignKey("words.id"), nullable=False)
    translation_word_id = Column(BigInteger, ForeignKey("words.id"), nullable=False)
    level = Column(String(2), nullable=True)
    
    # Relationships
    word = relationship("Word", foreign_keys=[word_id], lazy="joined")
    translation_word = relationship("Word", foreign_keys=[translation_word_id], lazy="joined")
