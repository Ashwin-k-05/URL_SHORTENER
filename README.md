# ⚡ Sniply — Full-Stack URL Shortener

A modern, full-stack URL shortener built with React, Node.js (Express), and MongoDB. Features JWT authentication, click analytics, custom aliases, and a clean dark-themed dashboard.

---
##LOOM VIDEO
https://www.loom.com/share/5c40b1e45dfc4aa896b9fb679dc810b0

## 📸 Features

- **User Authentication** — Secure signup/login with bcrypt password hashing and JWT tokens
- **Protected Dashboard** — Each user sees and manages only their own links
- **URL Shortening** — Paste any URL to get a compact short link instantly
- **Custom Aliases** — Optionally define your own short code (e.g. `/my-campaign`)
- **URL Validation** — Invalid URLs are rejected before saving
- **Click Analytics** — Track total clicks, last visited time, and recent visit history (IP, referrer, User-Agent)
- **Copy to Clipboard** — One-click copy of short URLs
- **Delete Links** — Soft-delete any link from your dashboard
- **Responsive UI** — Works on desktop and mobile, dark-themed with amber accents

---

## 🗂 Project Structure

```
url-shortener/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      # Signup, login, getMe
│   │   ├── urlController.js       # Create, list, analytics, delete
│   │   └── redirectController.js  # Short URL redirect + click tracking
│   ├── middleware/
│   │   └── auth.js                # JWT verification middleware
│   ├── models/
│   │   ├── User.js                # User schema with bcrypt hooks
│   │   └── Url.js                 # URL schema with embedded analytics
│   ├── routes/
│   │   ├── auth.js
│   │   ├── urls.js
│   │   └── redirect.js
│   ├── server.js                  # Express entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js / .css
│   │   │   ├── UrlCard.js / .css
│   │   │   ├── AnalyticsModal.js / .css
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js     # Global auth state
│   │   ├── pages/
│   │   │   ├── Home.js / .css
│   │   │   ├── Login.js / .css (Auth.css)
│   │   │   ├── Signup.js
│   │   │   ├── Dashboard.js / .css
│   │   │   └── NotFound.js / .css
│   │   ├── styles/
│   │   │   └── global.css         # Design system / CSS variables
│   │   ├── utils/
│   │   │   └── api.js             # Axios instance + API calls
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── AI_PLANNING.md
├── ARCHITECTURE.md
├── .gitignore
├── package.json                   # Root convenience scripts
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** — local instance (`mongod`) or MongoDB Atlas cluster

---

## 🚀 Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/Ashwin-k-05/URL_SHORTENER.git
cd url-shortener
```

### 2. Configure the Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/url-shortener
JWT_SECRET=random_secret_key
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

Install dependencies:

```bash
npm install
```

### 3. Configure the Frontend

```bash
cd ../frontend
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:5000
```

Install dependencies:

```bash
npm install
```

### 4. Start the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev     # Uses nodemon for hot reload
# or
npm start       # Production start
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Short URL Redirects:** http://localhost:5000/:shortCode

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | `{ name, email, password }` | Register a new user |
| POST | `/api/auth/login` | `{ email, password }` | Login, receive JWT |
| GET | `/api/auth/me` | — | Get current user (Bearer token required) |

### URLs (all require `Authorization: Bearer <token>`)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/urls` | `{ originalUrl, customAlias? }` | Create short URL |
| GET | `/api/urls` | — | List all user's URLs |
| GET | `/api/urls/:id/analytics` | — | Get analytics for URL |
| DELETE | `/api/urls/:id` | — | Soft-delete URL |

### Redirect

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:shortCode` | Redirects to original URL, tracks visit |

---

## 🌱 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGODB_URI` | — | MongoDB connection string |
| `JWT_SECRET` | — | Secret for signing JWTs |
| `BASE_URL` | `http://localhost:5000` | Used to build the short URL |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API base URL |
| `REACT_APP_BASE_URL` | Base URL for displaying short links |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, react-toastify, date-fns |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose ODM |
| Auth | bcryptjs, JSON Web Tokens |
| Short codes | nanoid |
| URL validation | valid-url |
| Dev tooling | nodemon |

---

## 🧠 Assumptions Made

1. **Single-instance deployment** — No load balancer or Redis session store assumed.
2. **Short code collision rate** — Nanoid(7) yields ~78 billion combinations; collision retries (up to 10) are sufficient for expected scale.
3. **Analytics granularity** — Per-visit data (IP, referrer, user-agent) is sufficient. Geo-IP lookup is not included.
4. **Deleted URLs** — Soft-deleted (isActive=false). Existing bookmarks to deleted links redirect to the frontend 404 page.
5. **Custom aliases** — Globally unique across all users, not per-user.
6. **Token storage** — JWT stored in localStorage (simpler for SPA); for higher security requirements, httpOnly cookies would be preferred.
7. **Visit cap** — At most 100 recent visits stored per URL document to keep document size bounded.
8. **No rate limiting** — Not implemented; add `express-rate-limit` for production use.

---

## 🔒 Security Notes for Production

- Replace `JWT_SECRET` with a cryptographically random string (32+ chars)
- Use HTTPS and set `BASE_URL` to your domain
- Add rate limiting with `express-rate-limit`
- Consider switching to httpOnly cookies for JWT storage
- Restrict MongoDB network access (IP whitelist or VPC)

---

This project is a part of a hackathon run by https://katomaran.com
