
from sqlalchemy.orm import Session
from app import models, schemas

# Users
def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session):
    return db.query(models.User).all()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

# Books
def create_book(db: Session, book: schemas.BookCreate):
    db_book = models.Book(**book.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

def get_books(db: Session):
    return db.query(models.Book).all()

# Copies
def create_copy(db: Session, copy: schemas.CopyCreate):
    db_copy = models.Copy(**copy.dict())
    db.add(db_copy)
    db.commit()
    db.refresh(db_copy)
    return db_copy

def get_copies(db: Session):
    return db.query(models.Copy).all()

def get_books(db: Session):
    return db.query(models.Book).all()

def get_book(db: Session, book_id: int):
    return db.query(models.Book).filter(models.Book.id == book_id).first()

def get_copies_by_owner(db: Session, owner_id: int):
    return db.query(models.Copy).filter(models.Copy.owner_id == owner_id).all()

# Requests
def create_request(db: Session, request: schemas.RequestCreate):
    db_request = models.Request(**request.dict())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def get_requests(db: Session):
    return db.query(models.Request).all()
