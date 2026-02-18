# TaskFlow — Frontend

React + Vite + TailwindCSS frontend for the Scalable Web App backend.

## Tech Stack

- **React 18** with functional components & hooks
- **React Router v6** for routing & protected routes
- **Context API** for global state (Auth + Tasks)
- **TailwindCSS** for styling with custom design system
- **Axios** with JWT interceptors & auto-refresh
- **react-hot-toast** for notifications
- **date-fns** for date formatting

## Project Structure

```
src/
├── App.jsx                          # Root routes
├── main.jsx                         # Entry point
├── index.css                        # Tailwind + custom CSS
├── context/
│   ├── AuthContext.jsx              # Auth state (login, signup, logout)
│   └── TaskContext.jsx              # Task CRUD state
├── services/
│   ├── api.js                       # Axios instance + JWT interceptors
│   └── index.js                     # Auth, user, task API functions
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── DashboardPage.jsx            # Stats + recent tasks overview
│   ├── TasksPage.jsx                # Full CRUD + search + filter
│   └── ProfilePage.jsx             # Profile edit + change password
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx       # Redirects to /login if not authenticated
│   ├── layout/
│   │   ├── Sidebar.jsx              # Nav sidebar (desktop + mobile drawer)
│   │   └── DashboardLayout.jsx     # Layout wrapper
│   ├── tasks/
│   │   ├── TaskCard.jsx             # Individual task card
│   │   ├── TaskFormModal.jsx        # Create/edit modal with validation
│   │   └── TaskFilters.jsx          # Search + filter + sort bar
│   └── ui/
│       └── index.jsx               # Input, Button, Modal, Avatar, Badge, etc.
└── utils/
    └── index.js                     # Date helpers, config maps, error extractor
```

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Make sure `.env` exists:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the dev server
```bash
npm run dev
```

Open http://localhost:3000

> Make sure the backend is running on port 5000 first.

## Features

### Auth
- Signup with password strength indicator
- Login with JWT stored in localStorage
- Auto token refresh on 401 via Axios interceptor
- Protected routes — redirects unauthenticated users to /login

### Dashboard
- Stats cards: completed, in-progress, overdue, todo
- Recent tasks list with status badges

### Tasks
- Create, read, update, delete tasks
- Full-text search with debounce
- Filter by status and priority
- Sort by date, due date, priority, or title
- Pagination
- Confirm modal for destructive deletes
- Tag display

### Profile
- Edit name, bio, avatar URL
- Change password with validation
- Soft-delete account
```
