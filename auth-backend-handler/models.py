from sqlalchemy import Column, Integer, String, DateTime
from database import Base

class AuthUser(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    deviceID = Column(String, index=True)
    tokenExpires = Column(DateTime, index=True)