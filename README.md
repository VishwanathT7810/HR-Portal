# Biyani HR Employee Information PWA

Production-ready HR Employee Information &amp; New Joiner Onboarding Progressive Web Application for Biyani Technologies Pvt. Ltd.

## Architecture Overview

```
           Internet / Intranet
                 |
                 v
        +-------------------+
        |   Windows IIS     |
        |  (SSL / HTTPS)    |
        +---------+---------+
                  |
         +--------+---------+
         |                  |
         v                  v
+------------------+  /api/* Reverse Proxy   +------------------+
|  React PWA       |  (HttpPlatformHandler/ |  FastAPI App     |
|  (dist/ static)  |   ANCM / ARR)          |  (uvicorn ASGI)  |
+------------------+                        +---------+--------+
                                                        |
                                                        v
                                             +------------------+
                                             | Microsoft SQL    |
                                             | Server           |
                                             +------------------+
```

Modular monolith with clean separation:
- **Frontend**: React 18 + TypeScript + Vite + React Router + PWA
- **Backend**: FastAPI + SQLAlchemy 2.x + Pydantic v2
- **Layers**: Routes → Services → Repositories → SQLAlchemy → SQL Server

See `./.trae/specs/hr-employee-info-pwa/spec.md` for full requirements and acceptance criteria.

## Technology Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, TypeScript 5, Vite 5, React Router 6, Axios, React Hook Form + Zod, CSS Modules/CSS Variables, vite-plugin-pwa |
| Backend | Python 3.11+, FastAPI 0.110+, Uvicorn, SQLAlchemy 2.x (Declarative Mapped/mapped_column), Pydantic v2 + pydantic-settings |
| Security | Argon2id password hashing, admin session verification, CORS-configurable, audit logs |
| Database | Microsoft SQL Server (2016+/Express/Developer/Azure SQL), ODBC Driver 18, pyodbc |
| Deployment | Windows Server, IIS (URL Rewrite + HttpPlatformHandler / ANCM), SSL/TLS |

## Folder Structure

```
project-root/
├── backend/
│   ├── app/
│   │   ├── main.py                          # FastAPI entrypoint
│   │   ├── core/                            # Config, security primitives
│   │   ├── database/                        # Base, session, models
│   │   ├── common/                          # Base repository, shared utilities
│   │   ├── modules/
│   │   │   ├── auth/                        # Admin auth (router/schemas/services/repos/deps)
│   │   │   ├── employee/                    # Public employee form + invitations
│   │   │   └── admin/                       # Admin dashboard/search/details + audit
│   │   └── middleware/                      # CORS, exception handlers
│   ├── scripts/
│   │   └── seed_admin.py                    # Seed first admin user from env
│   ├── tests/                               # pytest integration tests
│   ├── requirements.txt
│   ├── .env.example
│   ├── web.config.sample                    # IIS FastAPI hosting sample
│   └── ruff.toml
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── modules/
│   │   │   ├── auth/                        # Login, protected routes, auth state
│   │   │   ├── employee/                    # 5-phase form, review, success/error
│   │   │   └── admin/                       # Dashboard, list, search, details
│   │   ├── components/ui/                   # Shared primitive UI components
│   │   ├── layouts/                         # PublicLayout, AdminLayout
│   │   ├── routes/                          # AppRouter, route definitions
│   │   ├── services/api/                    # Axios instance, module API wrappers
│   │   ├── hooks/                           # Shared custom hooks
│   │   ├── types/                           # Shared TypeScript types
│   │   ├── utils/                           # Shared helpers
│   │   ├── config/                          # Env-based config
│   │   └── styles/globals.css               # CSS variables, design tokens, reset
│   ├── public/
│   │   ├── icons/                           # PWA icons 72..512
│   │   └── web.config                       # IIS SPA fallback URL Rewrite
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── .env.example
│   └── package.json
├── docs/
├── .gitignore
└── README.md
```

## Prerequisites

- **Python** ≥ 3.11 (3.12 recommended)
- **Node.js** ≥ 20 LTS, npm ≥ 10
- **Microsoft SQL Server** 2016+ / Express / Azure SQL
- **ODBC Driver 18 for SQL Server**
- **IIS** on deployment target with:
  - URL Rewrite Module 2.1
  - Application Request Routing 3.x (if ARR reverse proxy used)
  - ASP.NET Core Hosting Bundle 8.x (for HttpPlatformHandler / ANCM)
- Visual C++ Redistributable (for pyodbc / uvicorn on Windows)

## Environment Configuration

### Backend `backend/.env`

Copy `backend/.env.example` → `backend/.env`:

```ini
# Database (ODBC Driver 18)
DATABASE_URL=mssql+pyodbc://sa:YourStrongPassword123!@localhost/HR_DB?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes

# CORS (comma-separated list)
CORS_ORIGINS=http://localhost:5173,https://hr.example.com

# Environment: development | staging | production
ENVIRONMENT=development

# Optional: seed first admin on first run
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeMe123!
ADMIN_FULL_NAME=HR Administrator
ADMIN_EMAIL=admin@example.com
```

