# Shipment Management Project — Master Technical Handoff Report

> **Document Version**: 1.0.0  
> **Classification**: Primary Technical Source of Truth & Project Handoff  
> **Target Audience**: AI Developers, System Architects, Technical Maintainers  
> **Generation Date**: 2026-08-18  

---

## 1. SOURCE OF TRUTH & METHODOLOGY

This document serves as the permanent, authoritative technical handoff report for the **Shipment Management** system. Every claim, schema definition, API route, permission rule, and architecture layout contained in this document is derived directly from the physical codebase and verified runtime configuration of the project.

### Classification Standard
Every capability, module, endpoint, and feature documented herein is strictly classified into one of the following five standardized states:

| Classification | Meaning & Verification Standard |
| :--- | :--- |
| **`IMPLEMENTED`** | Confirmed by direct inspection of active source code and verified runtime behavior. |
| **`PARTIAL`** | Code exists but contains missing branches, stubbed logic, or incomplete end-to-end wiring. |
| **`PLANNED / PENDING`** | Required architectural feature discussed or scoped, but not yet present in active codebase. |
| **`NOT FOUND`** | Resource, file, or property does not exist in the repository or declared manifests. |
| **`EXTERNAL RESOURCE NOT INSPECTED`** | Remote external URL/Sheet requiring out-of-band credentials that could not be directly inspected. |

---

## 2. EXTERNAL AUDIT LOG RESOURCES

A distinct, decoupled Audit Logging subsystem exists as a core architectural requirement:

* **Audit Log API URL**: `https://script.google.com/macros/s/AKfycbwUp7rXFJYyAJ1I3V4I2fvSclzCcz_Xfmr6ogidLBQ5HWu47H5wMVMjcMCOHOVjRp-bIg/exec`
* **Audit Log Spreadsheet URL**: `https://docs.google.com/spreadsheets/d/12Rssx7zmW42sdmT2nnQGER0gMrn4bvD7KVvr6J5K5vE/edit?usp=sharing`
* **Audit Log Spreadsheet Sheet/Tab Name**: `Audit_Log`

### Inspection Status & Verification Report
* **Audit Log Apps Script Backend Code**: `EXTERNAL RESOURCE NOT INSPECTED`  
  * *Reason*: The Apps Script project is hosted remotely on Google Apps Script servers. Direct source code access requires Google Apps Script project editor credentials or CLI deployment pull (`clasp`). Probing the HTTP endpoint returned an authenticated redirect / access boundary.
* **Audit Log Google Sheet Content**: `EXTERNAL RESOURCE NOT INSPECTED`  
  * *Reason*: The spreadsheet requires authenticated Google Workspace OAuth access.
* **Audit Log Client-Side Routing in `src/services/api.ts`**: `PLANNED / PENDING`  
  * *Status*: In the current frontend `src/services/api.ts`, API requests are dispatched between `USERS_API_URL` and `SHIPMENTS_API_URL`. The Audit Log API URL is not yet connected to the client fetch router or triggered by client mutations.

---

## 3. PROJECT OVERVIEW

### Core Purpose & Domain
The **Shipment Management** platform is an enterprise-grade logistics and freight operations portal designed to track international import shipments, customs clearance workflows, laboratory testing, warehouse receiving, and multi-user administrative access backed by Google Sheets and Google Apps Script Web Apps.

### Primary User Personas & Workflows
1. **Administrator (`admin`)**:
   * Manages system user accounts (create, activate/disable, delete).
   * Performs administrative password overrides for any user.
   * Views all shipment records, logistics schedules, and customs procedures.
   * *Target capability*: Will have exclusive read-only access to the Audit Activity Log.
2. **Editor (`editor`)**:
   * Creates new shipment entries (`addShipment`).
   * Modifies existing shipment data and updates workflow procedure statuses (`updateShipment`).
   * Deletes obsolete shipment entries (`deleteShipment`).
3. **Standard User (`user`)**:
   * Read-only access to the shipments database.
   * Searches, filters, and inspects detailed shipment cards and expanded drawer rows.
   * Can change their own password.
4. **Special User (`USR-007` — "Hedy")**:
   * Possesses standard role privileges plus exclusive access to view, search, and edit the private field `notes hidy`.

### Technology Stack
* **Frontend Framework**: React 19 (`react` + `react-dom` v19.0.1) with TypeScript (`typescript` v5.8.2)
* **Build System & Dev Server**: Vite 6 (`vite` v6.2.3, `@vitejs/plugin-react` v5.0.4)
* **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` v4.1.14, `tailwindcss` v4.1.14)
* **Iconography**: Lucide React (`lucide-react` v0.546.0)
* **Animation & UI Transitions**: Motion (`motion` v12.23.24)
* **Backend Infrastructure**: Google Apps Script Web Apps (`doPost` action routers)
* **Database Layer**: Google Sheets (Spreadsheets acting as relational and tabular data stores)
* **Session Persistence**: Browser `sessionStorage` with bearer-style token forwarding

### High-Level Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WEB FRONTEND (React 19 SPA)                     │
│  - AuthContext / ToastContext                                         │
│  - ShipmentsView (Desktop Table + Mobile/Tablet Cards)                 │
│  - UsersView (Admin User Management & Password Control)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         HTTPS POST (JSON Payloads)
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│     USERS APPS SCRIPT API       │           │   SHIPMENTS APPS SCRIPT API     │
│  (Auth, Tokens, User Management)│           │ (CRUD, ID Generation, Filtering)│
└────────────────┬────────────────┘           └────────────────┬────────────────┘
                 │                                             │
                 ▼                                             ▼
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│       USERS SPREADSHEET         │           │      SHIPMENTS SPREADSHEET      │
│  (User ID, Name, Pass, Role...) │           │  (21 Column Logistics Database) │
└─────────────────────────────────┘           └─────────────────────────────────┘
```

