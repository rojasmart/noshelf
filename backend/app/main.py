from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app import models, schemas, crud
from app.database import engine, SessionLocal

# Cria as tabelas
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NoShelf Backend MVP")

# Dependency para o DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Root
@app.get("/")
def read_root():
    return {"message": "NoShelf backend running"}

# Users
@app.post("/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)

@app.get("/users", response_model=list[schemas.User])
def list_users(db: Session = Depends(get_db)):
    return crud.get_users(db=db)

# Books
@app.post("/books", response_model=schemas.Book)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    return crud.create_book(db=db, book=book)

@app.get("/books", response_model=list[schemas.Book])
def list_books(db: Session = Depends(get_db)):
    return crud.get_books(db=db)

# Copies
@app.post("/copies", response_model=schemas.Copy)
def create_copy(copy: schemas.CopyCreate, db: Session = Depends(get_db)):
    return crud.create_copy(db=db, copy=copy)

@app.get("/copies", response_model=list[schemas.Copy])
def list_copies(db: Session = Depends(get_db)):
    return crud.get_copies(db=db)

# Requests
@app.post("/requests", response_model=schemas.Request)
def create_request(request: schemas.RequestCreate, db: Session = Depends(get_db)):
    return crud.create_request(db=db, request=request)

@app.get("/requests", response_model=list[schemas.Request])
def list_requests(db: Session = Depends(get_db)):
    return crud.get_requests(db=db)