### Frontend `frontend/.env`

```ini
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## SQL Server Setup

1. Install SQL Server (Developer or Express is fine for dev).
2. Enable SQL Server Authentication (mixed mode).
3. Create database:

```sql
CREATE DATABASE HR_DB;
GO
ALTER DATABASE HR_DB SET READ_COMMITTED_SNAPSHOT ON;
GO
```

4. Install **ODBC Driver 18 for SQL Server** (required for pyodbc).
5. Set `DATABASE_URL` in `backend/.env` to the correct connection string.

## Database Initialization

Tables are auto-created on the first application start via `Base.metadata.create_all(bind=engine)` in `app/database/session.py` (for v1; migrate to Alembic for production).

Alternatively, run the explicit init script:

```powershell
cd backend
.\.venv\Scripts\python.exe -c "from app.database import engine, Base; Base.metadata.create_all(bind=engine); print('OK')"
```

## Backend Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt

# Seed first admin (uses ADMIN_* env vars)
python scripts\seed_admin.py

# Run dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Frontend Setup

```powershell
cd frontend
npm ci                    # or `npm install`
npm run dev               # Vite dev server on :5173
```

## Development Commands

| Action | Command |
|---|---|
| Backend dev | `cd backend && uvicorn app.main:app --reload --port 8000` |
| Frontend dev | `cd frontend && npm run dev` |
| Backend lint | `cd backend && ruff check .` |
| Backend tests | `cd backend && pytest tests/ -v --cov=app --cov-report=term` |
| Frontend typecheck | `cd frontend && npx tsc --noEmit` |
| Frontend lint | `cd frontend && npm run lint` |
| Frontend unit tests | `cd frontend && npm run test` (if vitest added) |

## Build Commands

```powershell
# Frontend production build -> dist/
cd frontend
npm run build

# Backend: no build step required; install deps and run:
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## PWA Setup

`vite-plugin-pwa` handles manifest + service worker automatically in production builds:

- **Manifest**: declared in `vite.config.ts` → `manifest.webmanifest` emitted to `dist/`
- **Service Worker**: `generateSW` strategy with offline app shell + network-first API cache
- **Offline behavior**: UI shell cached; submissions always require network (no false offline-save claims)
- **Icons**: place 72/96/128/144/152/192/384/512 PNGs in `frontend/public/icons/`

## Production Build

```powershell
cd frontend
npm ci
npm run build
# copy frontend/dist/* -> IIS site root
# copy backend/*  -> IIS app folder (e.g. C:\inetpub\hr-api)
```

## IIS Deployment

### Frontend IIS (static SPA)

