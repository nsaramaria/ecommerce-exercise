# E-Commerce Cart & Checkout API

Vertical slice of an e-commerce platform inspired by [automationexercise.com](https://automationexercise.com/).

## Status

🚧 Work in progress.

- [x] Database schema and seed data
- [x] Product catalog API
- [ ] User registration and login
- [ ] Shopping cart
- [ ] Checkout
- [ ] Angular frontend

## Tech stack

- ASP.NET Core 8 Web API (raw ADO.NET, no ORM)
- SQL Server / LocalDB
- Angular 17 (planned)

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

## Endpoints (so far)

| Method | Endpoint | Description |
|---|---|---|
| GET  | /api/products      | List all products |
| GET  | /api/products/{id} | Get a single product |
