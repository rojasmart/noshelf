
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
    RESERVED = "RESERVED"  # Novo status para quando o request é aceito
    BORROWED = "BORROWED"

class RequestStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    RESERVED = "RESERVED"  # Novo status para quando o owner aceita
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
    original_owner_id: Optional[int] = None

class Copy(CopyBase):
    id: int
    book: Book
    owner: User
    original_owner_id: Optional[int] = None
    class Config:
        orm_mode = True

class RequestBase(BaseModel):
    message: Optional[str] = None
    status: Optional[RequestStatus] = RequestStatus.PENDING

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
    content: str

class MessageCreate(MessageBase):
    request_id: int
    sender_id: int

class Message(MessageBase):
    id: int
    request_id: int
    sender_id: int
    created_at: datetime
    sender_name: Optional[str] = None

    class Config:
        from_attributes = True  # Atualizado para Pydantic v2