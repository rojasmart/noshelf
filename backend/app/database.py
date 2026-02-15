from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Busca a URL do banco de dados da variável de ambiente, com um valor padrão
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://noshelf_user:Carminauriel1984/@localhost/noshelf")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
