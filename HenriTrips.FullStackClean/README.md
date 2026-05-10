# 🚀 HenriTrips Backend API

A travel guide management API built with ASP.NET Core 8 using Clean Architecture principles.

---

## ✨ Features

- 🔐 Authentication (JWT-based login & registration)
- 🧭 Guide Management (CRUD operations)
- 📍 Activity Management (address, phone, schedule, website)
- 👥 User Management (Admin-only CRUD)
- 🛡 Role-Based Access Control (Admin / User)
- 🎟 Guide Permission System (user invitations)

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| .NET | 8.0 | Runtime framework |
| ASP.NET Core | 8.0 | Web API |
| Entity Framework Core | 8.0 | ORM |
| SQL Server | 2022 | Database |
| JWT Bearer | 8.0 | Authentication |
| FluentValidation | 11.x | Validation |
| xUnit | 2.5 | Testing |

---

## 📦 Prerequisites

- .NET 8 SDK
- SQL Server 2022 or Docker Desktop

---

## 🚀 Quick Start (Docker Recommended)

git clone https://github.com/yourusername/HenriTrips.git
cd HenriTrips.FullStackClean

DB_PASSWORD=YourStrongPassword123!
JWT_SECRET=your-super-secret-key-min-32-chars-long
DB_NAME=HenriTrips

docker compose up --build

---

## 🌐 Application URLs

- API: http://localhost:5000
- Swagger: http://localhost:5000/swagger
- Health Check: http://localhost:5000/health

---

## 🔐 Default Admin Account

Email: admin@henritrips.com
Password: Admin@12345!

---

## 📡 API Endpoints

Authentication:
POST /api/Auth/login
POST /api/Auth/register

Users (Admin):
GET /api/Auth/users
POST /api/Auth/create-user
PUT /api/Auth/users/{id}
DELETE /api/Auth/delete-user/{id}

Guides:
GET /api/guides
POST /api/guides
PUT /api/guides/{id}
DELETE /api/guides/{id}

Activities:
GET /api/activities/guide/{guideId}
POST /api/activities
PUT /api/activities/{id}
DELETE /api/activities/{id}

---

## 📦 Docker Commands

docker compose up --build
docker compose down
docker compose logs -f

---

## 📁 Project Structure

src/
- HenriTrips.Domain
- HenriTrips.Application
- HenriTrips.Infrastructure
- HenriTrips.Api

tests/
- UnitTests
- IntegrationTests

---

## ⚠️ Troubleshooting

SQL Server delay: wait 30 seconds
JWT error: ensure secret is 32+ characters
Migration issue: re-run EF migration

---

 
