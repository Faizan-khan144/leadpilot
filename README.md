# LeadPilot

LeadPilot is a multi-tenant CRM for lead generation agencies. It brings lead capture, cold-call logging, follow-ups, a kanban pipeline, deal tracking, payments, commissions, reporting, team management and workspace settings into one workspace.

## Stack

- **Client:** React 19, Vite, React Router, Tailwind CSS, React Hook Form, Zod, Recharts, Sonner
- **Server:** Node.js, Express, MongoDB with Mongoose, JWT auth, Zod validation, Vitest
- **Workspaces:** npm workspaces with the client on port `5201` and the API on port `5200`

## Quick start

```bash
npm install
cp server/.env.example server/.env
npm run dev
```

Open `http://localhost:5201`.

For local development without MongoDB, set these values in `server/.env`:

```env
USE_MEMORY_DB=true
SEED_DEMO=true
```

The API starts an in-memory MongoDB instance and seeds an idempotent demo workspace. Data resets whenever the API restarts.

### Demo account

| Role | Email | Password |
| --- | --- | --- |
| Owner | `owner@demo.leadpilot.test` | `LeadPilot123!` |

The seed also creates manager and lead-generator accounts, leads, calls, follow-ups, deals, payments, commissions, activities and notifications.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run the API and client together |
| `npm run build` | Build the client for production |
| `npm start` | Start the API |
| `npm run seed` | Seed the configured MongoDB database |
| `npm test` | Run the server test suite with Vitest |

## Features

- Cookie-based authentication with optional persistent sessions
- Organization-scoped access for owners, managers and lead generators
- Lead capture, CSV import, assignment, statuses and activity history
- Call logging with outcomes, durations and next steps
- Follow-up queue with due dates and completion tracking
- Drag-and-drop pipeline stages
- Deals with per-deal commission rates and payment tracking
- Commission bands: 15% below ₹50,000, 25% from ₹50,000–80,000 and 35% above ₹80,000
- Owner-only commission approval and payout recording
- Dashboard analytics, performance reports and CSV exports
- Team invitations, roles and workspace settings
- Responsive warm-orange light theme plus a matching dark theme

## Project structure

```text
leadpilot/
├── client/
│   ├── src/components/   # Shared UI, charts, modals and layout
│   ├── src/context/      # Auth and theme providers
│   ├── src/pages/        # Landing, auth and workspace screens
│   └── src/lib/          # API client, constants and helpers
├── server/
│   └── src/
│       ├── config/       # Environment, constants and database setup
│       ├── controllers/  # Request handlers
│       ├── middleware/   # Auth, validation, errors and rate limits
│       ├── models/       # Mongoose schemas
│       ├── routes/       # Express routers
│       ├── services/     # Auth, activity, commissions and notifications
│       ├── utils/        # Tokens, money, CSV, email and permissions
│       └── validators/   # Zod request schemas
└── package.json
```

## Data conventions

- Money is stored as integer paise.
- Each deal stores the commission rate that applied when it was created.
- The active organization comes from the `x-organization-id` header and is checked against the signed-in user's membership.
- JWT payloads contain the user ID only; roles are resolved from the active membership.

## Production notes

- Set `USE_MEMORY_DB=false` and provide a `MONGODB_URI`.
- Replace `JWT_SECRET` with at least 32 random characters.
- Set `COOKIE_SECURE=true` and serve the client and API over HTTPS.
- Set `CLIENT_URL` to the deployed client origin.
- Configure SMTP variables to enable invite and password-reset email delivery.
- Build the client with `npm run build` and serve `client/dist`.
