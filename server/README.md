# 🚀 Primetrade-Task Crud — Backend

A production-ready REST API built with **Node.js + Express + MongoDB**.
Supports JWT authentication, user profile management, and full CRUD on Tasks.

---

## 📁 Project Structure

```
Server-side/
├── src/
│   ├── app.js                  # Express app setup & middleware
│   ├── server.js               # Entry point — connects DB, starts server
│   ├── config/
│   │   └── database.js         # Mongoose connection with reconnect handling
│   ├── controllers/
│   │   ├── authController.js   # signup, login, refresh, logout, changePassword
│   │   ├── userController.js   # getMe, updateMe, deleteMe, admin user ops
│   │   └── taskController.js   # Full CRUD + search + filter + stats
│   ├── middleware/
│   │   ├── auth.js             # protect, restrictTo, optionalAuth
│   │   ├── errorHandler.js     # Global error handler + express-validator bridge
│   │   └── rateLimiter.js      # General + auth-specific rate limiting
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt hooks
│   │   └── Task.js             # Task schema with text index + completedAt hook
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   └── task.routes.js
│   ├── utils/
│   │   ├── AppError.js         # Custom operational error class
│   │   ├── catchAsync.js       # Async error wrapper
│   │   ├── logger.js           # Winston logger
│   │   └── tokenUtils.js       # JWT sign/verify helpers
│   └── validators/
│       └── index.js            # All express-validator chains
└── tests/
    └── auth.test.js            # Jest + Supertest integration tests
```

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
```

### 3. Run in development
```bash
npm run dev
```

### 4. Run tests
```bash
npm test
```

---

## 🔐 API Reference

### Base URL
```
https://primetrade-6bhi.onrender.com/api
```

### Authentication
All protected endpoints require:
```
Authorization: Bearer <accessToken>
```

---

### Auth Routes `/api/auth`

| Method | Endpoint             | Auth | Description                  |
|--------|----------------------|------|------------------------------|
| POST   | `/signup`            | No   | Register a new user          |
| POST   | `/login`             | No   | Login and receive tokens     |
| POST   | `/refresh`           | No   | Refresh access token         |
| POST   | `/logout`            | Yes  | Logout (clears cookie)       |
| PATCH  | `/change-password`   | Yes  | Update password              |

#### POST `/api/auth/signup`
```json
// Request
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123",
  "passwordConfirm": "Password123"
}

// Response 201
{
  "status": "success",
  "accessToken": "<jwt>",
  "data": { "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" } }
}
```

#### POST `/api/auth/login`
```json
// Request
{ "email": "jane@example.com", "password": "Password123" }

// Response 200
{ "status": "success", "accessToken": "<jwt>", "data": { "user": {...} } }
```

---

### User Routes `/api/users`

| Method | Endpoint   | Auth  | Role  | Description              |
|--------|------------|-------|-------|--------------------------|
| GET    | `/me`      | Yes   | Any   | Fetch current profile    |
| PATCH  | `/me`      | Yes   | Any   | Update name/bio/avatar   |
| DELETE | `/me`      | Yes   | Any   | Soft-delete account      |
| GET    | `/`        | Yes   | Admin | List all users           |
| GET    | `/:id`     | Yes   | Admin | Get user by ID           |

#### PATCH `/api/users/me`
```json
// Request (all fields optional)
{ "name": "Jane Smith", "bio": "Developer.", "avatar": "https://..." }

// Response 200
{ "status": "success", "data": { "user": {...} } }
```

---

### Task Routes `/api/tasks`

| Method | Endpoint        | Description                        |
|--------|-----------------|------------------------------------|
| GET    | `/`             | List tasks (filter, search, page)  |
| POST   | `/`             | Create a task                      |
| GET    | `/stats`        | Task statistics                    |
| DELETE | `/bulk?status=` | Bulk delete by status              |
| GET    | `/:id`          | Get single task                    |
| PATCH  | `/:id`          | Update task                        |
| DELETE | `/:id`          | Delete task                        |

#### GET `/api/tasks` — Query Parameters

| Param      | Type   | Description                                         |
|------------|--------|-----------------------------------------------------|
| `status`   | string | Filter: `todo`, `in-progress`, `completed`, `archived` |
| `priority` | string | Filter: `low`, `medium`, `high`, `urgent`           |
| `tags`     | string | Comma-separated tag filter: `work,personal`         |
| `search`   | string | Full-text search on title & description             |
| `dueBefore`| ISO date | Tasks due before this date                        |
| `dueAfter` | ISO date | Tasks due after this date                         |
| `sortBy`   | string | `createdAt` (default), `dueDate`, `priority`, `title` |
| `order`    | string | `desc` (default) or `asc`                          |
| `page`     | number | Page number (default: 1)                            |
| `limit`    | number | Results per page (default: 20, max: 100)            |

#### POST `/api/tasks`
```json
// Request
{
  "title": "Build authentication",
  "description": "JWT-based auth with refresh tokens",
  "priority": "high",
  "status": "todo",
  "tags": ["backend", "security"],
  "dueDate": "2024-12-31T00:00:00.000Z"
}

// Response 201
{ "status": "success", "data": { "task": { "_id": "...", "title": "...", ... } } }
```

---

## 🔒 Security Features

| Feature              | Implementation                          |
|----------------------|-----------------------------------------|
| Password hashing     | bcrypt (12 rounds)                      |
| JWT Auth             | Short-lived access token (7d) + long-lived refresh (30d) in HttpOnly cookie |
| Rate limiting        | 100 req/15min general, 10 req/15min auth |
| NoSQL injection      | express-mongo-sanitize                  |
| HTTP headers         | helmet                                  |
| Input validation     | express-validator on all endpoints      |
| CORS                 | Configured to frontend origin only      |

---

## 🗄️ Data Models

### User
| Field             | Type    | Notes                            |
|-------------------|---------|----------------------------------|
| name              | String  | 2–50 chars                       |
| email             | String  | Unique, lowercase                |
| password          | String  | Hashed, never returned           |
| bio               | String  | Max 300 chars                    |
| avatar            | String  | URL                              |
| role              | String  | `user` / `admin`                 |
| isActive          | Boolean | Soft-delete flag                 |
| lastLogin         | Date    | Updated on each login            |
| passwordChangedAt | Date    | Checked against JWT iat          |

### Task
| Field       | Type     | Notes                                          |
|-------------|----------|------------------------------------------------|
| title       | String   | Required, max 100 chars                        |
| description | String   | Max 1000 chars                                 |
| status      | String   | `todo`, `in-progress`, `completed`, `archived` |
| priority    | String   | `low`, `medium`, `high`, `urgent`              |
| tags        | [String] | Max 10 tags                                    |
| dueDate     | Date     | Optional                                       |
| completedAt | Date     | Auto-set when status → completed               |
| user        | ObjectId | Reference to User                              |

---

## 🧪 Running Tests

```bash
npm test               # Run all tests with coverage
npm test -- --watch    # Watch mode
```
