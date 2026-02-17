
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
    # Verificar se a cópia está disponível
    db_copy = db.query(models.Copy).filter(models.Copy.id == request.copy_id).first()
    if not db_copy:
        raise ValueError("Copy not found")
    
    if db_copy.status != models.CopyStatus.AVAILABLE:
        raise ValueError(f"Book is not available. Current status: {db_copy.status}")
    
    # Verificar se o usuário não está tentando requisitar seu próprio livro
    if db_copy.owner_id == request.requester_id:
        raise ValueError("Cannot request your own book")
    
    db_request = models.Request(**request.dict())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def get_requests(db: Session):
    return db.query(models.Request).all()

def get_request(db: Session, request_id: int):
    return db.query(models.Request).filter(models.Request.id == request_id).first()

def accept_request(db: Session, request_id: int):
    """Aceita um request (owner aceita) - muda status para ACCEPTED e copy para RESERVED"""
    db_request = db.query(models.Request).filter(models.Request.id == request_id).first()
    if not db_request:
        return None
    
    # Atualiza o status do request
    db_request.status = models.RequestStatus.ACCEPTED
    
    # Atualiza o status da cópia para RESERVED
    db_copy = db.query(models.Copy).filter(models.Copy.id == db_request.copy_id).first()
    if db_copy:
        db_copy.status = models.CopyStatus.RESERVED
    
    db.commit()
    db.refresh(db_request)
    return db_request

def confirm_delivery(db: Session, request_id: int):
    """Confirma a entrega (receiver confirma) - muda status para COMPLETED"""
    db_request = db.query(models.Request).filter(models.Request.id == request_id).first()
    if not db_request:
        return None
    
    # Atualiza o status do request
    db_request.status = models.RequestStatus.COMPLETED
    
    # Atualiza o status da cópia para BORROWED
    db_copy = db.query(models.Copy).filter(models.Copy.id == db_request.copy_id).first()
    if db_copy:
        db_copy.status = models.CopyStatus.BORROWED
    
    db.commit()
    db.refresh(db_request)
    return db_request

def delete_request(db: Session, request_id: int):
    """Cancela/remove um request"""
    db_request = db.query(models.Request).filter(models.Request.id == request_id).first()
    if not db_request:
        return False
    
    db.delete(db_request)
    db.commit()
    return True

# Messages
def create_message(db: Session, message: schemas.MessageCreate):
    db_message = models.Message(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages_by_request(db: Session, request_id: int):
    return db.query(models.Message).filter(models.Message.request_id == request_id).order_by(models.Message.created_at.asc()).all()

def get_message(db: Session, message_id: int):
    return db.query(models.Message).filter(models.Message.id == message_id).first()
