# Health Tracker

A full-stack web application for tracking and visualizing blood pressure, weight, and body temperature readings over time.

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
- Record systolic/diastolic readings with optional notes (max 240 characters)
- Record weight readings (kg) with optional notes — authenticated users only
- Record body temperature readings (°C / °F) with optional notes — authenticated users only
- Interactive combined chart (BP + weight + temperature) with period filters (3 days, 1 week, 1 month, 3 months, all)
- Multi-axis chart with per-series show/hide toggles
- History tables with column sorting and period filter — capped at 5 rows per page
- Click any table row to open a detail modal; BP readings support inline editing from the modal
- Full CRUD for blood pressure, weight, and temperature readings
- BP category classification based on 2017 ACC/AHA guidelines
- Temperature category classification (hypothermia → hyperthermia)
- Toast notifications for all operations
- Guest mode: BP readings stored in session storage, no database required
- Dark mode and language (EN / PT-BR) switchers with locale-aware date formatting
- Dynamic page titles per route

## Routes

| Route        | Access        | Description                                                                  |
| ------------ | ------------- | ---------------------------------------------------------------------------- |
| `/`          | Public        | Login / sign up                                                              |
| `/measure`   | Public        | Record BP readings — guests use session storage, logged-in users see chart   |
| `/dashboard` | Authenticated | Tabbed hub: record BP / weight / temperature, combined chart, history tables |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Supabase Setup

**1. Create the tables**

```sql
create table blood_pressure_readings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  systolic_pressure integer not null,
  diastolic_pressure integer not null,
  notes text,
  recorded_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table weight_readings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  weight numeric(5,2) not null,
  notes text,
  recorded_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table temperature_readings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  temperature numeric(4,2) not null,
  notes text,
  recorded_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**2. Enable Row Level Security**

```sql
alter table blood_pressure_readings enable row level security;

create policy "Users can manage their own readings"
on blood_pressure_readings for all to authenticated
using (auth.uid()::text = user_id)
with check (auth.uid()::text = user_id);

alter table weight_readings enable row level security;

create policy "Users can manage their own weight readings"
on weight_readings for all to authenticated
using (auth.uid()::text = user_id)
with check (auth.uid()::text = user_id);

alter table temperature_readings enable row level security;

create policy "Users can manage their own temperature readings"
on temperature_readings for all to authenticated
using (auth.uid()::text = user_id)
with check (auth.uid()::text = user_id);
```

With RLS enabled:

- Direct access via **anon key without a session** → blocked
- Access via **authenticated Supabase session** → allowed for own data only

**3. Enable Email Auth**

Supabase Dashboard → Authentication → Providers → Email → enable.

To skip email confirmation during development, disable **Confirm email** in the same settings.

### Installation

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>       # Settings > API > Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>      # Settings > API > anon / publishable
```

> The app talks to Supabase directly from the browser using the anon key. Row Level Security (RLS) ensures each user can only access their own data. No server-side secret key is needed.

### Running Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command      | Description                     |
| ------------ | ------------------------------- |
| `pnpm dev`   | Start dev server with Turbopack |
| `pnpm build` | Build static export to `./out`  |
| `pnpm lint`  | Run ESLint                      |

## Deployment

The app is a fully static export (`output: "export"`) deployed to GitHub Pages via GitHub Actions.

Every push to `main` triggers the workflow at `.github/workflows/deploy.yml`, which builds and publishes to:

```
https://matheeeusl.github.io/hipertension/
```

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret                          | Value                         |
| ------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

### Enable GitHub Pages

Go to **Settings → Pages** → Source: **GitHub Actions**.

## Project Structure

```
app/
  page.tsx              # Login / sign up
  measure/              # Record BP readings (public, guest-friendly)
  dashboard/            # Authenticated hub: BP + weight + temperature tabs, combined chart
  weight/               # Dedicated weight recording and history (auth only)
  temperature/          # Dedicated temperature recording and history (auth only)
api/
  bloodPressureApi.ts   # RTK Query API (BP CRUD)
  weightApi.ts          # RTK Query API (weight CRUD)
  temperatureApi.ts     # RTK Query API (temperature CRUD)
components/
  auth/                 # LoginForm
  graph/                # Combined multi-series chart (Graph, MultiSeriesLineChart, ChartToggleButtons)
  history/              # BP history table with sort and period filter
  measure/              # BP measure form + local readings list
  nav/                  # NavMenu, ThemeSwitch, LocaleSwitch
  shared/               # Reusable primitives (LoadingSpinner, ErrorAlert, SortableHead,
  |                     #   HistoryPagination, DeleteConfirmDialog, ReadingTableRow, ReadingDialog, …)
  temperature/          # TemperatureForm, TemperatureHistory, TemperatureTableRow, TemperatureGraph
  ui/                   # UI primitives (shadcn/ui)
  weight/               # WeightForm, WeightHistory, WeightTableRow, WeightGraph
  wrapper/              # Redux Provider wrapper
hooks/
  useAuth.ts            # Supabase Auth state
  useBloodPressure.ts   # BP API CRUD hook
  useWeight.ts          # Weight API CRUD hook
  useTemperature.ts     # Temperature API CRUD hook
  useLocalReadings.ts   # Session storage hook (guest mode)
interfaces/             # TypeScript interfaces (BloodPressure, Weight, Temperature)
locales/                # EN and PT-BR translation strings
store/                  # Redux store (all API slices)
utils/
  supabaseClientBrowser.ts  # Browser Supabase client (anon key + RLS)
  bpCategory.ts             # BP category classification
  temperatureCategory.ts    # Temperature category classification
  chart.ts                  # BP data transformation
  measurementsChart.ts      # Weight & temperature data transformation + °C ↔ °F conversion
  formatDate.ts             # Locale-aware date formatting (formatDate, formatChartDate)
```

## Validation Rules

**Blood Pressure**

- **Systolic**: 70–300 mmHg
- **Diastolic**: 40–200 mmHg
- **Notes**: optional, max 240 characters

**Weight**

- **Weight**: 20–300 kg (decimals accepted, e.g. 70.5)
- **Notes**: optional, max 240 characters

**Temperature**

- **Temperature**: valid numeric value within physiological range
- **Notes**: optional, max 240 characters

## BP Categories (ACC/AHA 2017)

| Category     | Systolic | Diastolic |
| ------------ | -------- | --------- |
| Low (Severe) | < 80     | < 50      |
| Low          | < 90     | < 60      |
| Normal       | < 120    | < 80      |
| Elevated     | 120–129  | < 80      |
| Stage 1      | 130–139  | 80–89     |
| Stage 2      | ≥ 140    | ≥ 90      |
| Crisis       | ≥ 180    | ≥ 120     |

## Temperature Categories

| Category        | Range (°C)  |
| --------------- | ----------- |
| Hypothermia     | < 35.0      |
| Below Normal    | 35.0 – 36.0 |
| Normal          | 36.1 – 37.2 |
| Low-grade Fever | 37.3 – 38.0 |
| Fever           | 38.1 – 39.0 |
| High Fever      | 39.1 – 40.0 |
| Hyperthermia    | > 40.0      |
