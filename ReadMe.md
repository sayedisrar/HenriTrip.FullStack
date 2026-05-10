# ✈️ HenriTrips - Full Stack Travel Guide Platform

[![Angular](https://img.shields.io/badge/Angular-18-red.svg)](https://angular.io/)
[![.NET](https://img.shields.io/badge/.NET-8.0-purple.svg)](https://dotnet.microsoft.com/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-blue.svg)](https://www.microsoft.com/sql-server)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)
[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-success.svg)]()

HenriTrips is a full-stack travel itinerary and guide management platform built with Angular and ASP.NET Core 8 following Clean Architecture principles.

The platform allows administrators to manage travel guides, activities, users, and permissions while providing end users with personalized travel experiences and itinerary access.

---

# 🚀 Features

## 👑 Admin Features

- Guide management (Create / Update / Delete)
- Activity management with categories and scheduling
- User management and role assignment
- Guide invitation and permission system
- Day-by-day itinerary organization
- JWT-secured administration
- Swagger API documentation

---

## 👤 User Features

- Personalized dashboard
- Access only to invited guides
- Detailed itinerary visualization
- Rich activity cards
- Responsive design
- Mobile-friendly interface

---

# 🛠 Tech Stack

## Frontend

- Angular 18
- TypeScript
- RxJS
- Angular Reactive Forms
- Angular Routing
- Standalone Components

---

## Backend

- ASP.NET Core 8 Web API
- Clean Architecture
- Entity Framework Core
- ASP.NET Identity
- SQL Server
- JWT Authentication
- Docker

---

# 🏗 Architecture

```text
HenriTrips.FrontEnd        -> Angular frontend application
HenriTrips.FullStackClean  -> ASP.NET Core Clean Architecture backend
database                   -> SQL scripts and backup
docs                       -> Project documentation
screenshots                -> UI previews
```

---

# 📦 Project Structure

```text
HenriTrips
│
├── HenriTrips.FrontEnd
│
├── HenriTrips.FullStackClean
│   ├── HenriTrips.Api
│   ├── HenriTrips.Application
│   ├── HenriTrips.Domain
│   └── HenriTrips.Infrastructure
│
├── database
├── docs
└── screenshots
```

---

# 🔐 Main Features Implemented

## Authentication & Authorization

- JWT authentication
- Role-based authorization
- Protected API endpoints
- Admin/User roles

---

## Guide Management

- Create guides
- Update guides
- Delete guides
- Invite users to guides
- View personalized guide access

---

## Activity Management

- Create activities
- Multi-day itinerary support
- Categories and scheduling
- Address and contact management

---

# 🐳 Docker Support

The application includes full Docker support.

## Environment Variables

`.env`

```env
DB_PASSWORD=YourStrongPassword
JWT_SECRET=YourVeryStrongJwtSecretKey
DB_NAME=HenriTrips
```

---

## Run Entire Project

```bash
docker compose up --build
```

---

# 🌐 Application Access

## Frontend

```text
http://localhost:4200
```

## Backend API

```text
http://localhost:5000
```

## Swagger

```text
http://localhost:5000/swagger
```

## Health Check

```text
http://localhost:5000/health
```

---

# 🗄 Database

The repository contains a `database` directory including:

- `HenriTrips.sql`
- `HenriTrips.bak`

---

## Database Setup

### Option 1 — SQL Script

1. Open SQL Server Management Studio (SSMS)
2. Execute `HenriTrips.sql`

---

### Option 2 — Restore Backup

1. Open SSMS
2. Restore `HenriTrips.bak`

---

# 👥 Default Test Users

| Email | Password | Role |
|---|---|---|
| admin@henritrips.com | Admin@12345! | Admin |
| user@henritrips.com | User@12345! | User |

---

# 🔧 Local Development

## Frontend

```bash
cd HenriTrips.FrontEnd
npm install
ng serve
```

---

## Backend

```bash
cd HenriTrips.FullStackClean
dotnet restore
dotnet build
dotnet run --project src/HenriTrips.Api
```

---

# ✅ Implemented Engineering Practices

- Clean Architecture
- Layered project structure
- DTO separation
- Use Case pattern
- Dependency Injection
- JWT Security
- Dockerized deployment
- Environment-based configuration
- Health checks
- Swagger documentation

---

# 📸 Screenshots

UI previews are available inside:

```text
/screenshots
```

---

# 📄 License

MIT License