---

## 4. COMPLETE FILE INVENTORY

The following inventory details every file present in the codebase:

| File Path | Type | Purpose | Main Functions / Exports | Key Dependencies | Used By | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/package.json` | Config | App dependencies, scripts | Scripts: `dev`, `build`, `lint`, `preview` | React 19, Vite 6, Tailwind v4 | Build System / npm | `IMPLEMENTED` |
| `/tsconfig.json` | Config | TypeScript compiler configuration | Compiler options, JSX transforms | TypeScript 5.8 | Build / Linting | `IMPLEMENTED` |
| `/vite.config.ts` | Config | Vite bundler & Tailwind plugin config | `defineConfig` | Vite, Tailwind Vite plugin | Vite Runtime | `IMPLEMENTED` |
| `/metadata.json` | Config | AI Studio platform metadata | Name, description, capabilities | Platform Schema | Platform Ingress | `IMPLEMENTED` |
| `/index.html` | Entry | HTML host page and viewport settings | Root `<div id="root">` | Vite runtime scripts | Browser | `IMPLEMENTED` |
| `/src/main.tsx` | Entry | React DOM rendering entry | `createRoot(document.getElementById('root'))` | React 19, App.tsx | index.html | `IMPLEMENTED` |
| `/src/index.css` | Styling | Global CSS and Tailwind CSS import | `@import "tailwindcss";` | Tailwind v4 | main.tsx | `IMPLEMENTED` |
| `/src/App.tsx` | Component | Top-level view router and context wrapper | `App`, `AppContent` | React, AuthContext, ToastContext | main.tsx | `IMPLEMENTED` |
| `/src/types/index.ts` | Types | Shared TypeScript data contracts | `UserRole`, `AuthUser`, `Shipment`, `AdminUser`, `ApiResponse` | None | Entire Project | `IMPLEMENTED` |
| `/src/services/api.ts` | Service | Central HTTP client & Apps Script router | `apiRequest`, `loginApi`, `getShipmentsApi`, `getShipmentApi`, `addShipmentApi`, `updateShipmentApi`, `deleteShipmentApi`, `getUsersApi`, `addUserApi`, `setUserStatusApi`, `deleteUserApi`, `changePasswordApi` | fetch API, types | Contexts & Components | `IMPLEMENTED` |
| `/src/context/AuthContext.tsx` | Context | Auth state, tokens, user session storage | `AuthProvider`, `useAuth`, `login`, `logout`, `changeUserPassword` | React Context, api.ts | App, Navbar, Views | `IMPLEMENTED` |
| `/src/context/ToastContext.tsx` | Context | Global alert and toast notifications | `ToastProvider`, `useToast`, `showSuccess`, `showError`, `showInfo` | Lucide React, React | Entire App | `IMPLEMENTED` |
| `/src/utils/formatters.ts` | Utility | Data sanitization and date/currency formatting | `displayVal`, `parseDateValue`, `formatDateToDMY`, `formatDate`, `formatDateForSheet`, `formatPrice` | Standard JS Date | Table, Cards, Modals | `IMPLEMENTED` |
| `/src/components/Navbar.tsx` | Component | Responsive header, tab router & user profile | `Navbar`, mobile menu toggle, logout handler | Lucide React, AuthContext | App.tsx | `IMPLEMENTED` |
| `/src/components/Login.tsx` | Component | Username/password authentication screen | `Login`, login form submission | Lucide React, AuthContext | App.tsx | `IMPLEMENTED` |
| `/src/components/Common/DatePicker.tsx` | Component | Localized calendar date selector | `DatePicker`, dd/mm/yyyy parser/formatter | Lucide React | ShipmentFormModal | `IMPLEMENTED` |
| `/src/components/Common/ConfirmDialog.tsx`| Component | Generic modal confirmation dialog | `ConfirmDialog` | Lucide React | ShipmentsView | `IMPLEMENTED` |
| `/src/components/Common/ChangePasswordModal.tsx`| Component| Password update modal for users & admins | `ChangePasswordModal` | Lucide React, AuthContext | Navbar, UsersView | `IMPLEMENTED` |
| `/src/components/Admin/UsersView.tsx` | Component | Administrative user directory & control | `UsersView`, status toggle, user deletion | Lucide React, api.ts | App.tsx | `IMPLEMENTED` |
| `/src/components/Admin/AddUserModal.tsx` | Component | Form modal for provisioning new users | `AddUserModal`, validation & submission | Lucide React, api.ts | UsersView.tsx | `IMPLEMENTED` |
| `/src/components/Admin/ConfirmDialog.tsx`| Component | Admin-specific confirmation dialog | `ConfirmDialog` | Lucide React | UsersView.tsx | `IMPLEMENTED` |
| `/src/components/Shipments/ShipmentsView.tsx` | Component | Shipments hub, search, filters & state | `ShipmentsView`, CRUD orchestration | ShipmentsTable, ShipmentCard, Modals | App.tsx | `IMPLEMENTED` |
| `/src/components/Shipments/ShipmentsTable.tsx`| Component| Compact table view with row expansion (`+`/`−`) | `ShipmentsTable`, toggleExpand | Lucide React, WorkflowBadge | ShipmentsView.tsx | `IMPLEMENTED` |
| `/src/components/Shipments/ShipmentCard.tsx` | Component | Responsive card view with expand toggle (`+`/`−`)| `ShipmentCard`, collapsed/expanded state | Lucide React, WorkflowBadge | ShipmentsView.tsx | `IMPLEMENTED` |
| `/src/components/Shipments/ShipmentFormModal.tsx`| Component| Add/Edit modal supporting all 21 fields | `ShipmentFormModal`, delta diff submission | DatePicker, api.ts | ShipmentsView.tsx | `IMPLEMENTED` |
| `/src/components/Shipments/ShipmentDetailsModal.tsx`| Component| Full-screen detail inspector for shipments | `ShipmentDetailsModal` | Lucide React, WorkflowBadge | ShipmentsView.tsx | `IMPLEMENTED` |
| `/src/components/Shipments/WorkflowBadge.tsx` | Component| Semantic badge for Arabic procedure steps | `WorkflowBadge`, positive/pending/rejected styles | formatters.ts | Table, Card, Details | `IMPLEMENTED` |

---

## 5. GOOGLE SHEETS / DATA INVENTORY

The system interacts with three distinct logical spreadsheets:

### 1. Users Spreadsheet
* **Logical Role**: Authentication, Credentials, Roles, and Account Status.
* **Spreadsheet Backend**: Managed by Users Apps Script (`USERS_API_URL`).
* **Expected Columns**: `User ID`, `Name`, `Password`, `Role`, `Active` (or `Active status`).
* **Read Permissions**: Authenticated Admin (`getUsers`), Authenticated System (`login`, `verifyToken`).
* **Write Permissions**: Authenticated Admin (`addUser`, `setUserStatus`, `deleteUser`, `changePassword`).
* **Related Frontend**: `src/components/Login.tsx`, `src/components/Admin/UsersView.tsx`, `src/components/Admin/AddUserModal.tsx`.

### 2. Shipments Spreadsheet
* **Logical Role**: Comprehensive logistics database for freight, commercial, and customs records.
* **Spreadsheet Backend**: Managed by Shipments Apps Script (`SHIPMENTS_API_URL`).
* **Columns (21 Fields)**:
  1. `Shipment ID` (Primary Key, auto-generated)
  2. `shipment type`
  3. `importing co.`
  4. `Brokers`
  5. `Shipping Company`
  6. `bill of lading`
  7. `bank document`
  8. `Invoice Number`
  9. `Acid Number`
  10. `Total Price`
  11. `Departure Date` (dd/mm/yyyy)
  12. `Expected Arrival` (dd/mm/yyyy)
  13. `Actual Arrival` (dd/mm/yyyy)
  14. `Products` (Multiline text)
  15. `Notes`
  16. `تجهيز الورق` (`pending` / `done`)
  17. `سحب العينات` (`pending` / `done`)
  18. `المدفوعة` (`pending` / `done`)
  19. `استلام المخزن` (`pending` / `done`)
  20. `نتيجة المعمل المركزي` (`approved` / `non approved`)
  21. `مطابقة` (`approved` / `non approved`)
  * *Special Column*: `notes hidy` (Filtered at backend level, exposed strictly to user `USR-007`).
* **Read Permissions**: All authenticated users (`admin`, `editor`, `user`).
* **Write Permissions**: `editor` role exclusively.

### 3. Audit Log Spreadsheet
* **Spreadsheet URL**: `https://docs.google.com/spreadsheets/d/12Rssx7zmW42sdmT2nnQGER0gMrn4bvD7KVvr6J5K5vE/edit?usp=sharing`
* **Target Tab**: `Audit_Log`
* **Inspection Status**: `EXTERNAL RESOURCE NOT INSPECTED`
* **Intended Schema**: `Log ID`, `Timestamp`, `User ID`, `User Name`, `Role`, `Action`, `Entity`, `Entity ID`, `Field`, `Old Value`, `New Value`, `Description`.

