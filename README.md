# E-Commerce Cart & Checkout API

A vertical slice of an e-commerce platform, built as the QuestGlobal Fullstack Developer Exercise. Implements a simplified product catalog, registration, login, shopping cart, and checkout — using **ASP.NET Core 8 (no ORM)** for the backend and **Angular 17** for the frontend.

---

## Architecture

```
ecommerce-exercise/
├── backend/
│   ├── ECommerce.Api/         # ASP.NET Core 8 Web API
│   └── ECommerce.Tests/       # xUnit unit tests
├── frontend/                  # Angular 17 SPA (standalone components, Signals)
└── database/
    ├── init-database.sql      # Schema + seed (re-creates DB from scratch)
    └── ECommerceDb.bak        # SQL Server backup file
```

### Highlights

- **Raw ADO.NET** (`Microsoft.Data.SqlClient`) — no EF Core, no ORM of any kind.
- **Server-side total calculation** — the `/api/checkout` endpoint ignores any price sent by the frontend. It looks up each product's price in the database and computes the total itself, preventing price tampering. Verified by unit tests.
- **Transactional order creation** — order header and items are inserted in a single SQL transaction.
- **JWT Bearer auth** with BCrypt password hashing.
- **Dependency Injection** for all repositories, services, and the DB connection factory.
- **State management with Angular Signals** — cart counter updates instantly across all components.
- **9 unit tests** covering checkout business logic (including the server-side price calculation requirement) and authentication.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| .NET SDK | 8.0 or higher | https://dotnet.microsoft.com/download |
| Node.js | 18.13+ (LTS recommended) | https://nodejs.org |
| Angular CLI | 17.x | `npm install -g @angular/cli@17` |
| SQL Server | 2017+ / LocalDB / Express | LocalDB ships with Visual Studio; SQL Express works too |
| `sqlcmd` or SSMS | latest | For restoring the database |

---

## Setup — step by step

### 1. Clone the repository

```bash
git clone https://github.com/nsaramaria/ecommerce-exercise.git
cd ecommerce-exercise
```

### 2. Restore the database

You have two options.

#### Option A — Restore from `.bak` (recommended)

In SSMS:
1. Right-click **Databases** → **Restore Database…**
2. Source: **Device** → click `…` → **Add** → select `database/ECommerceDb.bak`
3. Confirm destination database name is `ECommerceDb` and click **OK**.

Or via `sqlcmd` (adjust the MOVE paths to match your SQL Server data directory):

```bash
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "RESTORE DATABASE ECommerceDb FROM DISK = 'FULL_PATH_TO\database\ECommerceDb.bak' WITH MOVE 'ECommerceDb' TO 'C:\Data\ECommerceDb.mdf', MOVE 'ECommerceDb_log' TO 'C:\Data\ECommerceDb_log.ldf', REPLACE"
```

#### Option B — Run the SQL script

```bash
sqlcmd -S "(localdb)\MSSQLLocalDB" -i database/init-database.sql
```

This creates `ECommerceDb` with the schema and 5 seeded products.

### 3. Configure the connection string (only if needed)

The default connection string in `backend/ECommerce.Api/appsettings.json` targets LocalDB:

```
Server=(localdb)\MSSQLLocalDB;Database=ECommerceDb;Trusted_Connection=True;TrustServerCertificate=True;
```

If you use a different SQL Server instance (e.g. SQL Express), update the `DefaultConnection` value accordingly:

```
Server=localhost\SQLEXPRESS;Database=ECommerceDb;Trusted_Connection=True;TrustServerCertificate=True;
```

### 4. Run the backend

```bash
cd backend
dotnet restore
dotnet run --project ECommerce.Api
```

The API starts on **http://localhost:5000**. Swagger UI is at **http://localhost:5000/swagger**.

### 5. Run the frontend (in a separate terminal)

```bash
cd frontend
npm install
npm start
```

The Angular dev server starts on **http://localhost:4200**. Open that URL in your browser.

---

## Run the tests

### Backend (xUnit)

```bash
cd backend
dotnet test
```

You should see all 9 tests pass — including the critical "Checkout calculates total from DB and ignores client price" test.

### Frontend (Jasmine/Karma)

```bash
cd frontend
npm test
```

---

## API endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create a new user |
| POST | `/api/auth/login` | — | Authenticate, returns JWT |
| GET | `/api/products` | — | List all products |
| GET | `/api/products/{id}` | — | Get a single product |
| POST | `/api/checkout` | Bearer | Place an order |

### Testing endpoints in Swagger

1. POST `/api/auth/register` (or `/api/auth/login`) → copy the `token` from the response.
2. Click **Authorize** at the top of Swagger UI, paste `Bearer <your-token>`, click **Authorize**.
3. POST `/api/checkout` with a body like:

```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 2, "quantity": 1 }
  ],
  "shippingAddress": "Test St 1",
  "city": "Craiova",
  "country": "Romania",
  "zipCode": "200000"
}
```

Note that the request does **not** contain prices. The backend looks them up from the database and returns the computed total in the response.

---

## Design notes

This is a **vertical slice** of an e-commerce platform — not a clone of automationexercise.com. Per the exercise brief:

> "Focus on clean component structure and state management rather than pixel-perfect styling."

The brand identity (palette, typography, animations, product line) is original, inspired loosely by the visual language of modern beauty brands. The 5 seeded products are peptide lip tints with custom tube and card colors; product photos are stored in `frontend/src/assets/products/`, with an automatic CSS fallback if an image fails to load.

---

## Tech stack summary

**Backend:** .NET 8, ASP.NET Core, Microsoft.Data.SqlClient (raw ADO.NET), JWT Bearer auth, BCrypt.Net, Swashbuckle, xUnit, Moq.

**Frontend:** Angular 17, standalone components, Signals, RxJS, Reactive Forms, HttpClient with interceptor for JWT, custom CSS (no Bootstrap), Google Fonts (Fraunces + Inter).

**Database:** SQL Server 2017+ / LocalDB (Express edition compatible).