Copy `frontend/dist/` to `C:\inetpub\hr-app\`. The `web.config` in `frontend/public/web.config` is already emitted to `dist/`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA-Fallback" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api/" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <urlCompression doStaticCompression="true" doDynamicCompression="true" />
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="7.00:00:00" />
      <remove fileExtension=".webmanifest" />
      <mimeMap fileExtension=".webmanifest" mimeType="application/manifest+json" />
    </staticContent>
    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="SAMEORIGIN" />
        <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

### Backend FastAPI → IIS (Recommended: HttpPlatformHandler)

1. Install ASP.NET Core Hosting Bundle 8.x (includes HttpPlatformHandler).
2. Create `C:\inetpub\hr-api\`, copy `backend/` contents here.
3. Create venv and install dependencies inside.
4. Place `web.config` in `C:\inetpub\hr-api\`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <appSettings>
    <add key="ASPNETCORE_ENVIRONMENT" value="Production" />
  </appSettings>
  <system.web>
    <httpRuntime requestValidationMode="4.5" targetFramework="4.8" />
  </system.web>
  <system.webServer>
    <handlers>
      <add name="httpplatformhandler" path="*" verb="*" modules="httpPlatformHandler" resourceType="Unspecified" />
    </handlers>
    <httpPlatform
        processPath="C:\inetpub\hr-api\.venv\Scripts\python.exe"
        arguments="-m uvicorn app.main:app --host 127.0.0.1 --port %HTTP_PLATFORM_PORT% --no-access-log"
        stdoutLogEnabled="true"
        stdoutLogFile=".\logs\python-stdout"
        startupTimeLimit="120"
        requestTimeout="00:05:00">
      <environmentVariables>
        <environmentVariable name="DATABASE_URL" value="mssql+pyodbc://sa:PWD@localhost/HR_DB?driver=ODBC+Driver+18+for+SQL+Server&amp;TrustServerCertificate=yes" />
        <environmentVariable name="CORS_ORIGINS" value="https://hr.example.com" />
        <environmentVariable name="ENVIRONMENT" value="production" />
      </environmentVariables>
    </httpPlatform>
    <httpProtocol>
      <customHeaders>
        <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

5. **IIS Manager** → Add Application under HR site: `/api` pointing to `C:\inetpub\hr-api\` (physical path). AppPool: `No Managed Code`, pipeline=Integrated.
6. Ensure `C:\inetpub\hr-api\logs\` exists with write permissions for `IIS_IUSRS`.
7. Force HTTPS + HSTS at site level.

### Alternative: FastAPI as Windows Service + IIS ARR reverse proxy

1. Install NSSM: `nssm install HR-FastAPI "C:\...\python.exe" "-m uvicorn app.main:app --host 127.0.0.1 --port 8000"` with working dir `C:\inetpub\hr-api`. Set env vars in NSSM.
2. Install ARR 3, enable proxy functionality in IIS Manager → Server Proxy Settings → Enable Proxy.
3. Add URL Rewrite reverse proxy rule for `/api/*` → `http://127.0.0.1:8000/api/*`.

## Environment Variables Reference

### Backend

| Variable | Required | Default | Purpose |
|---|---|---|---|
| DATABASE_URL | Yes | – | SQLAlchemy connection string for SQL Server |
| CORS_ORIGINS | Yes | – | Comma-separated allowed origins |
| ENVIRONMENT | No | development | development/staging/production |
| ADMIN_USERNAME | For seeding | admin | Initial admin username |
| ADMIN_PASSWORD | For seeding | – | Initial admin password |
| ADMIN_FULL_NAME | For seeding | HR Administrator | Initial admin full name |
| ADMIN_EMAIL | For seeding | – | Initial admin email |

### Frontend

| Variable | Required | Default | Purpose |
|---|---|---|---|
| VITE_API_BASE_URL | Yes | – | FastAPI base URL, e.g. `http://localhost:8000/api/v1` |

## Security Considerations

- **Passwords**: Argon2id (via passlib) memory-hard hashing; no plaintext in DB or logs.
- **JWT**: HS256 with long random secret from env only; access + refresh separation; DB-backed revocation for refresh tokens; no secrets in code.
- **CORS**: explicit allowlist from env; never `*` in production.
- **SQL injection protection**: SQLAlchemy ORM + parameterized queries everywhere; no string SQL concatenation.
- **Input validation**: Pydantic v2 on all endpoints + frontend React Hook Form + Zod duplicate checks.
- **Employee invitations**: `secrets.token_urlsafe(32)` (256-bit entropy) tokens; expired/used/revoked tokens rejected; no DB IDs in URLs.
- **Admin actions**: audit_logs table records login/logout/searches/views/invitation creation; never logs credentials or tokens.
- **Secrets management**: All config via environment variables; `.env` gitignored; for production use IIS environmentVariables or Windows System env vars.
- **HTTPS**: HSTS header; TLS terminates at IIS; backend behind LAN-only binding.
- **Error handling**: Generic 500 message in production; full exception details only logged server-side.

## API Documentation

Once the backend is running:

- Swagger UI (interactive): `http://localhost:8000/docs` — supports `Authorize` bearer-token auth.
- ReDoc: `http://localhost:8000/redoc`.

Grouping:
- `/api/v1/auth/*` — admin login, logout.
- `/api/v1/employee/*` — public direct registration and mobile lookup.
- `/api/v1/admin/*` — dashboard, employees search/list/detail, invitations (protected admin routes).

## Testing

### Backend (pytest)

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest tests/ -v --cov=app --cov-report=html --cov-report=term-missing
```

Tests run against SQLite in-memory by default (no SQL Server required for unit tests). Coverage target: ≥ 70% on `app/modules/*`.

### Frontend

```powershell
cd frontend
npm run lint         # ESLint
npx tsc --noEmit     # strict type check
npm run build        # production build (strict errors fail build)
```

## Workflow for HR/Admin

1. Admin visits `https://hr.example.com/admin/login` → logs in.
2. Admin dashboard: creates new invitation (optionally pre-filling mobile number) → secure link generated: `https://hr.example.com/employee-form/<token>`.
3. Link sent to new joiner by email/SMS.
4. New joiner opens link on any device → validates invitation → completes 5-phase form → reviews → submits → receives `EMP-YYMMDD-XXXXXX` reference.
5. Admin: on dashboard, enters mobile number in Search bar → presses Search → opens details page → inspects all 8 sections.

## Troubleshooting IIS Deployments

| Error | Likely fix |
|---|---|
| 500.30 / 502.5 | `stdoutLogFile` path writable? Python path correct? Dependencies installed? See `logs/python-stdout_*.log`. |
| 404 on `/admin/dashboard` F5 | Missing or broken SPA URL Rewrite rule in frontend web.config. |
| 401 on all admin APIs after login | `VITE_API_BASE_URL` mismatch between origins, or missing CORS origin. |
| CORS error in browser | `CORS_ORIGINS` env must include EXACT protocol+host+port of frontend. No trailing slashes. |
| SQL Server connectivity | Test ODBC DSN first; ensure SQL Browser running; `TrustServerCertificate=yes` if self-signed cert; open 1433. |
| PWA install prompt missing | Serve over HTTPS (or http://localhost); manifest + SW valid; no dev-only bypass. |
