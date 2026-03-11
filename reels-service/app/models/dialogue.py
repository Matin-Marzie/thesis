from sqlalchemy import Column, BigInteger, Integer, SmallInteger, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Dialogue(Base):
    """SQLAlchemy model for the dialogues table."""
    
    __tablename__ = "dialogues"

    id = Column(BigInteger, primary_key=True, index=True)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    language = relationship("Language", lazy="joined")
    sentences = relationship("DialogueSentence", back_populates="dialogue", lazy="selectin", order_by="DialogueSentence.position")


class DialogueSentence(Base):
    """SQLAlchemy model for the dialogue_sentences table."""
    
    __tablename__ = "dialogue_sentences"

    id = Column(BigInteger, primary_key=True, index=True)
    dialogue_id = Column(BigInteger, ForeignKey("dialogues.id"), nullable=False)
    sentence_id = Column(BigInteger, ForeignKey("sentences.id"), nullable=False)
    position = Column(SmallInteger, nullable=False)
    start_time_ms = Column(Integer, nullable=True)
    end_time_ms = Column(Integer, nullable=True)
    
    # Relationships
    dialogue = relationship("Dialogue", back_populates="sentences")
    sentence = relationship("Sentence", lazy="joined")
