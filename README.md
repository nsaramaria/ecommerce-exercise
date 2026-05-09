# E-Commerce Cart & Checkout API

Vertical slice of an e-commerce platform inspired by [automationexercise.com](https://automationexercise.com/).

## Status

🚧 Work in progress.

- [x] Database schema and seed data
- [x] Product catalog API
- [x] User registration and login (JWT)
- [x] Checkout with server-side price calculation
- [x] Backend unit tests
- [ ] Angular frontend

## Tech stack

- ASP.NET Core 8 Web API (raw ADO.NET, no ORM)
- JWT Bearer authentication, BCrypt password hashing
- xUnit + Moq for tests
- SQL Server / LocalDB
- Angular 17 (planned)

## Highlights

- **No ORM** — repositories use `Microsoft.Data.SqlClient` directly with parameterized queries.
- **Server-side checkout total** — the API ignores any price the client sends. It looks up each product's price from the database and computes the total itself, preventing price tampering.
- **Transactional order creation** — order header + items are inserted in a single transaction so partial orders never persist.
- **Dependency Injection** for repositories, services, and the DB connection factory.
- **Unit tests** cover the critical price-calculation logic and auth flows.

## Running locally (so far)

### 1. Restore the database

```bash
sqlcmd -S "(localdb)\MSSQLLocalDB" -i database/init-database.sql
```

### 2. Run the API

```bash
cd backend
dotnet restore
dotnet run --project ECommerce.Api
```

API will start on http://localhost:5000. Swagger UI at http://localhost:5000/swagger.

### 3. Run unit tests

```bash
cd backend
dotnet test
```

## API endpoints

| Method | Endpoint              | Auth   | Description |
|--------|-----------------------|--------|-------------|
| POST   | /api/auth/register    | —      | Create a new user |
| POST   | /api/auth/login       | —      | Authenticate, returns JWT |
| GET    | /api/products         | —      | List all products |
| GET    | /api/products/{id}    | —      | Get a single product |
| POST   | /api/checkout         | Bearer | Place an order |

## Authenticating in Swagger

1. POST to `/api/auth/register` (or `/api/auth/login`) and copy the `token` from the response.
2. Click the **Authorize** button at the top of Swagger UI.
3. Enter `Bearer <your-token>` and click **Authorize**.
4. You can now call `/api/checkout`.
