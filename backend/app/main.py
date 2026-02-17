from fastapi import FastAPI, Depends, Query, Request
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
# @app.post("/books", response_model=schemas.Book)
# def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
#     return crud.create_book(db=db, book=book)

@app.get("/books", response_model=dict)
def list_books_grouped_by_municipio(db: Session = Depends(get_db)):
    books = crud.get_books(db=db)
    grouped_books = {}

    for book in books:
        for copy in book.copies:  # Acesse as cópias relacionadas ao livro
            municipio = copy.location  # Use o campo location da cópia
            if municipio not in grouped_books:
                grouped_books[municipio] = []
            grouped_books[municipio].append({
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "isbn": book.isbn,
                "cover_url": book.cover_url,
                "condition": copy.condition,
                "status": copy.status,
                "owner_id": copy.owner_id,
                "copy_id": copy.id,  # Added the missing copy_id field
            })

    return grouped_books

@app.get("/users/{user_id}/books")
def get_user_books(user_id: int, db: Session = Depends(get_db)):
    print(f"Fetching books for user_id: {user_id}")
    copies = crud.get_copies_by_owner(db, user_id)
    print(f"Found {len(copies)} copies for user {user_id}")
    books = []
    for copy in copies:
        print(f"Processing copy: book_id={copy.book_id}, owner_id={copy.owner_id}")
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
            print(f"Added book: {book.title}")
        else:
            print(f"Book not found for book_id: {copy.book_id}")
    print(f"Returning {len(books)} books")
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

@app.get("/users/{user_id}/incoming-requests")
def get_incoming_requests(user_id: int, db: Session = Depends(get_db)):
    print(f"Fetching incoming requests for user_id: {user_id}")
    # Get all copies owned by this user
    user_copies = crud.get_copies_by_owner(db, user_id)
    copy_ids = [copy.id for copy in user_copies]
    
    # Get all requests for these copies
    incoming_requests = []
    for copy_id in copy_ids:
        requests = db.query(models.Request).filter(models.Request.copy_id == copy_id).all()
        for request in requests:
            request_data = {
                "id": request.id,
                "copy_id": request.copy_id,
                "requester_id": request.requester_id,
                "requester_name": request.requester.name,
                "requester_email": request.requester.email,
                "message": request.message,
                "status": request.status,
                "created_at": request.created_at,
                "book_title": request.copy.book.title,
                "book_author": request.copy.book.author,
                "book_isbn": request.copy.book.isbn,
            }
            incoming_requests.append(request_data)
    
    print(f"Found {len(incoming_requests)} incoming requests")
    return incoming_requests

@app.post("/location")
def save_location(location: schemas.LocationCreate, db: Session = Depends(get_db)):
    return crud.save_location(db, location)



@app.get("/books/nearby")
def get_books_nearby(lat: float, lon: float, radius_km: int, db: Session = Depends(get_db)):
    # Query para buscar livros dentro do raio
    pass

@app.post("/books")
def add_book(request: Request, book: schemas.BookCreate, db: Session = Depends(get_db)):
    print("=== ADD BOOK ENDPOINT CALLED ===")
    print(f"Query params: {request.query_params}")

    # Get owner_id and municipality from query parameters
    owner_id = request.query_params.get("owner_id")
    municipio = request.query_params.get("municipio")

    if not owner_id:
        print("ERROR: No owner_id in query parameters")
        raise HTTPException(status_code=400, detail="owner_id is required")

    if not municipio:
        print("ERROR: No municipio in query parameters")
        raise HTTPException(status_code=400, detail="municipio is required")

    try:
        owner_id = int(owner_id)
        print(f"Adding book with owner_id: {owner_id} and municipio: {municipio}")
    except ValueError:
        print(f"ERROR: Invalid owner_id: {owner_id}")
        raise HTTPException(status_code=400, detail="owner_id must be an integer")

    print(f"Book data: {book.dict()}")

    # Create the book
    created_book = crud.create_book(db, book)
    print(f"Book created with ID: {created_book.id}")

    # Create a copy associated with the owner and municipality
    copy_data = schemas.CopyCreate(
        book_id=created_book.id,
        owner_id=owner_id,
        condition="OK",  # BookCondition: OK, USED, WORN
        status="AVAILABLE",  # CopyStatus: AVAILABLE, REQUESTED, BORROWED
        location=municipio  # Use municipio as location
    )
    print(f"Creating copy with data: {copy_data.dict()}")
    created_copy = crud.create_copy(db, copy_data)
    print(f"Copy created with ID: {created_copy.id}")

    return created_book

@app.post("/requests")
def create_request(request: schemas.RequestCreate, db: Session = Depends(get_db)):
    print(f"=== CREATE REQUEST ENDPOINT CALLED ===")
    print(f"Request data: {request.dict()}")
    try:
        result = crud.create_request(db, request)
        print(f"Request created successfully: {result}")
        return result
    except Exception as e:
        print(f"Error creating request: {e}")
        raise HTTPException(status_code=422, detail=str(e))

# Chat
@app.post("/messages", response_model=schemas.Message)
def create_message(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    return crud.create_message(db=db, message=message)


@app.get("/messages/{copy_id}", response_model=list[schemas.Message])
def get_messages(copy_id: int, db: Session = Depends(get_db)):
    return crud.get_messages_for_copy(db=db, copy_id=copy_id)