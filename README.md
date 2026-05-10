# E-Commerce Cart & Checkout API

A vertical slice of an e-commerce platform inspired by [automationexercise.com](https://automationexercise.com/), implementing product catalog, registration, login, shopping cart, and checkout — built with **ASP.NET Core 8 (no ORM)** and **Angular 17**.

## Architecture

```
ecommerce-exercise/
├── backend/                   # .NET 8 Web API (C#)
│   ├── ECommerce.Api/         # Controllers, Services, Repositories, Models
│   └── ECommerce.Tests/       # xUnit tests
├── frontend/                  # Angular 17 SPA (standalone components, signals)
│   └── src/app/               # Components, services, guards, interceptors
└── database/
    ├── init-database.sql      # Schema + seed data
    └── ECommerceDb.bak        # (Generate per instructions below)
```

### Highlights

- **Backend uses raw ADO.NET** (`Microsoft.Data.SqlClient`) — no EF Core or other ORM.
- **Checkout recalculates total from the database** — the API ignores any price the client sends and looks each product up by `Id` to compute `UnitPrice * Quantity` server-side.
- **JWT auth** with BCrypt password hashing.
- **Dependency Injection** is used throughout for repositories, services, and the DB connection factory.
- **Angular state management** uses Signals (`signal()` / `computed()`) — the cart counter updates instantly across all components.
- **Unit tests** in xUnit (backend) and Jasmine/Karma (frontend).

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| .NET SDK | 8.0+ | https://dotnet.microsoft.com/download |
| Node.js | 18.13+ or 20+ | https://nodejs.org |
| Angular CLI | 17.x | `npm install -g @angular/cli@17` |
| SQL Server | 2017+ / LocalDB / Express | LocalDB ships with Visual Studio; otherwise use SQL Express |
| SSMS or `sqlcmd` | latest | For running the SQL script and `.bak` file |

---

## Step 1 — Restore the database

You have two options.

### Option A — Restore from the `.bak` file (recommended for graders)

In SSMS:
1. Right-click **Databases** → **Restore Database…**
2. Source: **Device** → click `…` → **Add** → select `database/ECommerceDb.bak`
3. Confirm destination DB name is `ECommerceDb` and click **OK**.

Or via `sqlcmd`:
```bash
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "RESTORE DATABASE ECommerceDb FROM DISK = 'FULL_PATH_TO\database\ECommerceDb.bak' WITH MOVE 'ECommerceDb' TO 'C:\Data\ECommerceDb.mdf', MOVE 'ECommerceDb_log' TO 'C:\Data\ECommerceDb_log.ldf', REPLACE"
```

### Option B — Run the SQL script

```bash
sqlcmd -S "(localdb)\MSSQLLocalDB" -i database/init-database.sql
```

This creates `ECommerceDb` with the schema and 15 seeded products.

### Connection string

The default connection string in `backend/ECommerce.Api/appsettings.json` is:

```
Server=(localdb)\MSSQLLocalDB;Database=ECommerceDb;Trusted_Connection=True;TrustServerCertificate=True;
```

If you are using a different SQL Server instance (e.g. SQL Express), update the `DefaultConnection` value accordingly:

```
Server=localhost\SQLEXPRESS;Database=ECommerceDb;Trusted_Connection=True;TrustServerCertificate=True;
```

---

## Step 2 — Run the backend

From the repo root:

```bash
cd backend
dotnet restore
dotnet run --project ECommerce.Api
```

The API will start on **http://localhost:5000**.

Swagger UI is available at **http://localhost:5000/swagger**.

### Run backend tests

```bash
cd backend
dotnet test
```

You should see all xUnit tests pass — including the critical "Checkout calculates total from DB and ignores client price" test.

---

## Step 3 — Run the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm start
```

The Angular dev server will start on **http://localhost:4200**. Open that URL in your browser.

### Run frontend tests

```bash
cd frontend
npm test
```

---

## Using the app

1. Visit http://localhost:4200 — you'll land on the **Products** page (15 items pre-seeded).
2. Click **Register** in the top-right and create an account.
3. Click **Add to cart** on any product — note the cart counter updates instantly (Signals in action).
4. Open **Cart**, adjust quantities or remove items.
5. Click **Proceed to checkout**, fill in a shipping address, and **Place Order**.
6. The order is persisted to the `Orders`/`OrderItems` tables. The success message displays the **server-confirmed total**.

### Try the price-tampering protection

If you intercept the checkout request (e.g., via browser DevTools), you'll notice the frontend sends only `{ productId, quantity }` per item — no prices. The backend looks up each product's price in the database and computes the total itself. Even if you tampered with the request, the server response would always reflect the true DB price.

---

## API endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create a new user |
| POST | `/api/auth/login` | — | Authenticate, returns JWT |
| GET | `/api/products` | — | List all products |
| GET | `/api/products/{id}` | — | Get a single product |
| POST | `/api/checkout` | Bearer | Place an order |

---

## Generating a fresh `.bak` file

If you modify the database and want to regenerate the backup, run in SSMS or `sqlcmd`:

```sql
BACKUP DATABASE ECommerceDb
TO DISK = 'FULL_PATH_TO\database\ECommerceDb.bak'
WITH FORMAT, INIT, COMPRESSION;
```

Commit the resulting `.bak` to the repository.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot connect to (localdb)\MSSQLLocalDB` | Run `sqllocaldb start MSSQLLocalDB`. If LocalDB isn't installed, install it from the SQL Server Express installer. |
| CORS error in browser | Ensure backend is running on port 5000 and frontend on 4200. The `Cors:AllowedOrigins` array in `appsettings.json` controls this. |
| `dotnet: command not found` | Install the .NET 8 SDK from the link in Prerequisites. |
| `ng: command not found` | Run `npm install -g @angular/cli@17`. |
| Frontend builds but API calls fail | Check `frontend/src/app/config.ts` — `API_BASE_URL` must match the backend port. |
| Tests fail with `BCrypt` errors | Run `dotnet restore` in the backend directory first. |

---

## Tech stack summary

**Backend:** .NET 8, ASP.NET Core, Microsoft.Data.SqlClient (raw ADO.NET), JWT Bearer auth, BCrypt.Net, Swashbuckle, xUnit, Moq.

**Frontend:** Angular 17, standalone components, Signals, RxJS, Reactive Forms, HttpClient with interceptor, Bootstrap 5 (CDN).

**Database:** SQL Server 2017+ / LocalDB.
