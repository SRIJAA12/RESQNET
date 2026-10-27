import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.logging import logger
from app.api.v1.router import api_router
from app.api.v1.endpoints.health import router as health_router
from app.db.session import engine, Base
import app.models  # Ensure all models are registered with Base metadata


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables if in development
    logger.info("Initializing RESQNET platform services...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema verified.")
    except Exception as e:
        logger.warning(f"Note on DB schema initialization: {str(e)}")
    yield
    logger.info("Shutting down RESQNET platform services...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.PROJECT_VERSION,
    description=(
        "Production-ready backend API for RESQNET — Intelligent Disaster Relief Coordination "
        "and Resource Management Ecosystem. Initial flood response simulation scenario. "
        "NOTICE: Strictly for simulated emergency coordination and synthetic exercise data."
    ),
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS if isinstance(settings.ALLOWED_ORIGINS, list) else [settings.ALLOWED_ORIGINS],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request ID and Latency Tracing Middleware
@app.middleware("http")
async def request_tracing_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id
    start_time = time.time()

    response = await call_next(request)

    process_time_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time-MS"] = str(process_time_ms)

    # Log request in structured JSON
    logger.info(
        f"{request.method} {request.url.path} -> {response.status_code} ({process_time_ms}ms)"
    )
    return response


# Global Exception Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    request_id = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": str(exc.detail),
            },
            "request_id": request_id
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    request_id = getattr(request.state, "request_id", None)
    errors = exc.errors()
    first_error = errors[0] if errors else {}
    field = ".".join(str(loc) for loc in first_error.get("loc", []))
    msg = first_error.get("msg", "Invalid request body")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": f"Validation failed at '{field}': {msg}",
                "field": field
            },
            "request_id": request_id
        }
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", None)
    logger.error(f"Unhandled server error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred while processing the emergency request."
            },
            "request_id": request_id
        }
    )


# Mount routers
app.include_router(health_router, prefix="/api")
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# Mock presigned storage upload endpoint for local testing
@app.put("/api/mock-storage/{bucket_name}/{file_key:path}")
async def mock_s3_upload(bucket_name: str, file_key: str, request: Request):
    return {"status": "uploaded", "bucket": bucket_name, "key": file_key, "size": len(await request.body())}
