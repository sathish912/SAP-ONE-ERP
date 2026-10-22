import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .core.config import settings
from .core.logging import logger
from .db.database import init_db, SessionLocal
from .models.user import User
from .core.security import hash_password
from .services.company_service import CompanyService
from .services.subledger_service import SubledgerService
from .schemas.company import CompanyCreate
from .utils.response import error_response

# Import all API route routers
from .api.routes import (
    company,
    financial_year,
    accounts,
    journal_entry,
    subledger,
    reports,
    auth,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context: initializes database schema and seeds initial data."""
    logger.info("Initializing STACKLY SAP OneERP Database Schema in MySQL...")
    init_db()

    # Seed default system administrator & default demo company if not exists
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@thestackly.com",
                password_hash=hash_password("admin123"),
                role="ADMIN",
                is_active=True,
            )
            db.add(admin)
            db.commit()
            logger.info("Created default administrator: admin / admin123")

        company_service = CompanyService(db)
        companies = company_service.list_companies()
        if not companies:
            from datetime import date
            sample_company = CompanyCreate(
                company_name="ABC Technologies Private Limited",
                company_code="ABC001",
                country="India",
                currency="INR",
                financial_year_start=date(2026, 4, 1),
                company_address="Plot 42, Electronic City Phase 1, Bengaluru, Karnataka, 560100",
            )
            created_comp = company_service.create_company(sample_company, created_by="ADMIN")
            logger.info(f"Seeded initial company: {created_comp.company_code} - {created_comp.company_name}")
            companies = [created_comp]

        # Ensure subledger demo data is present
        sub_service = SubledgerService(db)
        for comp in companies:
            sub_service.seed_sample_subledger_data(comp.company_id)
    except Exception as e:
        logger.warning(f"Seed note: {e}")
    finally:
        db.close()

    yield
    logger.info("Shutting down STACKLY SAP OneERP Server.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Cloud ERP SaaS platform conforming to the STACKLY SAP OneERP Development Standard.",
    version=settings.PROJECT_VERSION,
    lifespan=lifespan,
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Standardized Request Validation Error Handler (Section 4 Standard)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    formatted_errors = []
    for err in exc.errors():
        field_name = " -> ".join(str(loc) for loc in err.get("loc", []))
        formatted_errors.append({
            "field": field_name,
            "message": err.get("msg", "Invalid input value"),
        })
    return error_response(
        message="Validation failed",
        errors=formatted_errors,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
    )


# Register all API Routes under /api/v1 (and backward compatibility alias /api/companies)
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(company.router, prefix=settings.API_V1_PREFIX)
app.include_router(company.router, prefix="/api", include_in_schema=False)  # Backward compat alias
app.include_router(financial_year.router, prefix=settings.API_V1_PREFIX)
app.include_router(accounts.router, prefix=settings.API_V1_PREFIX)
app.include_router(journal_entry.router, prefix=settings.API_V1_PREFIX)
app.include_router(subledger.router, prefix=settings.API_V1_PREFIX)
app.include_router(reports.router, prefix=settings.API_V1_PREFIX)


# System Health Check
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "platform": "STACKLY SAP OneERP Cloud Platform",
        "status": "online",
        "version": settings.PROJECT_VERSION,
        "docs_url": "/docs",
    }


# Mount React Production Build (dist) or Frontend Directory
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend"))
SERVE_DIR = FRONTEND_DIST if os.path.isdir(FRONTEND_DIST) else FRONTEND_DIR

if os.path.isdir(SERVE_DIR):
    assets_dir = os.path.join(SERVE_DIR, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    app.mount("/static", StaticFiles(directory=SERVE_DIR), name="static")

    @app.get("/", include_in_schema=False)
    def serve_frontend():
        index_path = os.path.join(SERVE_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {
            "message": "Welcome to STACKLY SAP OneERP API",
            "docs": "/docs",
        }
