# Architecture Diagram

```mermaid
graph TB
    subgraph Client["🖥 Frontend (React)"]
        UI[Pages & Components]
        CTX[AuthContext]
        AX[Axios + Interceptors]
        UI --> CTX
        UI --> AX
    end

    subgraph Server["⚙ Backend (Node.js / Express)"]
        AUTH_MW[JWT Middleware]
        AUTH_R[Auth Routes]
        URL_R[URL Routes]
        REDIR_R[Redirect Route]
        AUTH_C[Auth Controller]
        URL_C[URL Controller]
        REDIR_C[Redirect Controller]

        AUTH_R --> AUTH_C
        URL_R --> AUTH_MW --> URL_C
        REDIR_R --> REDIR_C
    end

    subgraph DB["🗄 MongoDB"]
        USER_M[(User Model)]
        URL_M[(URL Model\nw/ embedded Visits)]
    end

    AX -- "POST /api/auth/signup\nPOST /api/auth/login" --> AUTH_R
    AX -- "GET/POST/DELETE /api/urls" --> URL_R
    Browser -- "GET /:shortCode" --> REDIR_R

    AUTH_C --> USER_M
    URL_C --> URL_M
    REDIR_C --> URL_M

    REDIR_C -- "301 Redirect" --> ExternalSite["🌐 Original URL"]

    style Client fill:#1c1c28,stroke:#2a2a3a,color:#f0f0f8
    style Server fill:#16161f,stroke:#2a2a3a,color:#f0f0f8
    style DB fill:#111118,stroke:#2a2a3a,color:#f0f0f8
```

## Request Flow Diagrams

### User Login Flow
```
Browser → POST /api/auth/login
         → Validate input
         → Find user by email
         → bcrypt.compare(password, hash)
         → Sign JWT (7d)
         → Return { token, user }
         → Frontend stores token in localStorage
         → AuthContext updates state
         → Redirect to /dashboard
```

### URL Shortening Flow
```
Dashboard → POST /api/urls { originalUrl, customAlias? }
          → JWT verified by middleware
          → Validate URL with valid-url
          → Generate nanoid(7) or use customAlias
          → Check uniqueness in MongoDB
          → Save Url document
          → Return { url } with shortCode
          → Frontend prepends to URLs list
```

### Redirect & Analytics Flow
```
Browser → GET /:shortCode
        → Redirect Controller
        → Find URL by shortCode where isActive=true
        → Append visit { ip, userAgent, referrer, timestamp }
        → Increment clickCount, update lastVisited
        → Save document
        → 301 Redirect → originalUrl
```
