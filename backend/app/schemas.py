
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class BookCondition(str, Enum):
    OK = "OK"
    USED = "USED"
    WORN = "WORN"

class CopyStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    REQUESTED = "REQUESTED"
    BORROWED = "BORROWED"

class RequestStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DELIVERED = "DELIVERED"
    COMPLETED = "COMPLETED"

class UserBase(BaseModel):
    name: str
    email: str
    city: str
    country: str
    genres: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: int
    class Config:
        orm_mode = True

class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    cover_url: Optional[str] = None

class BookCreate(BookBase):
    pass

class Book(BookBase):
    id: int
    class Config:
        orm_mode = True

class CopyBase(BaseModel):
    condition: BookCondition  # Should be BookCondition, not CopyStatus
    status: CopyStatus
    location: str

class CopyCreate(CopyBase):
    book_id: int
    owner_id: int

class Copy(CopyBase):
    id: int
    book: Book
    owner: User
    class Config:
        orm_mode = True

class RequestBase(BaseModel):
    message: Optional[str] = None
    status: RequestStatus

class RequestCreate(RequestBase):
    copy_id: int
    requester_id: int

class Request(RequestBase):
    id: int
    copy: Copy
    requester: User
    class Config:
        orm_mode = True


class LocationCreate(BaseModel):
    country: str
    city: str
    radius_km: int

class MessageBase(BaseModel):
    sender_id: int
    receiver_id: int
    copy_id: int
    content: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Atualizado para Pydantic v2