from sqlalchemy import Column, BigInteger, String
from app.db.session import Base


class Language(Base):
    """SQLAlchemy model for the languages table."""
    
    __tablename__ = "languages"

    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(10), nullable=False, unique=True)
