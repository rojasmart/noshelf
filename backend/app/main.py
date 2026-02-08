
from fastapi import FastAPI
from app.database import engine, Base

# cria tabelas no PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NoShelf Backend MVP")

@app.get("/")
def read_root():
    return {"message": "NoShelf backend running"}
