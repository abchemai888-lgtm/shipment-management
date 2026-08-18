# Shipment Management System

A web application for tracking shipments, managing users, and maintaining audit history powered by React, TypeScript, Tailwind CSS, and Google Apps Script with Google Sheets.

---

## Tech Stack

- **Frontend Framework:** React 19
- **Build Tool / Bundler:** Vite 6
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Animations:** Motion (Framer Motion)
- **Backend Services:** Google Apps Script Web App APIs
- **Database / Data Store:** Google Sheets
- **CI/CD & Hosting:** GitHub Actions & GitHub Pages

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│             React 19 + TypeScript Single Page App           │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS (JSON / POST actions)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Google Apps Script Web Apps                 │
├──────────────────────────────┼──────────────────────────────┤
│ 1. Users API                 │ • Authentication & tokens    │
│                              │ • User CRUD & role checking  │
├──────────────────────────────┼──────────────────────────────┤
│ 2. Shipments API             │ • Shipment CRUD              │
│                              │ • Token-authorized actions   │
├──────────────────────────────┼──────────────────────────────┤
│ 3. Audit Log API             │ • System change history      │
│                              │ • Admin-authorized logging   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Google Sheets Backend                   │
│          (Users Sheet, Shipments Sheet, Audit Log)          │
└─────────────────────────────────────────────────────────────┘
```

### API Services Breakdown

1. **Users API (`USERS_API_URL`):**
   - Handles user login, password updates, and user management (add, edit, toggle status, delete).
   - Issues and validates bearer-style session tokens.
2. **Shipments API (`SHIPMENTS_API_URL`):**
   - Handles full CRUD operations for shipments (fetch list, add, edit status/details, delete).
   - Validates session tokens sent in payload headers.
3. **Audit Log API (`AUDIT_LOG_API_URL`):**
   - Records administrative changes, updates, and additions.
   - Performs authorization checks via the Users API before persisting entries.

---

## Getting Started (Local Development)

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.x or higher recommended)
- `npm` (version 10.x or higher)
- [Visual Studio Code](https://code.visualstudio.com/)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abchemai888-lgtm/shipment-management.git
   cd shipment-management
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000` to view the application.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launches the Vite development server on port 3000. |
| `npm run build` | Compiles TypeScript and builds the production bundle into `dist/`. |
| `npm run lint` | Runs the TypeScript compiler (`tsc --noEmit`) to verify type safety. |
| `npm run preview` | Locally serves the production build from `dist/` for testing. |
| `npm run clean` | Cleans up previous build artifacts. |

---

## Environment Variables

The application contains default Google Apps Script Web App endpoints pre-configured in code, allowing it to run immediately out of the box. You can optionally override any endpoint using client-side environment variables in a `.env.local` file:

| Variable Name | Purpose | Required? | Client-Side Safe? |
| :--- | :--- | :--- | :--- |
| `VITE_USERS_API_URL` | Override the Google Apps Script Users Web App URL | Optional | Yes (Public Web App URL) |
| `VITE_SHIPMENTS_API_URL` | Override the Google Apps Script Shipments Web App URL | Optional | Yes (Public Web App URL) |
| `VITE_AUDIT_LOG_API_URL` | Override the Google Apps Script Audit Log Web App URL | Optional | Yes (Public Web App URL) |
| `VITE_BASE_PATH` | Override the router base path (defaults to `/shipment-management/` for GitHub Pages, set to `/` for custom domains) | Optional | Yes (Build Configuration) |

Refer to `.env.example` for reference syntax. Never commit `.env` or `.env.local` files containing private credentials.

---

## Project Structure

```text
shipment-management/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages CI/CD deployment pipeline
├── public/
│   ├── .nojekyll               # Bypasses Jekyll processing on GitHub Pages
│   └── 404.html                # Single Page Application routing fallback
├── src/
│   ├── components/
│   │   ├── Admin/              # Users management & user modal views
│   │   ├── Common/             # Toast alerts, modals, search & filters
│   │   ├── Layout/             # Top navbar, responsive navigation
│   │   ├── Shipments/          # Shipment table, cards, create/edit modals
│   │   └── Login.tsx           # Authentication login view
│   ├── context/
│   │   ├── AuthContext.tsx     # Session management, token persistence & auth state
│   │   ├── ShipmentContext.tsx # Shipment state & CRUD operations
│   │   └── ToastContext.tsx    # Notification system
│   ├── services/
│   │   └── api.ts              # API client methods for Users, Shipments & Logs
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces & types
│   ├── utils/
│   │   └── formatters.ts       # Date, currency, and string formatters
│   ├── App.tsx                 # Root application component & view router
│   ├── index.css               # Tailwind CSS entry styles
│   ├── main.tsx                # React DOM root mounting
│   └── vite-env.d.ts           # Vite client & environment type definitions
├── .env.example                # Safe environment variable documentation
├── .gitignore                  # Git ignore rules
├── index.html                  # HTML entry point with SPA redirect script
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript compiler options
└── vite.config.ts              # Vite configuration
```

---

## Recommended Developer Workflow

1. **Pull Latest Changes:**
   ```bash
   git pull origin main
   ```
2. **Make Changes:**
   Edit code in Visual Studio Code with the TypeScript and Tailwind CSS IntelliSense extensions enabled.
3. **Verify Types & Code Quality:**
   ```bash
   npm run lint
   ```
4. **Test Production Build:**
   ```bash
   npm run build
   ```
5. **Commit & Push:**
   ```bash
   git add .
   git commit -m "Descriptive summary of changes"
   git push origin main
   ```
   Pushing to the `main` branch will automatically trigger the GitHub Actions workflow in `.github/workflows/deploy.yml` and deploy the update to GitHub Pages.

---

## Production Deployment & Custom Domains

- **GitHub Pages (Current):**
  The site is deployed to `https://abchemai888-lgtm.github.io/shipment-management/` using the default repository base path.
- **Switching to a Custom Domain (Future):**
  When migrating to a custom domain (e.g., `https://example.com`), either set `VITE_BASE_PATH=/` in the build environment or update the `base` property in `vite.config.ts` to `'/'`.
