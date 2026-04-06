# ✈️ HenriTrips - Travel Guide Platform

[![Angular](https://img.shields.io/badge/Angular-18-red.svg)](https://angular.io/)
[![.NET](https://img.shields.io/badge/.NET-8.0-purple.svg)](https://dotnet.microsoft.com/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-blue.svg)](https://www.microsoft.com/sql-server)

A full-stack travel guide management platform that allows administrators to create and manage travel itineraries, while providing users with personalized guide access.

## 🚀 Features

### 👑 Admin Features
- **Guide Management** - Create, edit, delete travel guides
- **Activity Management** - Add activities with categories, addresses, phone, hours, website
- **User Management** - Create, edit, delete users, assign roles
- **Guide Access Control** - Invite specific users to access specific guides
- **Day-by-Day Itinerary** - Organize activities across multiple days

### 👤 User Features
- **Personalized Dashboard** - See only guides you're invited to
- **Detailed Itineraries** - View day-by-day activities with all details
- **Rich Activity Cards** - Address, phone, hours, website, category icons
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🛠 Tech Stack

### Frontend
- Angular 18
- TypeScript
- RxJS
- Reactive Forms
- PWA Support

### Backend
- .NET 8
- ASP.NET Core Identity
- Entity Framework Core
- SQL Server
- JWT Authentication

## 📦 Prerequisites

- Node.js 18+
- Angular CLI: `npm install -g @angular/cli`
- .NET SDK 8.0
- SQL Server

## Database

The solution includes a **`database`** directory containing the following files:

- `HenriTrips.sql` – SQL script to create and populate the database.  
- `HenriTrips.bak` – SQL Server backup file of the database.

### Setup Instructions

#### Option 1: Using the SQL Script (Recommended)
1. Open **SQL Server Management Studio (SSMS)** or any SQL client.  
2. Run `HenriTrips.sql` to create the database and populate its tables.  

#### Option 2: Using the Backup File (`.bak`)
1. Open **SSMS**.  
2. Restore the database using `HenriTrips.bak`.  
3. The database will include all tables and data as in the backup.

### Default Users
The database comes with **predefined users** for testing:

| Email             | Password     | Role           |
|------------------|-------------|----------------|
| Admin@gmail.com   | Admin@123   | Administrator  |
| User@gmail.com    | User@123    | Standard User  |

> Both setup methods (`.sql` or `.bak`) include these default users so you can log in immediately and test the application.

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/HenriTrips.git
cd HenriTrips
