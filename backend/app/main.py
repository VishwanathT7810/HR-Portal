from typing import Any

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi

from app.core.config import get_settings
from app.database import init_database

settings = get_settings()


def _custom_openapi(app: FastAPI) -> dict[str, Any]:
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Biyani HR Employee Information API",
        version="1.0.0",
        description=(
            "Production API for the Biyani Technologies HR Employee Information PWA. "
            "Public registration for employees and Admin portal for HR management."
        ),
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "AdminAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "Authorization",
            "description": "Admin authorization identifier or header.",
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            tags = method.get("tags", [])
            if any(t for t in tags if t and t.lower().startswith("admin")):
                method["security"] = [{"AdminAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


def create_app() -> FastAPI:
    app = FastAPI(
        title="Biyani HR Employee Information API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        servers=[],
    )

    origins = settings.cors_origin_list
    if settings.is_production and (not origins or "*" in origins):
        origins = [o for o in origins if o and o != "*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins if origins else ["*"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
        max_age=600,
    )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,  # noqa: ARG001
        exc: RequestValidationError,
    ) -> JSONResponse:
        simplified: list[dict[str, Any]] = []
        for err in exc.errors():
            loc = ".".join(str(p) for p in err.get("loc", []))
            simplified.append(
                {
                    "field": loc,
                    "message": err.get("msg", "Invalid value"),
                    "type": err.get("type", "value_error"),
                }
            )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=jsonable_encoder(
                {
                    "detail": "Validation failed",
                    "errors": simplified,
                }
            ),
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(
        request: Request,  # noqa: ARG001
        exc: HTTPException,
    ) -> JSONResponse:
        headers = getattr(exc, "headers", None)
        body: Any = exc.detail
        if isinstance(body, (str, dict)):
            pass
        else:
            body = str(body)
        content = {"detail": body} if isinstance(body, str) else body
        return JSONResponse(
            status_code=exc.status_code,
            content=jsonable_encoder(content),
            headers=headers,
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request,  # noqa: ARG001
        exc: Exception,
    ) -> JSONResponse:
        if settings.is_production:
            message = "Internal server error"
        else:
            message = f"{type(exc).__name__}: {exc}"
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": message},
        )

    @app.on_event("startup")
    def on_startup() -> None:
        init_database()
        from app.modules.auth.services.auth_service import seed_initial_admin_if_needed

        seed_initial_admin_if_needed()

    from app.modules.auth.router import router as auth_router
    from app.modules.employee.router import router as employee_router
    from app.modules.admin.router import router as admin_router

    prefix = settings.API_V1_PREFIX.rstrip("/")
    app.include_router(auth_router, prefix=prefix, tags=["Auth"])
    app.include_router(employee_router, prefix=prefix, tags=["Employee"])
    app.include_router(admin_router, prefix=prefix, tags=["Admin"])

    @app.get("/health", tags=["System"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    app.openapi = lambda: _custom_openapi(app)  # type: ignore[method-assign]

    return app


app = create_app()
