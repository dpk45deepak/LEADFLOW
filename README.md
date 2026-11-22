# LeadFlow – Lead Management System

A full-stack CRM-style app for capturing, tracking, searching, updating and deleting sales leads. Built for the Meru Technosoft Pvt. Ltd. Full Stack Developer screening assignment.

> **Status note:** the code was written and syntax-checked, but dependencies were not installed and the app and test suite were not run in the environment where it was generated (no network access). Follow "Local setup" and run `npm test` before submitting. No deployment has been performed.

## 1. Features

- **Lead CRUD**: create, list, edit (prefilled form), delete (confirmation modal showing the lead name).
- **Fields**: name, email, phone, company, source (Website, LinkedIn, Referral, Advertisement, Cold Calling, Other), status (New, Contacted, Qualified, Lost).
- **Search and filter**: name search + status filter, combinable, handled by backend query params; "Clear filters"; state is kept in the URL.
- **Pagination and sorting**: backend pagination, page size 10/25/50, sort by created date or name.
- **Dashboard**: total/New/Contacted/Qualified/Lost counts (MongoDB aggregation), bar chart by status, recent leads.
- **Authentication**: register, login, logout, JWT, bcrypt hashing, protected routes. Every lead query is scoped to the logged-in user.
- **Validation** on both client (Zod + React Hook Form) and server (Zod); consistent JSON errors; toast notifications; loading skeletons, empty and error states; responsive layout (table on desktop, cards on mobile).
- **Security**: Helmet, CORS allow-list, rate limiting, 10 kb body limit, no internal errors exposed, `userId` never read from the request body.

## 2. Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 3, React Router 6, Axios, React Hook Form, Zod, Lucide, Recharts |
| Backend | Node.js (ESM), Express 4, MongoDB, Mongoose, Zod, Helmet, CORS, express-rate-limit, JWT, bcryptjs |
| Tooling | ESLint, Prettier, Vitest, Supertest, mongodb-memory-server, Postman collection |

`bcryptjs` is the pure-JS implementation of bcrypt (same algorithm and hash format); it avoids native build problems on hosts like Render.

## 3. Architecture and folder structure

```
leadflow/
├── client/                    React + Vite SPA
│   └── src/
│       ├── api/               axios instance + auth/leads API modules
│       ├── components/        Layout, LeadTable, LeadForm, Pagination, ConfirmDialog, ...
│       ├── context/           AuthContext, ToastContext
│       ├── hooks/             useDebounce
│       ├── lib/               constants, schemas (Zod), formatters
│       └── pages/             Dashboard, Leads, LeadFormPage, Login, Register, NotFound
├── server/
│   ├── src/
│   │   ├── config/database.js
│   │   ├── routes/            endpoint definitions only
│   │   ├── controllers/       HTTP in/out
│   │   ├── services/          business logic + DB queries (ownership scoping lives here)
│   │   ├── models/            User, Lead
│   │   ├── validators/        Zod schemas
│   │   ├── middleware/        auth, validate, error handling
│   │   ├── utils/             ApiError, asyncHandler
│   │   ├── app.js             Express app factory (used by tests)
│   │   └── server.js          DB connect + listen
│   └── tests/                 Vitest + Supertest
└── docs/postman_collection.json
```

## 4. Database schema

**User**: `name`, `email` (unique, lowercased), `password` (bcrypt hash, `select: false`), `createdAt`, `updatedAt`.

**Lead**: `userId` (ref User, required), `name`, `email` (trimmed, lowercased), `phone`, `company`, `source` (enum, default Website), `status` (enum, default New), `createdAt`, `updatedAt`.

Indexes on Lead: unique `(userId, email)` (duplicate prevention per user), `(userId, status, createdAt)`, `(userId, createdAt)`, `(userId, name)`.

## 5. API

All responses: `{ success, message?, data?, pagination?, errors? }`. Errors from validation look like `{ success:false, message:"Validation failed", errors:[{field,message}] }`.
Lead routes require `Authorization: Bearer <token>`.

