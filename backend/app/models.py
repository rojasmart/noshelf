from sqlalchemy import Column, String, Integer, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class BookCondition(str, enum.Enum):
    OK = "OK"
    USED = "USED"
    WORN = "WORN"

class CopyStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    REQUESTED = "REQUESTED"
    RESERVED = "RESERVED"  # Novo status para quando o request é aceito
    BORROWED = "BORROWED"

class RequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    RESERVED = "RESERVED"  # Novo status para quando o owner aceita
    DELIVERED = "DELIVERED"
    COMPLETED = "COMPLETED"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    city = Column(String)
    country = Column(String)
    genres = Column(String)  # Store as comma-separated string
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    copies = relationship("Copy", back_populates="owner")
    requests = relationship("Request", back_populates="requester")

class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    author = Column(String)
    isbn = Column(String, unique=True)
    cover_url = Column(String)

    copies = relationship("Copy", back_populates="book")

class Copy(Base):
    __tablename__ = "copies"
    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    condition = Column(Enum(BookCondition), default=BookCondition.OK)
    status = Column(Enum(CopyStatus), default=CopyStatus.AVAILABLE)
    location = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    book = relationship("Book", back_populates="copies")
    owner = relationship("User", back_populates="copies")
    requests = relationship("Request", back_populates="copy")  # Added back_populates for requests

class Request(Base):
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True, index=True)
    copy_id = Column(Integer, ForeignKey("copies.id"))
    requester_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(RequestStatus), default=RequestStatus.PENDING)
    message = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    copy = relationship("Copy", back_populates="requests")  # Ensure back_populates matches Copy
    requester = relationship("User", back_populates="requests")
    messages = relationship("Message", back_populates="request")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    request = relationship("Request", back_populates="messages")
    sender = relationship("User")

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    country = Column(String)
    city = Column(String)
    radius_km = Column(Integer, default=10)

    user = relationship("User", back_populates="location")

User.location = relationship("Location", back_populates="user", uselist=False)