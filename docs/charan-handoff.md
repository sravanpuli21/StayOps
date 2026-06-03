# Backend Handoff — for Charan

Running list of flow items that need backend work (new tables, seeds, endpoints,
or schema changes). Frontend is done/connected for each unless noted. Compiled
during the flow-by-flow review with Sravan.

---

## 0. Front-desk computer = PUNCH CLOCK ONLY (no login) + offline queue (NEW)

**Decision (this session):** the front-desk computer is a **shared punch clock** —
**no sign-in, no tools, no navigation.** `/web/desk/<CODE>` redirects straight to
`/web/desk/<CODE>/punch`. Anyone (incl. other departments) walks up, types their
**own username + password**, and taps Punch In / Punch Out. Identifying yourself is
only to stamp the right timecard — it is NOT a session/login.

> Earlier in the session I built a desk Sign In gate + one-tap punch + a
> `/api/desk/login` and `/api/desk/punch`. Per Sravan ("no sign-in, only punch in
> or punch out") those were **removed** — DeskLogin.tsx, desk-session.tsx,
> QuickPunchModal.tsx, and both `/api/desk/*` routes are deleted. Punch goes
> through the credential-verified `POST /api/employees/punch` only.

**Offline resilience (NEW — important for a time clock):**
- Punches are written to a **device-local queue** first (`punch-queue.ts`,
  localStorage `stayops.desk.punchQueue.<CODE>`), then sent to the server. If the
  network is down, the punch is kept and **auto-synced** on the `online` event and
  every 30s. The header shows an "N punches waiting to sync" badge.
- The client sends `punchedAt` (ISO) so a punch synced minutes later records the
  **real punch time**, not the sync time. `PunchRequestSchema.punchedAt` (optional)
  + `recordPunch(uuid, kind, punchedAt?)` now honor it (verified: a punch sent with
  `punchedAt=18:05` stored as 18:05). DB default `now()` when omitted.

**The gap (needs backend):**
1. **Offline auth is trust-on-sync.** Password is verified server-side, so an
   offline punch can't be checked until it syncs; a wrong password is rejected at
   sync time (`flushQueue` drops 4xx and surfaces it). The queue currently stores
   the **password in localStorage** to replay — a demo simplification. Real offline
   auth = a cached/signed credential or a locally-verifiable token. Needs design.
2. **Dedupe / idempotency.** Each queued punch has a client `id`; the punch insert
   should be idempotent on it so a double-sync can't create two punches.
3. Everything in §1 below (the `employees` table seed) still applies.

**Files:** `apps/web/src/app/web/desk/[hotelCode]/DeskShell.tsx` (punch-only kiosk
chrome + sync loop), `.../punch/PunchClient.tsx` (credential punch screen),
`.../punch-queue.ts` (offline queue, NEW), `apps/web/src/app/api/employees/punch/route.ts`
+ `lib/server/employee-punches.ts` (`recordPunch` punchedAt),
`packages/shared/src/api/operations.ts` (`PunchRequestSchema.punchedAt`).

---

## 1. Punch In/Out — `employees` auth table (was empty; now seeded — verify)

> **Update (this session):** the `employees` table now returns rows — punch
> succeeds for `1001` (Avery Patel). The "empty table" note below is likely stale;
> please confirm the seed is intentional/complete for all 16 hotels.

**What works now (frontend):**
- Employee ID + Password are real typeable inputs (accept text like `emp-001` and
  any letters/numbers password). On-screen keypad still works for numbers.
- POST `/api/employees/punch` is wired and the request schema already accepts
  arbitrary strings (`employeeId: string.min(1)`, `pin: string.min(1)`).

**The gap (needs backend):**
- Punch auth verifies against the **`employees` DB table** (`pin_hash` / `pin_salt`,
  migration `0018_employee_punches.sql`). **That table is empty — nothing seeds it.**
- Meanwhile the visible roster (`/api/employees`, e.g. Priya Nair `emp-001`) comes
  from **static `@hos/shared` data** (`getEmployeesForHotel`), NOT the DB table.
- Result: punch can never succeed today — `verifyEmployee()` finds no rows.

**What's needed:**
1. Seed the `employees` table from the static roster (employee_id, full_name,
   department, hotel_id) with a known default password per employee, hashed via the
   existing `newPinHash()` in `apps/web/src/lib/server/employee-punches.ts`.
   - e.g. a `db/seed-employees.mjs` or extend `db/seed.mjs`.
2. Decide the canonical employee source: ideally make `/api/employees` read the DB
   `employees` table too, so the roster and punch auth are the same data (today they
   diverge — static roster vs DB punch table).
3. Confirm the password rule with ops (the user said "password can be anything,
   number or name") — store per-employee, let them be reset.

**Files involved:** `db/migrations/0018_employee_punches.sql`,
`apps/web/src/lib/server/employee-punches.ts` (`verifyEmployee`, `newPinHash`,
`recordPunch`), `apps/web/src/app/api/employees/punch/route.ts`,
`packages/shared/src/data/employees.ts` (static roster).

---

## 3. Super Admin model — multi-tier admin + payments (BIG, needs backend)

**Ask (Sravan):** `/web/admin` is the management company console (HOS Management).
Reframe from a single "admin" to a **Super Admin** tier:
- Super Admin (StayOps / company owner) can **create hotels**, **create + assign an
  admin to each hotel**, **manage roles**, and **manage payments/billing**.
- There will be **many admins** (one or more per hotel), below the Super Admin.

**What works now (frontend):**
- `/web/admin` rebranded to the **Super Admin console**, scoped to the real
  `tenants` row (HOS Management) via new `GET /api/admin/company` (returns name,
  plan, hotels/users/regions/states/brands/rooms rollup — all live DB).
- Landing shows company header + tool cards. **Hotels / Roles & Users / System
  Health / Uploads / Email Ingestion** are live (read + ingestion).
- **Hotel Admins** and **Payments** cards are present but shown as **disabled
  "Soon"** (no dead links) — they need the backend below.

**The gap (needs backend) — currently the admin is READ-ONLY + single shared-secret:**
1. **Admin accounts + tiers.** Today admin is gated by one shared secret
   (`ADMIN_SHARED_SECRET`, `lib/admin-guard.ts`) — there's no concept of individual
   admins or a super-admin. Need:
   - An `admins` (or reuse `users` with role `super_admin` / `hotel_admin`) model with
     real auth (the project notes Clerk as the planned auth layer).
   - `hotel_admins` join (which admin manages which hotel) for per-hotel scoping.
   - Route guards that distinguish super-admin vs hotel-admin.
2. **Write APIs (none exist yet — Hotels/Users screens are read-only):**
   - Create/edit/deactivate **hotel** (`POST/PATCH /api/admin/hotels`).
   - Create **hotel admin** + assign to hotel (`POST /api/admin/admins`).
   - Manage **roles** (assign role/scope to a user) — write side of `/api/admin/users`.
   - **User invite flow (login + reset-password links).** When a user is created,
     the Add-user modal now shows a confirmation with a **login link** and a
     **reset-password link** (copyable) + an "Email invite" mailto button.
     These are **demo placeholders** (`/login?invite=inv_<id>`,
     `/reset-password?token=inv_<id>`, token derived from the user id in
     `UserFormModal.tsx`). Backend needed: secure single-use invite/reset tokens
     (expiring), the `/login` + `/reset-password` routes that consume them, and a
     real **email send** (transactional provider) so the invite is delivered
     automatically instead of copy/paste. Pairs with the Clerk auth layer above.
3. **Payments.** No billing system exists. Need a provider (Stripe?), a
   `subscriptions`/`invoices` model, per-hotel plan, and `/api/admin/payments`.
   The Sanjay *Accounting* module is hotel-bookkeeping, NOT company billing — separate.

**Files involved:** `apps/web/src/app/web/admin/page.tsx` (Super Admin landing),
`apps/web/src/app/api/admin/company/route.ts` (new, live), `lib/admin-guard.ts`
(shared-secret gate to replace), `apps/web/src/app/api/admin/{hotels,users}/route.ts`
(read-only today — add write), `db/migrations/0001_init.sql` (`tenants`, `users`,
`hotels`, `regions`).

**Status:** Frontend reframed + company API live. Multi-tier auth, write APIs, and
payments are net-new backend — flagged, not faked.

---

## 2. Desktop app for Front Desk (Windows + Mac) — NEW, needs build/packaging setup

**Ask:** Package the Front Desk experience (`/web/desk/[hotelCode]`) as an installable
desktop app for Windows and Mac, deployed to all front-desk computers. The "More"
page should offer/anchor this.

**Notes / options for Charan:**
- This is a **packaging/distribution** task, not a UI change — the web app already runs.
- Recommended: **Tauri** or **Electron** wrapping the existing Next.js front-desk
  routes (kiosk-style window, locked to `/web/desk/<hotelCode>/home`).
  - Tauri = much smaller installer, native webview, code-sign per-OS.
  - Electron = heavier but simpler if team already knows it.
- Needs: code signing certs (Apple Developer + Windows Authenticode), auto-update
  channel, per-hotel config (which `hotelCode` the kiosk is pinned to), and a build
  pipeline producing `.dmg` (Mac) + `.exe`/`.msi` (Windows).
- Decide hosting: does the desktop app point at the deployed web URL, or bundle the
  Next.js server locally? (Kiosk pointing at deployed URL is simplest.)
- The "More → install desktop app" entry point can be a simple download link once
  the installers exist.

**Status:** Not started — out of scope for a frontend flow pass. Flagged for planning.

---

## Pre-existing gaps (from prior session, still open)

- **Housekeeping room assignments** (Emma) — in-session only; no `room_assignments` table/API.
- **Audit pass/fail results** (Sydney) — completion is in-session; failed-item *tickets*
  do persist via `/api/ops/tickets`, but the audit result itself isn't stored. No
  `audit_results` table.
- **Preventive PPM schedule** (Sydney) — client-generated calendar; no schedule table.
- **Shift schedule** (Rishab/Emma) — scheduling board state is in-session; no
  schedule-persistence table.
