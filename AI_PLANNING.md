# AI Planning Document — URL Shortener

## Project Overview
A full-stack URL shortener with authentication, analytics tracking, and a modern dashboard UI.

---

## 1. Feature Breakdown

### Authentication System
- **Signup**: Name + email + password → hashed with bcrypt (12 salt rounds) → JWT issued
- **Login**: Email + password → bcrypt compare → JWT issued (7-day expiry)
- **Protected Routes**: Frontend `<ProtectedRoute>` + backend `protect` middleware
- **Persistence**: Token stored in `localStorage`, user info cached for hydration

### URL Shortening
- **Input**: Long URL + optional custom alias
- **Validation**: `valid-url` library checks for valid http/https URIs
- **Code Generation**: `nanoid(7)` for 7-character random codes; retry loop ensures uniqueness
- **Custom Alias**: Validated with regex `^[a-zA-Z0-9_-]{3,20}$`; checked for conflicts before save

### Redirect & Analytics
- **Redirect**: Express route `GET /:shortCode` performs a `301` permanent redirect
- **Click Tracking**: Each redirect increments `clickCount`, updates `lastVisited`, appends to `recentVisits[]`
- **Visit Data Captured**: IP address, User-Agent, Referrer, timestamp
- **Capped Storage**: Max 100 visits stored per URL (FIFO eviction)

### Dashboard
- **Stats Bar**: Total link count and total click count shown at top
- **Create Form**: Collapsible panel with URL and optional alias inputs
- **Search**: Client-side filter by original URL or short code
- **URL Cards**: Each shows original URL, short link, created date, click count, last visited
- **Actions Per Card**: Copy to clipboard, View Analytics (modal), Delete (soft)

---

## 2. Technology Decisions

| Concern | Choice | Reason |
|---|---|---|
| Short code generation | `nanoid` | Compact, URL-safe, collision-resistant |
| Password hashing | `bcryptjs` | Industry standard, pure JS, no native deps |
| Auth token | JWT (7d) | Stateless, scalable |
| URL validation | `valid-url` | Handles edge cases better than simple regex |
| DB soft delete | `isActive: false` | Preserves analytics history |
| Analytics capping | Array slice at 100 | Bounded storage, no separate collection needed |
| Frontend state | React Context + useState | Simple enough; no Redux needed |
| Routing | React Router v6 | Modern, nested route support |
| Notifications | react-toastify | Minimal setup, themeable |

---

## 3. Data Models

### User
```
_id, name, email (unique), password (hashed), createdAt, updatedAt
```

### Url
```
_id, originalUrl, shortCode (unique, indexed), customAlias, 
user (ref → User), clickCount, lastVisited, recentVisits[], 
isActive, createdAt, updatedAt
```

### Visit (embedded in recentVisits)
```
ip, userAgent, referrer, visitedAt
```

---

## 4. API Design

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/signup | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Authenticate user |
| GET | /api/auth/me | ✅ | Get current user |
| POST | /api/urls | ✅ | Create short URL |
| GET | /api/urls | ✅ | List user's URLs |
| GET | /api/urls/:id/analytics | ✅ | Get URL analytics |
| DELETE | /api/urls/:id | ✅ | Soft-delete URL |
| GET | /:shortCode | ❌ | Redirect + track click |

---

## 5. Security Considerations
- Passwords never stored in plaintext; bcrypt with cost factor 12
- JWT secrets loaded from environment variables only
- Users can only read/delete their own URLs (ownership check in controller)
- CORS configured to allow only the known frontend origin
- Short code redirect cannot expose other users' data

---

## 6. Known Limitations / Future Improvements
- No rate limiting on URL creation (could add `express-rate-limit`)
- No URL expiry feature
- Analytics don't deduplicate unique visitors
- No email verification on signup
- `recentVisits` stored in same document — large volumes would need a separate collection