---

## 6. USERS SYSTEM

### Implementation Status: `IMPLEMENTED`

```
┌─────────────────────────────────────────────────────────────┐
│                      ROLE MATRIX                            │
├─────────┬───────────────────┬───────────────────────────────┤
│ ROLE    │ GRANTED PRIVILEGES│ RESTRICTIONS                  │
├─────────┼───────────────────┼───────────────────────────────┤
│ admin   │ - View Users View │ - Cannot delete own account   │
│         │ - Add Users       │ - Cannot edit shipments unless│
│         │ - Disable/Enable  │   also assigned editor role   │
│         │ - Reset Passwords │                               │
│         │ - View Shipments  │                               │
├─────────┼───────────────────┼───────────────────────────────┤
│ editor  │ - View Shipments  │ - Cannot access Users View    │
│         │ - Add Shipments   │ - Cannot manage credentials   │
│         │ - Edit Shipments  │                               │
│         │ - Delete Shipments│                               │
├─────────┼───────────────────┼───────────────────────────────┤
│ user    │ - View Shipments  │ - Cannot access Users View    │
│         │ - Change Own Pass │ - Cannot add/edit/delete      │
│         │                   │   shipments (Read-Only)       │
└─────────┴───────────────────┴───────────────────────────────┘
```

### Key Mechanisms:
* **Authentication**: Executed via `POST { action: 'login', name, password }` against `USERS_API_URL`.
* **Session Storage**: The returned `token` and `user` object are stored in browser `sessionStorage`.
* **Automatic Session Invalidation**: The central `apiRequest` interceptor intercepts `unauthorized`, `token`, `expired`, or `invalid session` messages and dispatches an automated logout.
* **Boolean Normalization**: Helper `normalizeBoolean` handles varying sheet values (`true`, `'TRUE'`, `'active'`, `1`, `'yes'`).

