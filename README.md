# Blood Pressure Tracker

A full-stack web application for tracking and visualizing blood pressure readings over time.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password)
- **State Management**: Redux Toolkit + RTK Query
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner

## Features

- Email/password authentication with sign up and sign in
- Record systolic/diastolic readings with optional notes
- Interactive line chart with time period filters (3 days, 1 week, 1 month, 3 months, all)
- Full CRUD operations (create, read, update, delete)
- Trend analysis (increasing / stable / decreasing)
- Average calculation over configurable periods
- Toast notifications for feedback
- Guest mode: record readings stored in session (not persisted to database)
- Navigation menu visible only to authenticated users

## Routes

| Route      | Access    | Description                                                                    |
| ---------- | --------- | ------------------------------------------------------------------------------ |
| `/`        | Public    | Login / sign up                                                                |
| `/measure` | Public    | Record readings — guests use session storage, logged-in users use the database |
| `/history` | Protected | Full reading history with delete and BP category                               |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Supabase Setup

**1. Create the table**

```sql
create table blood_pressure_readings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  systolic_pressure integer not null,
  diastolic_pressure integer not null,
  notes text,
  tags text[],
  recorded_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**2. Enable Row Level Security**

```sql
ALTER TABLE blood_pressure_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own readings"
ON blood_pressure_readings
FOR ALL
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);
```

With RLS enabled:

- Direct access via **anon key without a session** → blocked
- Access via **authenticated Supabase session** → allowed for own data only
- Access via **Next.js API routes** (service role key) → always allowed, bypasses RLS

**3. Enable Email Auth**

Supabase Dashboard → Authentication → Providers → Email → enable.

To skip email confirmation during development, disable **Confirm email** in the same settings.

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>        # Settings > API > Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>       # Settings > API > anon / publishable
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>   # Settings > API > service_role / secret
```

> `SUPABASE_SERVICE_ROLE_KEY` does **not** use the `NEXT_PUBLIC_` prefix — it stays server-side and is never exposed to the browser.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start dev server with Turbopack |
| `npm run build` | Build for production            |
| `npm run start` | Start production server         |
| `npm run lint`  | Run ESLint                      |

## Project Structure

```
app/
  page.tsx              # Login / sign up
  measure/              # Record readings (public)
  history/              # Reading history (protected)
api/                    # RTK Query API definitions
components/
  auth/                 # LoginForm
  graph/                # Line chart with period filters
  history/              # History table
  measure/              # Measure form + local readings list
  nav/                  # NavMenu (authenticated users only)
  ui/                   # Reusable UI primitives (shadcn/ui)
  wrapper/              # Redux Provider wrapper
hooks/
  useAuth.ts            # Supabase Auth state
  useBloodPressure.ts   # API CRUD hook
  useLocalReadings.ts   # Session storage hook (guest mode)
interfaces/             # TypeScript interfaces
pages/api/              # Next.js API routes (server-side, uses service role)
store/                  # Redux store and slices
utils/
  supabaseClient.ts         # Server-side Supabase client (service role)
  supabaseClientBrowser.ts  # Browser Supabase client (anon key, auth only)
  chart.ts                  # Data transformation utilities
```

## API Endpoints

| Method | Path                              | Description                   |
| ------ | --------------------------------- | ----------------------------- |
| GET    | `/api/blood-pressure/:userId`     | Fetch all readings for a user |
| POST   | `/api/blood-pressure/:userId`     | Create a new reading          |
| PUT    | `/api/blood-pressure/:userId/:id` | Update a reading              |
| DELETE | `/api/blood-pressure/:userId/:id` | Delete a reading              |

## Validation Rules

- **Systolic**: 70–300 mmHg
- **Diastolic**: 40–200 mmHg
- Both fields are required; notes are optional
