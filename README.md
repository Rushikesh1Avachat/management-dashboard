# User Management Dashboard

This repository contains a complete user management application split into two folders:

- `management-frontend` — React + Vite + Tailwind CSS frontend
- `management-backend` — Node.js + Express + MongoDB + Mongoose backend

## Features

- View a paginated list of users with ID, first name, last name, email, and department
- Add, edit, and delete users
- Search, filter, and sort users
- Responsive UI with modal forms and toast feedback
- Backend REST API for real user persistence via MongoDB

## Setup

### Backend

1. Change to the backend folder:

```bash
cd management-backend
```

2. Install backend dependencies:

```bash
npm install
```

3. Create a `.env` file from `.env.example` and set your MongoDB URI.

4. Optionally seed the MongoDB database with demo users:

```bash
npm run seed
```

5. Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:4000`.

### Frontend

1. Change to the frontend folder:

```bash
cd management-frontend
```

2. Install frontend dependencies:

```bash
npm install
```

3. Start the frontend app:

```bash
npm run dev
```

Visit the local Vite URL shown in the terminal (typically `http://localhost:5173`).

## Notes

- The frontend uses a Vite proxy to forward `/api` requests to the backend.
- The backend auto-assigns sequential `id` values when new users are created.
- MongoDB is required for the backend. Use `MONGO_URI` to point to your database.

## Project Structure

- `management-frontend/`
  - `src/App.jsx` — main user management interface
  - `src/styles.css` — Tailwind-powered styles
  - `vite.config.js` — includes an API proxy
- `management-backend/`
  - `server.js` — Express server and MongoDB connection
  - `models/User.js` — Mongoose user model
  - `routes/users.js` — REST API routes

## Improvements

Additional enhancements that can be added:

- Authentication and role-based access
- Server-side pagination and filtering
- Automated test coverage for frontend and backend
- Deployment scripts for Docker or cloud hosting

## Deployment

Build the frontend with:

```bash
cd management-frontend
npm run build
```

Deploy the backend to any Node.js host and connect it to a MongoDB instance.