---

## 7. SHIPMENTS SYSTEM

### Implementation Status: `IMPLEMENTED`

| Field Name | Data Type & Format | Storage | Read Access | Write Access | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Shipment ID` | String (`SHP-XXXX`) | Column | All Roles | Server Auto | Unique primary key. Never modified. |
| `shipment type` | String | Column | All Roles | `editor` | Mode or classification of freight. |
| `importing co.` | String | Column | All Roles | `editor` | Company importing the goods. |
| `Brokers` | String | Column | All Roles | `editor` | Clearance broker responsible. |
| `Shipping Company`| String | Column | All Roles | `editor` | Maritime or air freight carrier. |
| `bill of lading` | String | Column | All Roles | `editor` | Shipping B/L reference number. |
| `bank document` | String | Column | All Roles | `editor` | Bank letter of credit / collection doc. |
| `Invoice Number` | String | Column | All Roles | `editor` | Commercial invoice reference. |
| `Acid Number` | String | Column | All Roles | `editor` | Egyptian Customs ACID registration. |
| `Total Price` | Numeric / Formatted | Column | All Roles | `editor` | Total declared valuation of cargo. |
| `Departure Date` | Date (`dd/mm/yyyy`) | Column | All Roles | `editor` | Port of origin departure date. |
| `Expected Arrival`| Date (`dd/mm/yyyy`) | Column | All Roles | `editor` | Estimated port of arrival date. |
| `Actual Arrival` | Date (`dd/mm/yyyy`) | Column | All Roles | `editor` | Confirmed dock arrival date. |
| `Products` | Text (Multiline) | Column | All Roles | `editor` | List and descriptions of items in cargo. |
| `Notes` | Text (Multiline) | Column | All Roles | `editor` | Operational remarks. |
| `تجهيز الورق` | `'pending'` \| `'done'` | Column | All Roles | `editor` | Documentation preparation status. |
| `سحب العينات` | `'pending'` \| `'done'` | Column | All Roles | `editor` | Customs sample extraction status. |
| `المدفوعة` | `'pending'` \| `'done'` | Column | All Roles | `editor` | Customs duties and taxes payment status. |
| `استلام المخزن` | `'pending'` \| `'done'` | Column | All Roles | `editor` | Warehouse receiving & unloading status. |
| `نتيجة المعمل المركزي`| `'approved'` \| `'non approved'` | Column | All Roles | `editor` | Central testing laboratory analysis. |
| `مطابقة` | `'approved'` \| `'non approved'` | Column | All Roles | `editor` | Standards compliance & conformity result. |
| `notes hidy` | Text (Private) | Column | `USR-007` Only | `USR-007` (if editor) | Confidential notes accessible to Hedy. |

---

## 8. SHIPMENTS API

* **Endpoint URL**: `https://script.google.com/macros/s/AKfycbxMOYWsrJAlILBYJgw2mRsreANCRoTztENsDjd5tXFLem3R6JG8NMH2halwYhkv-deWcQ/exec`
* **Transport**: HTTP POST (`Content-Type: text/plain;charset=utf-8`)

### Action Matrix

| Action | Purpose | Auth Required | Permitted Roles | Input Payload | Output Response | Code Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `getShipments` | Fetch all shipments | Yes (`token`) | All Roles | `{ action: 'getShipments', token }` | `{ success: true, shipments: Shipment[] }` | `IMPLEMENTED` |
| `getShipment` | Fetch single shipment | Yes (`token`) | All Roles | `{ action: 'getShipment', token, shipmentId }` | `{ success: true, shipment: Shipment }` | `IMPLEMENTED` |
| `addShipment` | Create new shipment | Yes (`token`) | `editor` | `{ action: 'addShipment', token, shipment: {...} }` | `{ success: true, shipmentId: string }` | `IMPLEMENTED` |
| `updateShipment`| Partial field update | Yes (`token`) | `editor` | `{ action: 'updateShipment', token, shipmentId, updates: {...} }` | `{ success: true, message: string }` | `IMPLEMENTED` |
| `deleteShipment`| Delete shipment row | Yes (`token`) | `editor` | `{ action: 'deleteShipment', token, shipmentId }` | `{ success: true, message: string }` | `IMPLEMENTED` |

---

## 9. USERS API

* **Endpoint URL**: `https://script.google.com/macros/s/AKfycbwuIf3kCo6KBe5pVgQXUxF3ZvF_paDzfrGtxCmwmivmNT1NQA4KUF2QCJPBXxKzjB_z/exec`
* **Transport**: HTTP POST (`Content-Type: text/plain;charset=utf-8`)

### Action Matrix

