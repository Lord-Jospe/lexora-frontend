# Lexora — Invoice OCR Processing Frontend

> Intelligent web interface for automated invoice processing — upload, review, and manage invoices with AI-powered data extraction.

Lexora Frontend is a **React 19 + TypeScript + Vite** single-page application that provides the user interface for the Lexora invoice processing system. Users can upload invoice images, review AI-extracted data with confidence scores, manage providers, and export invoices — all through a modern, responsive dashboard.

---

## Key Features

- **Invoice upload with camera or file** — capture invoice photos directly from the device camera or upload image files from disk
- **AI-extracted data review** — review structured invoice data extracted by the backend's OCR + LLM pipeline, with per-field confidence scores to guide manual verification
- **Invoice history & filtering** — browse all processed invoices with search and filter capabilities by date, provider, category, and status
- **Provider/party management** — full CRUD for providers and clients linked to invoices
- **Invoice detail view** — zoomable image viewer alongside structured extracted fields, line items, and document metadata
- **Invoice status workflow** — transition invoices through statuses (draft, reviewed, approved, rejected)
- **Export ready** — download invoices as PDF, XML (UBL 2.1), or CSV from the backend
- **JWT authentication** — login/register with persistent sessions via localStorage, automatic token injection on every request
- **Responsive dashboard layout** — collapsible sidebar navigation, header with search and user profile dropdown
- **Toast notifications** — real-time feedback for all user actions via Sonner

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 + tw-animate-css |
| UI Primitives | Radix UI (dialog, dropdown-menu, slot, visually-hidden) |
| Routing | React Router 7 (lazy-loaded routes) |
| HTTP Client | Axios with JWT interceptor |
| Icons | Lucide React + Iconify (Solar icon set) |
| Image Viewing | react-medium-image-zoom + react-zoom-pan-pinch |
| Notifications | Sonner |
| Custom Scroll | simplebar-react |
| Font | Plus Jakarta Sans (Google Fonts) |
| Package Manager | pnpm |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     App (main.tsx)                    │
│   AuthProvider → RouterProvider → Toaster             │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│                   AppRouter                           │
│  /login  /register  /admin/*                         │
│  PublicRoute ↕ PrivateRoute                          │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│              MainContent (Layout)                     │
│  ┌─────────────┐  ┌──────────────────────────────┐  │
│  │   Sidebar    │  │  Header (Search · Msgs ·     │  │
│  │  (collapsible│  │   Profile dropdown)          │  │
│  │   nav items) │  │                              │  │
│  │              │  │  <Outlet> ← lazy page here   │  │
│  └─────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Key Design Decisions

**Lazy-loaded routes** — all admin pages are loaded via `React.lazy()` wrapped in a custom `Loadable` HOC with a Suspense spinner fallback, keeping the initial bundle small.

**Axios interceptor for auth** — a request interceptor reads the JWT token from `localStorage` and injects it as a `Bearer` header on every outgoing request. No manual header management in individual service calls.

**AuthContext with persistence** — the `AuthProvider` wraps the entire app and stores both `token` and `user` in `useState` + `localStorage`, so sessions survive page reloads. Login, register, and logout actions update both layers atomically.

**PrivateRoute wrapper** — all `/admin/*` routes are gated behind a `PrivateRoute` component that checks for the presence of a token. Unauthenticated users are redirected to `/login`.

**Service layer separation** — API calls are organized by domain (`auth.service.ts`, `invoice.service.ts`, `party.service.ts`, `user.service.ts`) using a shared Axios instance, keeping view components clean of HTTP logic.

**Reusable UI primitives** — buttons, dropdowns, sheets, and dialogs are built on Radix UI headless components wrapped in custom styled versions using `class-variance-authority` for variant management and `tailwind-merge` + `clsx` for className composition.

---

## Project Structure

```
lexora-frontend/
├── public/
│   ├── favicon.svg
│   ├── login_image.svg          # Login page illustration
│   └── register_image.svg       # Register page illustration
├── src/
│   ├── api/
│   │   └── services/            # Axios instance + API service modules
│   │       ├── axios.ts         # Base URL, JWT interceptor
│   │       ├── auth.service.ts  # login(), register()
│   │       ├── invoice.service.ts
│   │       ├── party.service.ts
│   │       └── user.service.ts
│   ├── assets/                  # Static assets
│   ├── components/
│   │   └── ui/                  # Reusable UI primitives (Button, Sheet, DropdownMenu, etc.)
│   ├── context/
│   │   └── authContext.tsx       # AuthProvider + useAuth hook
│   ├── css/                     # Global styles + app.css
│   ├── layouts/
│   │   ├── full/
│   │   │   ├── header/          # Header, Profile dropdown, Messages, Search
│   │   │   └── sidebar/         # Collapsible sidebar + navigation items
│   │   ├── logo/                # FullLogo component
│   │   ├── MainContent.tsx      # Main admin layout shell
│   │   └── shared/
│   │       └── loadable/        # Lazy-load HOC with Suspense fallback
│   ├── routes/
│   │   ├── AppRouter.tsx        # Route definitions (public + private)
│   │   ├── PrivateRoute.tsx     # Auth gate for /admin/*
│   │   └── PublicRoute.tsx      # Redirects authenticated users away
│   ├── types/                   # TypeScript interfaces
│   │   ├── auth.type.ts
│   │   ├── invoice.type.ts
│   │   ├── party.type.ts
│   │   └── user.types.ts
│   ├── utils/                   # Error handler, utility functions
│   ├── views/
│   │   ├── admin/               # Dashboard pages (lazy-loaded)
│   │   │   ├── CargarDocumentosPage.tsx   # Upload invoice image
│   │   │   ├── RevisionFacturasPage.tsx   # Review extracted data
│   │   │   ├── HistorialFacturasPage.tsx  # Invoice history list
│   │   │   ├── DetalleFacturaPage.tsx     # Invoice detail view
│   │   │   ├── ProveedorPage.tsx          # Provider management
│   │   │   └── UserProfile.tsx            # User settings
│   │   ├── auth/                # Login + Register pages
│   │   ├── DashMain.tsx         # Dashboard welcome/landing
│   │   └── spinner/             # Loading spinner component
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point, AuthProvider mount
├── index.html                   # HTML shell
├── vite.config.ts               # Vite config (React + Tailwind plugins, path aliases)
├── tsconfig.json                # TypeScript config
├── package.json
└── pnpm-lock.yaml
```

---

## Page Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────────────────┐
│  Login   │────▶│  Register    │     │                     │
│  /login  │     │  /register   │     │   Admin Dashboard    │
└──────────┘     └──────────────┘     │   /admin/*           │
         \           /                │                      │
          ─────┬─────                  │  ┌─────────────────┐ │
               │ authenticate          │  │ Upload Document  │ │
               ▼                      │  │ (camera or file) │ │
         ┌──────────┐                  │  └────────┬────────┘ │
         │  Token   │                  │           │          │
         │ stored   │                  │           ▼          │
         │ in state │                  │  ┌─────────────────┐ │
         │ + localStorage             │  │  Review Invoice  │ │
         └──────────┘                  │  │ (verify fields)  │ │
                                      │  └────────┬────────┘ │
                                      │           │          │
                                      │           ▼          │
                                      │  ┌─────────────────┐ │
                                      │  │  Save + History  │ │
                                      │  │  + Detail View   │ │
                                      │  └─────────────────┘ │
                                      │                      │
                                      │  ┌─────────────────┐ │
                                      │  │  Provider Mgmt   │ │
                                      │  │  User Profile    │ │
                                      │  └─────────────────┘ │
                                      └─────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** (recommended) — install with `npm install -g pnpm`
- **Lexora Backend** running on `http://127.0.0.1:8000` (see [lexora-backend](https://github.com/AndresMes/lexora-backend))

### 1. Clone and install

```bash
git clone https://github.com/Lord-Jospe/lexora-frontend.git
cd lexora-frontend
pnpm install
```

### 2. Configure API base URL

The API base URL defaults to `http://127.0.0.1:8000` in `src/api/services/axios.ts`. Update it if your backend runs on a different host or port:

```ts
// src/api/services/axios.ts
const api = axios.create({
    baseURL: "http://127.0.0.1:8000",  // ← change here
});
```

### 3. Run the development server

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`.

### 4. Build for production

```bash
pnpm build        # outputs to dist/
pnpm preview      # preview production build locally
```

---

## Skills Demonstrated

- **React 19** — functional components, hooks (`useState`, `useContext`, `useEffect`), lazy loading with `React.lazy` + `Suspense`
- **TypeScript** — strict type definitions for API responses, request payloads, context values, and component props
- **React Router 7** — nested routes, layout routes with `<Outlet>`, lazy route loading, navigation guards (public/private)
- **Context API** — global auth state management with `createContext` + `useContext`, persisted to `localStorage`
- **Axios** — centralized HTTP client with request interceptors for automatic JWT injection
- **Tailwind CSS 4** — utility-first styling with custom theme configuration, animations, and responsive design
- **Radix UI** — accessible headless UI primitives (dialog, dropdown, sheet) composed into custom styled components
- **Class Variance Authority** — type-safe component variant management (button variants, sizes)
- **Vite 8** — fast HMR, path aliases, optimized production builds
- **Responsive Design** — collapsible sidebar, mobile-friendly layouts, zoomable image viewer
- **Error Handling** — toast notifications for success/error feedback, centralized error handler utility

---

## Related Repositories

- **Lexora Backend** → [github.com/AndresMes/lexora-backend](https://github.com/AndresMes/lexora-backend.git)

---

## Future Improvements

- Internationalization (i18n) for multi-language support
- Dark mode toggle
- Unit and integration tests (Vitest + React Testing Library)
- PWA support for offline invoice capture
- Drag-and-drop file upload zone
- Batch invoice processing
- Dashboard analytics and statistics
