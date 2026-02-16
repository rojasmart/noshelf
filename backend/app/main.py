from fastapi import FastAPI, Depends
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from itsdangerous import URLSafeTimedSerializer
from fastapi import HTTPException

from sqlalchemy.orm import Session
from app import models, schemas, crud
from app.database import engine, SessionLocal

# Cria as tabelas
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NoShelf Backend MVP")


# Configuração do email
conf = ConnectionConfig(
    MAIL_USERNAME="seu_email@gmail.com",
    MAIL_PASSWORD="sua_senha",
    MAIL_FROM="seu_email@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,  # Substitui MAIL_TLS
    MAIL_SSL_TLS=False,  # Substitui MAIL_SSL
    USE_CREDENTIALS=True
)

serializer = URLSafeTimedSerializer("SECRET_KEY")

@app.post("/send-magic-link")
async def send_magic_link(email: str):
    token = serializer.dumps(email, salt="email-confirm")
    link = f"http://localhost:8000/verify/{token}"
    message = MessageSchema(
        subject="Seu Magic Link",
        recipients=[email],
        body=f"Use este link para acessar: {link}",
        subtype="plain"
    )
    fm = FastMail(conf)
    await fm.send_message(message)
    return {"message": "Magic link enviado!"}

@app.get("/verify/{token}")
async def verify_token(token: str):
    try:
        email = serializer.loads(token, salt="email-confirm", max_age=3600)
        # Aqui você pode criar ou autenticar o usuário
        return {"message": f"Bem-vindo, {email}!"}
    except Exception:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado")




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

# Registration endpoint
@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = crud.get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

# Login endpoint
@app.post("/login", response_model=schemas.User)
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = crud.get_user_by_email(db, user.email)
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # In a real app, you would verify the password hash here
    # For now, we'll do a simple password comparison
    if existing_user.password != user.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    return existing_user

# Books
@app.post("/books", response_model=schemas.Book)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    return crud.create_book(db=db, book=book)

@app.get("/books", response_model=list[schemas.Book])
def list_books(db: Session = Depends(get_db)):
    return crud.get_books(db=db)

@app.get("/users/{user_id}/books")
def get_user_books(user_id: int, db: Session = Depends(get_db)):
    copies = crud.get_copies_by_owner(db, user_id)
    books = []
    for copy in copies:
        book = crud.get_book(db, copy.book_id)
        if book:
            # Add owner info to the book response
            book_data = {
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "isbn": book.isbn,
                "cover_url": book.cover_url,
                "owner_id": copy.owner_id,
                "copy_id": copy.id,
                "condition": copy.condition,
                "status": copy.status
            }
            books.append(book_data)
    return books

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

@app.post("/location")
def save_location(location: schemas.LocationCreate, db: Session = Depends(get_db)):
    return crud.save_location(db, location)



@app.get("/books/nearby")
def get_books_nearby(lat: float, lon: float, radius_km: int, db: Session = Depends(get_db)):
    # Query para buscar livros dentro do raio
    pass

@app.post("/books")
def add_book(book: schemas.BookCreate, owner_id: int, db: Session = Depends(get_db)):
    # Create the book
    created_book = crud.create_book(db, book)
    
    # Create a copy associated with the owner
    copy_data = schemas.CopyCreate(
        book_id=created_book.id,
        owner_id=owner_id,
        condition="OK",
        status="AVAILABLE"
    )
    crud.create_copy(db, copy_data)
    
    return created_book

@app.post("/requests")
def create_request(request: schemas.RequestCreate, db: Session = Depends(get_db)):
    return crud.create_request(db, request)

# Chat
@app.post("/messages", response_model=schemas.Message)
def create_message(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    return crud.create_message(db=db, message=message)


@app.get("/messages/{copy_id}", response_model=list[schemas.Message])
def get_messages(copy_id: int, db: Session = Depends(get_db)):
    return crud.get_messages_for_copy(db=db, copy_id=copy_id)