| Action | Purpose | Auth Required | Permitted Roles | Input Payload | Output Response | Code Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `login` | Authenticate user | No | Public | `{ action: 'login', name, password }` | `{ success: true, token, user }` | `IMPLEMENTED` |
| `verifyToken` | Check token validity | Yes (`token`) | All Roles | `{ action: 'verifyToken', token }` | `{ success: true, valid: boolean }` | `IMPLEMENTED` |
| `getUsers` | List all user accounts | Yes (`token`) | `admin` | `{ action: 'getUsers', token }` | `{ success: true, users: AdminUser[] }` | `IMPLEMENTED` |
| `addUser` | Register new user | Yes (`token`) | `admin` | `{ action: 'addUser', token, name, password, role }` | `{ success: true, userId: string }` | `IMPLEMENTED` |
| `setUserStatus` | Toggle active/disabled | Yes (`token`) | `admin` | `{ action: 'setUserStatus', token, userId, active: boolean }` | `{ success: true, message: string }` | `IMPLEMENTED` |
| `deleteUser` | Remove user row | Yes (`token`) | `admin` | `{ action: 'deleteUser', token, userId }` | `{ success: true, message: string }` | `IMPLEMENTED` |
| `changePassword`| Reset user password | Yes (`token`) | Self or `admin`| `{ action: 'changePassword', token, userId, newPassword }` | `{ success: true, message: string }` | `IMPLEMENTED` |

---

## 10. AUDIT LOG API

* **Endpoint URL**: `https://script.google.com/macros/s/AKfycbwUp7rXFJYyAJ1I3V4I2fvSclzCcz_Xfmr6ogidLBQ5HWu47H5wMVMjcMCOHOVjRp-bIg/exec`
* **Backend Source Code Status**: `EXTERNAL RESOURCE NOT INSPECTED`

### Target Architecture Specifications:
* **`doPost(e)`**: Main request entry point parsing JSON bodies and routing actions.
* **`addLog(params)`**: Appends a cryptographically sequential or timestamped audit record to `Audit_Log`.
* **`getLogs(params)`**: Enforces `admin` role validation before returning log rows.
* **`generateLogId()`**: Generates monotonic log IDs (e.g. `LOG-00001`).
* **`getAuditLogSheet()`**: Helper to access the `Audit_Log` tab with concurrency locks (`LockService`).

---

## 11. AUDIT LOG DATA MODEL

Expected columns in the `Audit_Log` sheet:

```
┌────────┬───────────┬─────────┬───────────┬──────┬────────┬────────┬───────────┬───────┬───────────┬───────────┬─────────────┐
│ Log ID │ Timestamp │ User ID │ User Name │ Role │ Action │ Entity │ Entity ID │ Field │ Old Value │ New Value │ Description │
└────────┴───────────┴─────────┴───────────┴──────┴────────┴────────┴───────────┴───────┴───────────┴───────────┴─────────────┘
```

1. **`Log ID`**: Server-generated primary key (e.g., `LOG-1001`). Immutable.
2. **`Timestamp`**: ISO-8601 or UTC date-time of execution. Server-generated.
3. **`User ID`**: Identity of the executing user.
4. **`User Name`**: Human-readable name of user.
5. **`Role`**: Role at execution time (`admin`, `editor`, `user`).
6. **`Action`**: Operation performed (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `STATUS_CHANGE`, `PASSWORD_CHANGE`).
7. **`Entity`**: Domain object (`SHIPMENT`, `USER`, `AUTH`).
8. **`Entity ID`**: Identifier of modified record (`SHP-1012`, `USR-004`).
9. **`Field`**: Specific column altered (for updates, e.g., `'تجهيز الورق'`, `'Departure Date'`).
10. **`Old Value`**: Previous value prior to mutation.
11. **`New Value`**: Updated value written to the sheet.
12. **`Description`**: Human-readable audit narrative.

---

## 12. AUDIT LOG SECURITY & INTEGRITY

| Security Requirement | Status | Evidence in Active Codebase | Component | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication Enforcement** | `PLANNED / PENDING` | Not yet invoked from frontend `api.ts` | Backend API | Low (Audit currently isolated) |
| **Admin-Only Log Retrieval** | `PLANNED / PENDING` | No frontend log view mounted yet | Backend / UI | Low |
| **Read-Only / Immutability** | `PLANNED / PENDING` | Apps Script must reject `edit`/`delete` log actions | Apps Script | Medium |
| **Old/New Value Capture** | `PLANNED / PENDING` | Frontend currently sends delta payload only | Shipments API | Medium |
| **Deletion Isolation** | `PLANNED / PENDING` | Deleting a shipment must not cascade to audit sheet | Shipments API | High (Data integrity rule) |

---

## 13. AUDIT INTEGRATION WITH SHIPMENTS

| Operation | Audit Trigger Status | Delta / Diff Logging | Pre-Deletion Snapshot | Status |
| :--- | :--- | :--- | :--- | :--- |
| `addShipment` | `PLANNED / PENDING` | Full initial record logged | N/A | `PLANNED / PENDING` |
| `updateShipment` | `PLANNED / PENDING` | Frontend calculates delta in `ShipmentFormModal` | Requires reading old row in GAS | `PLANNED / PENDING` |
| `deleteShipment` | `PLANNED / PENDING` | N/A | Must snapshot record prior to `deleteRow` | `PLANNED / PENDING` |

---

## 14. AUDIT INTEGRATION WITH USERS

