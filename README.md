# ReBook

ReBook is a student-to-student platform for exchanging, selling, and donating university textbooks. It connects members of the University of Piraeus community so they can find books for their courses, arrange transactions, and communicate through the application.

This project was developed as coursework for TMD147, Web Application Development, Department of Informatics, University of Piraeus, academic year 2025-26.

## Features

- Student registration using a `@unipi.gr` institutional email address.
- JWT-based authentication and role-based authorization.
- Book listings for exchange, sale, or donation.
- Search and filtering by title, ISBN, department, course, condition, listing type, owner, and status.
- Optional book photos in `jpg`, `jpeg`, `png`, or `webp` format, up to 5 MB.
- Exchange proposals that can include one or more of the requester's active listings.
- Purchase and donation proposals without an offered book.
- Proposal acceptance and rejection by listing owners.
- In-app messaging for each proposal.
- Reviews and ratings from 1 to 5 after an accepted proposal.
- Wishlist items based on a course, title, or ISBN.
- Notifications when a new listing matches a wishlist item.
- User reports and administrative moderation.
- Administrative management of departments, courses, and suggested books.
- Per-course demand statistics for administrators.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS, shadcn/ui-style components |
| Backend | FastAPI, Uvicorn, Pydantic Settings |
| Database | PostgreSQL 16, SQLAlchemy 2, Alembic |
| Authentication | JWT with `python-jose`, password hashing with Passlib/bcrypt |
| Infrastructure | Docker Compose, Docker Desktop, pgAdmin |

## Architecture

The application is split into two services backed by PostgreSQL:

```text
Browser
	|
	+--> React/Vite frontend (localhost:5173)
					|
					+--> FastAPI backend (localhost:8000)
									|
									+--> PostgreSQL database (localhost:5432)
									+--> Uploaded book photos

pgAdmin (localhost:5050) --> PostgreSQL
```

The backend exposes the REST API and serves uploaded files from `/uploads`. The frontend communicates with the backend through the API URL configured by `VITE_API_URL`.

## Project Structure

```text
backend/
	app/
		api/              API dependencies and routers
		core/             Configuration, database, and security
		models/           SQLAlchemy models
		schemas/          Pydantic schemas
		main.py           FastAPI application entry point
	alembic/            Database migrations
	requirements.txt    Python dependencies
	Dockerfile
frontend/
	src/
		components/       Shared and administrative UI components
		context/          Authentication context
		lib/              API client and shared utilities
		pages/             Application pages
	package.json        Frontend scripts and dependencies
	Dockerfile
docker-compose.yml    Local multi-service environment
database_dump.sql     Database dump artifact
```

## Prerequisites

For the Docker setup:

- Docker Desktop with the WSL 2 backend enabled on Windows.
- PowerShell or another terminal that can run Docker Compose.

For manual development:

- Python 3.12 or newer.
- Node.js 20 or newer and npm.
- PostgreSQL 16.

## Quick Start with Docker

Run the following commands from the repository root.

### 1. Configure the environment

Create a root `.env` file from the example configuration:

```powershell
Copy-Item .env.example .env
```

The default values are intended for local development. Review the environment variable table below before using the application outside a local environment.

### 2. Start the services

```powershell
docker compose up -d --build
```

This starts PostgreSQL, pgAdmin, the FastAPI backend, and the Vite frontend. The backend waits for PostgreSQL to become healthy before starting.

### 3. Apply database migrations

```powershell
docker compose exec backend alembic upgrade head
```

### 4. Optionally load sample data

```powershell
docker compose exec backend python -m app.seed
```

Seeding is intended for an empty database and is optional. It may fail or create conflicting data if run repeatedly against an already populated database.

### 5. Open the application

