# 🧭 HenriTrips Frontend

A modern Angular application for managing and exploring travel guides, itineraries, and activities with role-based access control.

---

## 🚀 Features

### 👤 General Users
- Secure authentication (JWT-based login/register)
- Browse travel guides
- Search and filter guides in real time
- View detailed day-by-day itineraries
- Activity details (location, phone, schedule, website)
- Fully responsive UI (mobile / tablet / desktop)

### 👑 Admin Features
- Create, update, delete travel guides
- Manage activities per guide and per day
- User management (create/edit/delete users)
- Role assignment (Admin / User)
- Guide access control (invitation system)

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|--------|
| Angular 18 | Frontend framework |
| TypeScript | Core language |
| RxJS | Reactive state handling |
| Angular Router | Navigation |
| HttpClient | API communication |
| Reactive Forms | Form management |

---

## 📦 Prerequisites

- Node.js 18+
- npm 9+
- Angular CLI

Install Angular CLI globally:

```bash
npm install -g @angular/cli
⚙️ Installation & Setup
# Install dependencies
npm install

# Start development server
ng serve
🌐 Application Access

Once running:

http://localhost:4200
🔗 Backend Connection

This frontend connects to the HenriTrips backend API.

Default API URL:
http://localhost:5000

Make sure backend is running via Docker or .NET before starting frontend.

🔐 Authentication
JWT-based authentication
Role-based access control:
Admin → full system access
User → assigned guides only

📁 Project Structure
Components: UI pages and features
Services: API communication layer
Guards: Route protection
Models: TypeScript interfaces

📌 Notes
Designed to work with HenriTrips Clean Architecture backend
Fully responsive and production-ready UI
Optimized for scalability and maintainability