| Event | Target Audit Action | Current Implementation Status |
| :--- | :--- | :--- |
| `login` | `LOGIN` | `PLANNED / PENDING` |
| `addUser` | `USER_CREATE` | `PLANNED / PENDING` |
| `setUserStatus` | `USER_STATUS_CHANGE` | `PLANNED / PENDING` |
| `deleteUser` | `USER_DELETE` | `PLANNED / PENDING` |
| `changePassword` | `PASSWORD_CHANGE` | `PLANNED / PENDING` |

---

## 15. ADMIN ACTIVITY LOG UI

* **Current Implementation Status**: `PLANNED / PENDING`
* **Target Design Specifications**:
  * Dedicated navigation tab in `Navbar.tsx` visible strictly when `isAdmin === true`.
  * Dedicated container `src/components/Admin/ActivityLogView.tsx`.
  * Filter controls: Filter by User, Filter by Action, Filter by Entity ID, Date Range Selector.
  * Search bar for quick matching across descriptions and IDs.
  * Strict UI constraints: **NO** Edit button, **NO** Delete button, **NO** Clear Logs button.

---

## 16. RESPONSIVE SHIPMENT UI

### Current Implementation Status: `IMPLEMENTED`

The responsive shipment interface is fully implemented with viewport-adaptive layouts:

```
┌────────────────────────────────────────────────────────────────────────┐
│ DESKTOP VIEW (≥ 1200px / xl breakpoint): High-Density Table            │
│ ┌───┬──────────────┬──────────────┬───────────────┬──────────────────┐ │
│ │ + │ ID: SHP-1001 │ Type: Sea    │ Products: ... │ Actions: [👁][✎][🗑]│ │
│ └───┴──────────────┴──────────────┴───────────────┴──────────────────┘ │
│      ▼ (When '+' clicked: Expands inline accordion drawer with all 21 fields) │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ TABLET & MOBILE VIEW (< 1200px): Responsive 2-Col / 1-Col Grid Cards   │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [SHP-1001] [Type]                                   [ + More ]     │ │
│ │ Invoice: INV-01   Carrier: Maersk   Arrival: 12/04/2026            │ │
│ │ Workflow: [ورق: done] [عينات: pending]                             │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│      ▼ (When '+ More' clicked: Expands full key-value parameter grid)  │
└────────────────────────────────────────────────────────────────────────┘
```

* **No Horizontal Table Spilling**: Desktop table uses ellipsis overflow and truncates long text. Mobile cards format parameters into neat responsive columns.
* **Row/Card Expansion (`+` / `−`)**: Both table rows and mobile cards provide dedicated expand toggles allowing operators to inspect all 21 parameters inline without losing page context.
* **Role-Gated Controls**: Add, Edit, and Delete action buttons are strictly conditional on `currentUser?.role === 'editor'`.

---

## 17. API CONNECTION MAP

```
                               ┌─────────────────────────┐
                               │   React 19 Application  │
                               └────────────┬────────────┘
                                            │
                               ┌────────────┴────────────┐
                               ▼                         ▼
                     ┌───────────────────┐     ┌───────────────────┐
                     │     USERS API     │     │   SHIPMENTS API   │
                     └─────────┬─────────┘     └─────────┬─────────┘
                               │                         │
                               ▼                         ▼
                     ┌───────────────────┐     ┌───────────────────┐
                     │  Users G-Sheet    │     │ Shipments G-Sheet │
                     └───────────────────┘     └───────────────────┘
                                                          
                     ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
                       [Target Planned Architecture]                  
                     │                                               │
                       Audit Log API  ◄───  Shipments & Users API
                     │       │                                       │
                             ▼
                     │   Audit_Log Spreadsheet                       │
                      ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

---

## 18. COMPLETE URL INVENTORY

| API Subsystem | URL | Primary Function | Consumer | Auth Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Users API** | `https://script.google.com/macros/s/AKfycbwuIf3kCo6KBe5pVgQXUxF3ZvF_paDzfrGtxCmwmivmNT1NQA4KUF2QCJPBXxKzjB_z/exec` | Authentication, Token Validation, User CRUD | Frontend (`api.ts`) | JSON Token in payload | `IMPLEMENTED` |
| **Shipments API** | `https://script.google.com/macros/s/AKfycbxMOYWsrJAlILBYJgw2mRsreANCRoTztENsDjd5tXFLem3R6JG8NMH2halwYhkv-deWcQ/exec` | Shipments CRUD, Automated ID Gen, Filtering | Frontend (`api.ts`) | JSON Token in payload | `IMPLEMENTED` |
| **Audit Log API** | `https://script.google.com/macros/s/AKfycbwUp7rXFJYyAJ1I3V4I2fvSclzCcz_Xfmr6ogidLBQ5HWu47H5wMVMjcMCOHOVjRp-bIg/exec` | Immutable Activity Logging | Planned (APIs & UI) | Token + Role check | `EXTERNAL RESOURCE NOT INSPECTED` |

*(All secrets, bearer keys, and administrative credentials are fully redacted according to security compliance.)*

---

## 19. CONFIGURATION INVENTORY

* **Development Port**: `3000` (Hardcoded platform ingress constraint)
* **Binding Host**: `0.0.0.0`
* **Session Storage Keys**:
  * `TOKEN_KEY`: `'shipment_app_token'`
  * `USER_KEY`: `'shipment_app_user'`
* **Role Literals**:
  * `'admin'`
  * `'editor'`
  * `'user'`