| Service | URL |
| --- | --- |
| ReBook frontend | [http://localhost:5173](http://localhost:5173) |
| FastAPI Swagger UI | [http://localhost:8000/docs](http://localhost:8000/docs) |
| FastAPI ReDoc | [http://localhost:8000/redoc](http://localhost:8000/redoc) |
| FastAPI health check | [http://localhost:8000/health](http://localhost:8000/health) |
| pgAdmin | [http://localhost:5050](http://localhost:5050) |

Inside pgAdmin, use `db` as the PostgreSQL host because pgAdmin runs inside the Docker Compose network. Use the database credentials from the root `.env` file.

### Reset the local database

The following command removes the PostgreSQL Docker volume and permanently deletes all local database data:

```powershell
docker compose down -v
docker compose up -d --build
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.seed
```

Only use this reset procedure when deleting the current local data is intentional.

## Environment Variables

### Docker Compose variables

These variables are read from the root `.env` file by `docker-compose.yml`:

| Variable | Purpose | Development example |
| --- | --- | --- |
| `POSTGRES_USER` | PostgreSQL username | `rebook` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `rebook` |
| `POSTGRES_DB` | PostgreSQL database name | `rebook` |
| `PGADMIN_EMAIL` | pgAdmin login email | `admin@example.com` |
| `PGADMIN_PASSWORD` | pgAdmin login password | `admin` |
| `SECRET_KEY` | Secret used to sign JWTs | `password` |
| `DATABASE_URL` | Backend connection string | `postgresql://rebook:rebook@db:5432/rebook` |

The example credentials are for local development only. Replace `SECRET_KEY`, database passwords, and pgAdmin credentials before any shared or deployed environment is used.

### Frontend API URL

The frontend reads `VITE_API_URL` from its Vite environment configuration. It defaults to:

```dotenv
VITE_API_URL=http://localhost:8000
```

When running the frontend manually, place this variable in `frontend/.env` if the backend is available at a different URL.

### Manual backend configuration

For a manual backend setup, create `backend/.env` with values suitable for the local PostgreSQL instance:

```dotenv
DATABASE_URL=postgresql://bookexchange:devpassword@localhost:5432/bookexchange
SECRET_KEY=replace-with-a-random-secret
```

The root `.env` used by Docker Compose and `backend/.env` used by a manually started backend are separate configurations.

## Demo Accounts

Running the seed script creates the following development accounts. Every seeded account uses the password `secret123`.

| Email | Role | Notes |
| --- | --- | --- |
| `admin@unipi.gr` | Admin | Access to administrative features |
| `maria@unipi.gr` | Student | Sample student account |
| `giannis@unipi.gr` | Student | Sample student account |
| `eleni@unipi.gr` | Student | Sample student account |
| `kostas@unipi.gr` | Student | Sample student account |
| `nikos@unipi.gr` | Student | Seeded as blocked |

These credentials are for demonstrations and local development only. Do not use them in a deployed environment.

## Manual Development Setup

### Create a PostgreSQL database

Create a database and user in a local PostgreSQL installation:

```sql
CREATE USER bookexchange WITH PASSWORD 'devpassword';
CREATE DATABASE bookexchange OWNER bookexchange;
```

### Run the backend

From the repository root:

```powershell
Set-Location backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
alembic upgrade head
```

Optionally load the sample data:

```powershell
python -m app.seed
```

Start FastAPI with Uvicorn:

```powershell
uvicorn app.main:app --reload --port 8000
```

### Run the frontend

Open a second terminal:

```powershell
Set-Location frontend
npm install
npm run dev
```

The frontend is available at [http://localhost:5173](http://localhost:5173).

## Using the Application

1. Register with a `@unipi.gr` email address or use one of the seeded development accounts.
2. Browse listings and filter them by course, department, title, ISBN, condition, type, or status.
3. Create a listing for an exchange, sale, or donation. An optional book photo can be uploaded.
4. Submit a proposal. Exchange proposals may include active listings owned by the requester.
5. Use the proposal message thread to arrange the handoff.
6. Listing owners can accept or reject incoming proposals.
7. After a proposal is accepted, participants can submit reviews with ratings from 1 to 5.
8. Add course, title, or ISBN criteria to the wishlist to receive matching-listing notifications.
9. Report another user when moderation is needed.
10. Administrators can manage the academic catalog, review reports, block or unblock users, and inspect demand statistics by course.

The application checks the institutional email suffix during registration. It does not implement an email verification workflow.

## API Overview

The backend exposes an automatically generated OpenAPI specification. Use Swagger UI at `/docs` or ReDoc at `/redoc` for request and response schemas.

Protected endpoints require:

```http
Authorization: Bearer <jwt-token>
```

Login uses OAuth2 form encoding. The email is sent in the `username` field and the password in the `password` field.

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a student account |
| `POST` | `/auth/login` | Log in and receive a JWT |
| `GET` | `/me` | Get the current authenticated user |

### Academic catalog

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/departments` | List departments |
| `GET` | `/courses` | List courses |
| `GET` | `/courses/{course_id}/suggested-books` | List suggested books for a course |

### Listings

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/listings/upload-photo` | Upload a listing photo |
| `POST` | `/listings` | Create a listing |
| `GET` | `/listings` | Search and filter listings |
| `GET` | `/listings/{listing_id}` | Get listing details |
| `PATCH` | `/listings/{listing_id}/status` | Update listing status |

Listing filters include `owner_id`, `course_id`, `department_id`, `title`, `isbn`, `condition`, `type`, and `status_filter`.

### Proposals, messages, and reviews

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/listings/{listing_id}/proposals` | Submit a proposal |
| `GET` | `/listings/{listing_id}/proposals` | List proposals for a listing |
| `GET` | `/proposals/mine` | List the current user's proposals |
| `GET` | `/proposals/{proposal_id}` | Get proposal details |
| `PATCH` | `/proposals/{proposal_id}/status` | Accept or reject a proposal |
| `POST` | `/proposals/{proposal_id}/messages` | Send a proposal message |
| `GET` | `/proposals/{proposal_id}/messages` | List proposal messages |
| `POST` | `/proposals/{proposal_id}/reviews` | Submit a review |
| `GET` | `/proposals/{proposal_id}/reviews` | List proposal reviews |
| `GET` | `/users/{user_id}/rating` | Get a user's rating |

### Wishlist and notifications

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/wishlist` | Create a wishlist item |
| `GET` | `/wishlist` | List the current user's wishlist |
| `DELETE` | `/wishlist/{item_id}` | Delete a wishlist item |
| `GET` | `/notifications` | List notifications |
| `PATCH` | `/notifications/{notification_id}/read` | Mark a notification as read |

### Reports and administration

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/reports` | Report a user |
| `POST` / `DELETE` | `/admin/departments` | Create or delete departments |
| `POST` / `DELETE` | `/admin/courses` | Create or delete courses |
| `POST` / `DELETE` | `/admin/suggested-books` | Create or delete suggested books |
| `GET` | `/admin/users` | List users |
| `GET` | `/admin/reports` | List reports |
| `PATCH` | `/admin/reports/{report_id}/resolve` | Resolve a report |
| `PATCH` | `/admin/users/{user_id}/block` | Block a user |
| `PATCH` | `/admin/users/{user_id}/unblock` | Unblock a user |
| `GET` | `/admin/stats/demand` | View course demand statistics |

Administrative endpoints require the `admin` role.

## Database and Migrations

Alembic migrations are stored in `backend/alembic/versions`. Apply all pending migrations with:

```powershell
docker compose exec backend alembic upgrade head
```

For a manually running backend, run `alembic upgrade head` from the `backend` directory.

The repository also contains `database_dump.sql` as a database dump artifact. The normal supported local setup is the Docker Compose database followed by the Alembic migrations and optional seed command described above.

## Development Commands

Frontend commands, run from `frontend/`:

```powershell
npm run dev       # Start the Vite development server
npm run build     # Create a production frontend build
npm run lint      # Run oxlint
npm run preview   # Preview the production build
```

Backend command, run from `backend/`:

```powershell
uvicorn app.main:app --reload --port 8000
```

The repository currently does not include an automated test suite or CI workflow. The interactive API documentation and frontend lint/build commands are available for development validation.

## Security and Deployment Notes

The included Docker Compose configuration is designed for local development. It uses development credentials, bind mounts, Uvicorn reload mode, and the Vite development server.

Before deploying or sharing an instance:

- Replace all database, pgAdmin, and JWT secret values.
- Do not use the seeded demo credentials.
- Configure CORS for the actual frontend origin. The current backend configuration allows the local Vite origin at `http://localhost:5173`.
- Review how uploaded files are stored and served.
- Use a production frontend build and a production-grade ASGI deployment configuration.
- Treat JWTs stored by the frontend in `localStorage` as a deployment security consideration.

## Academic Context

ReBook was developed individually to fulfill the exam-period assignment ("Απαλλακτική Εργασία") requirements for TMD147, Web Application Development, at the University of Piraeus, September 2026.