| Method | Path | Description | Success |
|---|---|---|---|
| POST | /api/auth/register | `{name,email,password}` (password ≥ 8 chars) | 201 `{user,token}` |
| POST | /api/auth/login | `{email,password}` | 200 `{user,token}` |
| GET | /api/auth/me | current user | 200 |
| POST | /api/leads | create lead | 201 |
| GET | /api/leads | list: `search`, `status`, `page`, `limit` (≤100), `sortBy` (createdAt\|name), `order` (asc\|desc) | 200 + `pagination` |
| GET | /api/leads/stats | `{total,New,Contacted,Qualified,Lost}` | 200 |
| GET | /api/leads/:id | one lead | 200 |
| PUT | /api/leads/:id | partial update (≥ 1 field) | 200 |
| DELETE | /api/leads/:id | delete | 200 |
| GET | /api/health | liveness check | 200 |

Status codes: 400 validation / invalid ID, 401 missing or invalid token, 404 not found (also returned for another user's lead, so existence isn't revealed), 409 duplicate email, 429 rate limited, 500 generic.

Example: `GET /api/leads?search=deepak&status=Qualified&page=1&limit=10&sortBy=createdAt&order=desc`

Import `docs/postman_collection.json` into Postman; Register/Login save the token automatically.

## 6. Local setup

Requirements: Node 18+, a MongoDB instance (local or Atlas).

```bash
npm run install:all                      # installs server + client deps
cp server/.env.example server/.env       # then fill in the values
cp client/.env.example client/.env       # optional in dev (Vite proxies /api)
npm run dev:server                       # http://localhost:5000
npm run dev:client                       # http://localhost:5173
```

### Environment variables

`server/.env`

| Name | Example | Notes |
|---|---|---|
| PORT | 5000 | |
| MONGODB_URI | mongodb+srv://... | required |
| JWT_SECRET | long random string | required; e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| CLIENT_URL | http://localhost:5173 | allowed CORS origin(s), comma-separated |
| NODE_ENV | development | |

`client/.env`: `VITE_API_URL=http://localhost:5000/api` (if unset, the app calls `/api`, which Vite proxies to port 5000 in dev).

## 7. Testing

```bash
npm test            # from repo root, or: cd server && npm test
```

Vitest + Supertest against a real MongoDB. By default `mongodb-memory-server` downloads a MongoDB binary on the first run (needs internet once). To use your own database instead, set `MONGODB_URI_TEST` (the test database is **dropped** afterwards, so use a throwaway one).

Covered: register/login/me; create, list, get, update, delete; invalid email/phone; missing fields; invalid status/source; invalid and non-existent IDs; duplicate email; search/filter/pagination/sort; stats; 401 on every lead endpoint without a token; cross-user isolation for read/update/delete/list/stats; ignoring a client-supplied `userId`.

Manual checklist: register → add lead → see it in list and dashboard → search and filter → edit status → delete via modal → log out → confirm `/leads` redirects to login → register a second user and confirm they see no leads.

## 8. Deployment

**MongoDB Atlas**: create a cluster and database user, then configure the network access list for your Vercel backend's outbound traffic. Copy the connection string.

**Backend on Vercel**: create a Vercel project with the repository root directory set to `server`. Vercel deploys `server/api/[...path].js` as a Node.js serverless function for the existing `/api/*` routes. Add `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL` as environment variables. Set `CLIENT_URL` to your deployed frontend origin (without a trailing slash); add comma-separated origins if you also need to allow preview deployments. No `PORT` setting is needed on Vercel.

**Frontend on Vercel**: create a separate Vercel project with root directory `client`, framework Vite, build `npm run build`, and output `dist`. Set `VITE_API_URL=https://<your-backend-project>.vercel.app/api`. `client/vercel.json` rewrites frontend routes to `index.html` for React Router. Add the final frontend URL to the backend's `CLIENT_URL`.

For local development, continue to run `npm run dev:server`; it starts the same Express app on port 5000.

## 9. Assumptions and trade-offs

- Emails are unique **per user**, not globally (two salespeople may hold the same prospect).
- Auth token is stored in `localStorage` for simplicity; httpOnly cookies would be safer against XSS but add CSRF handling.
- Another user's lead returns 404 rather than 403.
- Search is a case-insensitive substring match on name (regex-escaped); fine for this scale, a text index would suit larger data.
- The sidebar "Settings" item is optional in the brief and was left out.
- Hard delete (no soft delete / undo).

## 10. Future improvements

Lead notes and activity timeline, CSV import/export, email verification and password reset, refresh tokens or cookie sessions, soft delete, bulk actions, team/role support, frontend component tests and Playwright end-to-end tests, CI pipeline.