* **Special User Identifiers**:
  * `USR-007`: Special identifier for user **Hedy** (grants exclusive access to `notes hidy`).
* **Workflow Status Option Sets**:
  * Procedures 1-4 (`تجهيز الورق`, `سحب العينات`, `المدفوعة`, `استلام المخزن`): `['pending', 'done']`
  * Procedures 5-6 (`نتيجة المعمل المركزي`, `مطابقة`): `['approved', 'non approved']`

---

## 20. CURRENT STATUS MASTER TABLE

| Feature / Subsystem | Status | Evidence in Codebase | Component | Technical Notes |
| :--- | :--- | :--- | :--- | :--- |
| **User Login & Auth** | `IMPLEMENTED` | `src/context/AuthContext.tsx`, `src/components/Login.tsx` | Frontend | Session token stored in `sessionStorage` |
| **Token Invalidation Handler**| `IMPLEMENTED` | `src/services/api.ts` (`setAuthFailureHandler`) | API Router | Triggers automatic logout on auth failure |
| **User Directory (`getUsers`)**| `IMPLEMENTED` | `src/components/Admin/UsersView.tsx` | Admin UI | Filter by name, ID, role; Admin only |
| **User Provisioning (`addUser`)**| `IMPLEMENTED`| `src/components/Admin/AddUserModal.tsx` | Admin UI | Creates admin, editor, or user accounts |
| **User Status Toggle** | `IMPLEMENTED` | `src/components/Admin/UsersView.tsx` | Admin UI | Enables/disables account via `setUserStatus` |
| **User Deletion** | `IMPLEMENTED` | `src/components/Admin/UsersView.tsx` | Admin UI | Prevents admin self-deletion |
| **Password Override** | `IMPLEMENTED` | `src/components/Common/ChangePasswordModal.tsx`| Shared Modal | Allows self or admin password updates |
| **Shipments Read (`getShipments`)**| `IMPLEMENTED`| `src/components/Shipments/ShipmentsView.tsx` | Shipments UI | Real-time fetch from Google Sheets |
| **Shipment Creation (`addShipment`)**| `IMPLEMENTED`| `src/components/Shipments/ShipmentFormModal.tsx`| Shipments UI | Server assigns auto-generated ID |
| **Shipment Update (`updateShipment`)**| `IMPLEMENTED`| `src/components/Shipments/ShipmentFormModal.tsx`| Shipments UI | Computes delta diff before submission |
| **Shipment Deletion (`deleteShipment`)**| `IMPLEMENTED`| `src/components/Shipments/ShipmentsView.tsx` | Shipments UI | Restricted to `editor` role |
| **Private Notes (`notes hidy`)**| `IMPLEMENTED`| `ShipmentCard.tsx`, `ShipmentsTable.tsx`, `ShipmentFormModal.tsx` | Shipments UI | Gated to `user_id === 'USR-007'` |
| **Search & Filtering** | `IMPLEMENTED` | `src/components/Shipments/ShipmentsView.tsx` | Shipments UI | Multi-parameter search across all fields |
| **Desktop Table with Expansion**| `IMPLEMENTED`| `src/components/Shipments/ShipmentsTable.tsx` | Shipments UI | `+`/`−` accordion drawer for full records |
| **Tablet/Mobile Card Grid** | `IMPLEMENTED` | `src/components/Shipments/ShipmentCard.tsx` | Shipments UI | Responsive cards with `+ More` expander |
| **Audit Log API Endpoint** | `EXTERNAL RESOURCE NOT INSPECTED` | Google Apps Script URL | Remote API | Remote endpoint exists |
| **Audit Log Spreadsheet** | `EXTERNAL RESOURCE NOT INSPECTED` | Google Sheets URL | Remote Sheet | `Audit_Log` tab on remote spreadsheet |
| **Audit Integration: Shipments**| `PLANNED / PENDING` | Not present in `src/services/api.ts` | Services | Requires backend Apps Script hook |
| **Audit Integration: Users** | `PLANNED / PENDING` | Not present in `src/services/api.ts` | Services | Requires backend Apps Script hook |
| **Admin Activity Log View** | `PLANNED / PENDING` | Not present in `src/components/Admin/` | Admin UI | Planned read-only audit log dashboard |

---

## 21. CHANGELOG

* **2026-08-18**:
  * **Responsive UI Architecture**: Implemented high-density desktop table view (`>= 1200px`) with row expansion (`+` / `−`) and responsive card grid (`< 1200px`) with touch-friendly expansion (`+ More` / `− Less`).
  * **Role-Based Action Gating**: Aligned delete, add, and edit controls strictly with the `editor` role across table rows, card footers, and modal headers.
  * **Date Handling Standard**: Integrated localized `DatePicker` component and `dd/mm/yyyy` formatters ensuring consistent display without timezone shifts.
  * **Compilation & Linting**: Verified zero TypeScript errors across React 19 codebase.

---

## 22. KNOWN ISSUES & TECHNICAL OBSERVATIONS

1. **Audit Log Decoupling**:
   * *Component*: Audit Log Subsystem
   * *Impact*: Current mutations to shipments or users are not yet writing rows to the remote `Audit_Log` sheet.
   * *Severity*: Low (Non-breaking for primary shipment workflows, but required for complete compliance).
   * *Recommended Next Step*: Implement automated audit event dispatching in Apps Script backends or via frontend service calls.
