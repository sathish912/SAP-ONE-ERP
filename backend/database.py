import os
import sys
from urllib.parse import quote_plus
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Ensure the backend directory is in sys.path for direct imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

# Database Configuration (supports environment variables with defaults)
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "mysql@2026")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "sapone_erp")

# Special characters like '@' in passwords must be URL-encoded (e.g. mysql@2026 -> mysql%402026)
encoded_password = quote_plus(DB_PASSWORD)

# MySQL Connection String using PyMySQL driver
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
)

# SQLAlchemy Engine Configuration
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,       # Automatically checks connection health before executing queries
    pool_recycle=3600,        # Prevents MySQL 8-hour timeout disconnects
    echo=False                # Set to True if you want to inspect raw SQL queries
)

# Session factory for handling transactional scopes
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session per request
    and guarantees it is closed after request execution finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initializes database tables defined in models.py.
    Automatically creates the 'companies' table in MySQL if it doesn't already exist.
    """
    try:
        from . import models  # noqa: F401
    except ImportError:
        import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
