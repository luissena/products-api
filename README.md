# Products API - Technical Challenge Solution 🚀

A NestJS-based REST API for product management that synchronizes with Contentful API.  
This project was developed in approximately **5 hours** as part of the technical challenge.

## 📋 Challenge Requirements Met

- ✅ **Automated Contentful Sync**: Hourly synchronization with Contentful API using BullMQ scheduler
- ✅ **Public Product API**: Paginated product listing (max 5 items) with advanced filtering
- ✅ **Private Reports Module**: JWT-protected analytics with custom reporting capabilities
- ✅ **Soft Delete Functionality**: Products remain deleted across application restarts
- ✅ **Comprehensive Testing**: >80% test coverage with unit and E2E tests
- ⚠️ **Limitations due to time**:
  - No full Dockerization (only `docker-compose` for Postgres and Redis in development)
  - No database migrations implemented
  - Database schema and delete mechanism could be further refined using Contentful’s delete subscriptions
  - No GitHub Actions CI/CD configured

---

## 🏗️ Architecture & Technology Stack

- **Framework**: NestJS with TypeScript (Node.js 22 LTS)
- **Database**: PostgreSQL with TypeORM
- **Queue System**: BullMQ for Contentful synchronization
- **Caching**: Redis
- **Authentication**: JWT-based
- **API Docs**: Swagger/OpenAPI at `/api`

---

## 🚀 How to Run

You can run the project **locally with Node.js** or using **Docker Compose** for dependencies.

### 1. Running with Docker Compose (Postgres + Redis)

```bash
# Start Postgres and Redis
docker-compose up -d
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy the example environment file and adjust the values:

```bash
cp .env.example .env
```

### 4. Run the Application

```bash
npm run start:dev
```

### 5. Generate an API Key (for private modules)

```bash
npm run generate:api-key
```

Use the generated API key as a **Bearer Token** when calling private endpoints.

---

## 📊 API Examples

### Public Endpoint: List Products

```http
GET /products?pagination[skip]=0&pagination[limit]=5&filters[name][contains]=iPhone
```

### Private Endpoint: Reports (JWT Required)

```http
GET /reports/products
Authorization: Bearer <jwt-token>
```

---

## 📝 Notes

- This project was completed in **~5 hours**.
- The focus was on covering the **core requirements** of the challenge.
- Several areas (migrations, advanced delete handling, CI/CD, production Docker setup) were left for future improvements.

---

**Thank you for reviewing this solution!** 🚀