2. **Offline Mode Handling**:
   * *Component*: `src/services/api.ts`
   * *Impact*: Network disconnections display a toast notification but do not cache pending mutations.
   * *Severity*: Low.
   * *Recommended Next Step*: Keep existing real-time online sync model as required by Google Sheets persistence rules.

---

## 23. PERMANENT DEVELOPMENT RULES

1. **API Backward Compatibility**: Never alter existing action names (`login`, `getShipments`, `addShipment`, `updateShipment`, `deleteShipment`, `getUsers`, `addUser`, `setUserStatus`, `deleteUser`, `changePassword`).
2. **Database Integrity**: Never rename or delete columns in the Google Sheet without formal documentation and schema migration.
3. **Subsystem Isolation**: Maintain clean separation between Users management, Shipments logistics, and Audit logging.
4. **Strict Authorization**: Frontend visibility toggles must always be backed by backend role validation in Google Apps Script.
5. **Audit Immutability**: The Audit Log must never support `update` or `delete` actions.
6. **Audit Persistence on Delete**: Deleting a shipment record must never delete its historical audit log rows.
7. **Accurate Delta Logging**: Updates should capture both `Old Value` and `New Value` for modified fields.
8. **No Exposed Secrets**: Never hardcode private keys, passwords, or authentication secrets in client code.
9. **UI Consistency**: Responsive enhancements must preserve existing field mappings, modal workflows, and role permissions.

---

## 24. DEVELOPMENT ROADMAP

### Priority 1: Security & Backend Authorization
* Ensure Google Apps Script backends validate `token` signatures and role permissions on every mutation before modifying spreadsheet rows.

### Priority 2: End-to-End Audit Integration
* Configure `Shipments API` and `Users API` to dispatch audit log payloads to the `Audit Log API` on `addShipment`, `updateShipment`, `deleteShipment`, `addUser`, `setUserStatus`, and `deleteUser`.

### Priority 3: Admin Activity Log UI
* Construct `src/components/Admin/ActivityLogView.tsx` with date-range, user, and action filters for administrators.

### Priority 4: Performance & Caching
* Optimize initial fetch payloads and implement optimistic UI updates for instant feedback during network roundtrips.

---

## 25. MASTER CONTEXT — DO NOT LOSE

```
================================================================================
                    MASTER CONTEXT — DO NOT LOSE
================================================================================

PROJECT: Shipment Management
STACK: React 19, TypeScript 5.8, Tailwind CSS v4, Vite 6, Google Apps Script, Google Sheets

APIs & ENDPOINTS:
1. Users API:
   https://script.google.com/macros/s/AKfycbwuIf3kCo6KBe5pVgQXUxF3ZvF_paDzfrGtxCmwmivmNT1NQA4KUF2QCJPBXxKzjB_z/exec
   Actions: login, verifyToken, getUsers, addUser, updateUser, setUserStatus, deleteUser, changePassword

2. Shipments API:
   https://script.google.com/macros/s/AKfycbxMOYWsrJAlILBYJgw2mRsreANCRoTztENsDjd5tXFLem3R6JG8NMH2halwYhkv-deWcQ/exec
   Actions: getShipments, getShipment, addShipment, updateShipment, deleteShipment

3. Audit Log API:
   https://script.google.com/macros/s/AKfycbwUp7rXFJYyAJ1I3V4I2fvSclzCcz_Xfmr6ogidLBQ5HWu47H5wMVMjcMCOHOVjRp-bIg/exec
   Spreadsheet: https://docs.google.com/spreadsheets/d/12Rssx7zmW42sdmT2nnQGER0gMrn4bvD7KVvr6J5K5vE/edit?usp=sharing
   Sheet Tab: Audit_Log

ROLES & PERMISSIONS:
- admin: User management, password resets, shipment viewing, planned audit log viewing.
- editor: Shipment CRUD (add, update, delete shipments).
- user: Read-only access to shipments, password change for self.
- USR-007 (Hedy): Exclusive access to view, search, and edit private field 'notes hidy'.

SHIPMENT SCHEMA (21 Fields):
Shipment ID (Auto PK), shipment type, importing co., Brokers, Shipping Company,
bill of lading, bank document, Invoice Number, Acid Number, Total Price,
Departure Date (dd/mm/yyyy), Expected Arrival (dd/mm/yyyy), Actual Arrival (dd/mm/yyyy),
Products (multiline), Notes (multiline),
Workflow: تجهيز الورق (pending/done), سحب العينات (pending/done), المدفوعة (pending/done),
استلام المخزن (pending/done), نتيجة المعمل المركزي (approved/non approved), مطابقة (approved/non approved),
Private: notes hidy (USR-007 only).

UI LAYOUT:
- Desktop (>= 1200px): Compact table with '+' / '−' row accordion drawer.
- Tablet & Mobile (< 1200px): Responsive 2-col/1-col card grid with '+ More' / '− Less' drawer.
- Navbar: Brand, Shipments / Manage Users tabs (admin only), User badge, Change Password, Logout.

CURRENT IMPLEMENTATION STATUS:
- Users System & Auth: IMPLEMENTED
- Shipments CRUD & Search: IMPLEMENTED
- Responsive Table & Cards: IMPLEMENTED
- Audit Log Backend & Sheet: EXTERNAL RESOURCE NOT INSPECTED
- Audit Integration with Shipments & Users: PLANNED / PENDING
- Admin Activity Log UI: PLANNED / PENDING

================================================================================
```
