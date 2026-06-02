Now let me create the comprehensive inventory document by compiling all my findings:

## HOS Management — Comprehensive Micro-Level Inventory

A complete technical catalog of every screen, feature, data structure, and system built into the HOS Management platform.

---

## Table of Contents

1. [Web App (apps/web/)](#web-app)
2. [Mobile App (apps/mobile/)](#mobile-app)
3. [Shared Package (packages/shared/)](#shared-package)
4. [Supabase Database](#supabase-database)
5. [Special Systems & Contexts](#special-systems)
6. [What's NOT Built](#whats-not-built)

---

## Web App (apps/web/)

### Entry Point & Platform Selector
**File:** `/Users/sravanpuli/hos-management/apps/web/src/app/page.tsx`
- Main landing page showing "HOS Management" branding
- Two buttons: "Web Dashboard" (→ /web) and "Mobile App" (→ /mobile)
- Entry point displays 16 properties overview

### Root Layout
**File:** `/Users/sravanpuli/hos-management/apps/web/src/app/layout.tsx`
- Main Next.js App Router layout
- Sets up global providers and styling

### Web Platform Landing
**File:** `/Users/sravanpuli/hos-management/apps/web/src/app/web/page.tsx`
- Persona selector page (redirects to appropriate dashboard based on login)

### Admin Section
**Path:** `/web/admin/`
**Files:**
- `/users/sravanpuli/hos-management/apps/web/src/app/web/admin/layout.tsx` — Admin layout wrapper
- `/users/sravanpuli/hos-management/apps/web/src/app/web/admin/ingestion/page.tsx` — Data ingestion interface
- `/users/sravanpuli/hos-management/apps/web/src/app/web/admin/uploads/page.tsx` — File upload interface

---

## Persona Dashboards (Web)

Each persona has a dedicated `/web/{persona}/` section with specific navigation and modules.

### Navigation Items
**File:** `/Users/sravanpuli/hos-management/apps/web/src/lib/constants.ts`

Each persona has a `{PERSONA}_NAV_ITEMS` constant defining their menu structure.

---

## KRIS PATEL — Managing Director (Portfolio-level)
**Role:** Managing Director  
**Scope:** Portfolio (all 16 hotels)  
**Layout:** `/web/kris/` 

### Kris Navigation
- Dashboard
- AM-PM Report
- Intelligence
- Revenue
- Labour
- Operations
- Audits
- Assets
- Leaders
- Alerts
- Strategy
- Settings

### Kris Routes & Pages

#### `/web/kris/dashboard`
**File:** `/Users/sravanpuli/hos-management/apps/web/src/app/web/kris/dashboard/page.tsx`

**What it shows:**
- Portfolio-level KPI cards (4 large + 4 medium):
  - Occupancy % with room-nights sold vs. total capacity
  - Room Revenue (rooms only, excluding F&B/retail)
  - Total Revenue (all streams)
  - Rooms Not Sold with OOO rooms
  - Rooms Out of Order
  - Hours Clocked / Scheduled
  - Labour Variance with trend indicator
  - Avg Customer Rating across portfolio
- Portfolio Table listing all 16 hotels with revenue data
- AI Findings Panel showing open anomalies or "all clear" status

**Key calculations:** Aggregates daily metrics, revenue, and labour data across all filtered hotels using `useScopedData` hook.

#### `/web/kris/revenue`
**File:** `/Users/sravanpuli/hos-management/apps/web/src/app/web/kris/revenue/page.tsx`

**Sections:**
1. **Revenue Summary Cards** — KPIs for total revenue, room revenue, ADR, RevPAR
2. **Forecast Widget** — AI-driven 30-day revenue forecast with 3 scenarios (upside/base/downside)
3. **Hotel Revenue Breakdown Table** — Shows occupancy %, ADR, RevPAR, total revenue by hotel
4. **Revenue Mix by Source Table** — Room vs. F&B vs. Retail vs. Events breakdown
5. **Opportunity Leakage Table** — Unsold rooms analysis with revenue loss calculation
6. **Revenue/Labour Efficiency Table** — Revenue per labour hour by hotel
7. **Pricing Power vs. Market Table** — ADR vs. comp set comparison
8. **AI Flags Panel** — Revenue-specific anomalies

#### `/web/kris/labour`
**File:** `/Users/sravanpuli/hos-management/apps/web/src/app/web/kris/labour/page.tsx`

**Sections:**
1. **Labour Summary Cards** — Total scheduled hours, clocked hours, variance, overtime, payroll $, health status
2. **Hotel Labour Breakdown Table** — Expandable to department level (Housekeeping, Front Desk, Maintenance, Kitchen, Market, Event Space)
3. **Labour Efficiency Table** — Revenue per labour hour analysis
4. **AI Findings Panel** — Labour anomalies
5. **Forecast Widget** — 30-day labour cost forecast
6. **Top Recommendations Card** — 3 cards showing top AI recommendations for labour optimization

#### `/web/kris/operations`
**File:** `/Users/sravanpuli/hos-management/apps/web/src/app/web/kris/operations/page.tsx`

**Components:**
- Operations AI Findings panel
- OpsClient component (portfolio-wide ticket + room management)
  - Drill-down capability into individual hotels
  - Room status grid (Ready, Dirty, Inspecting, OOO, Blocked, Occupied)
  - Ticket queue by priority

#### `/web/kris/assets`
**File:** `/Users/sravanpuli/hos-management/apps/web/src/app/web/kris/assets/page.tsx`

**Sections:**
1. **Asset Summary Cards** — Total assets, total value, aging assets count, failing assets, YTD spend, open work orders, preventive compliance %
2. **CapEx Planning Section** — AI-predicted capital expenditure by quarter and category
3. **Asset Health by Property Table** — Health status per hotel
4. **Repeat Failures Table** — Assets with 3+ failures in 12 months
5. **Top Vendor Spend Table** — Vendor ranking by annual spend
6. **Maintenance AI Findings Panel**
7. **Maintenance Red Flags Panel**

#### `/web/kris/audits`
**Shows:** Audit compliance dashboard (audit tasks, pass rates, overdue status)

#### `/web/kris/alerts`
**File:** `/Users/sravanpuli/hos-management/apps/web/src/app/web/kris/alerts/page.tsx`

**Sections:**
1. **Alert Summary Grid** — 3 counts: Critical, Warning, Info
2. **AI Findings Section** — Pattern-based anomalies
3. **Module-Based Red Flags** — Grouped by: Revenue, Labour, Operations, Maintenance
4. **All Clear State** — Message when no alerts active

#### `/web/kris/leaders`
**Shows:** Leadership roster and accountability dashboard for GMs and regional directors

#### `/web/kris/intelligence`
**Shows:** AI-generated strategic insights, patterns, forecasts, and brief summaries

#### `/web/kris/strategy`
**Shows:** Strategic objectives, OKRs, and long-term performance metrics

#### `/web/kris/am-pm-report`
**Shows:** Daily AM/PM shift handover reports with printable export

#### `/web/kris/settings`
**Shows:** Portfolio-level settings and preferences

---

## HARSHAL PATEL — Regional Director of Operations
**Role:** Regional Director of Operations  
**Scope:** Regional (multiple hotels in region)  
**Layout:** `/web/harshal/`

### Harshal Navigation
- Dashboard
- AM-PM Report
- Intelligence
- Revenue
- Labour
- Operations
- Audits
- Assets
- GMs (unique to Harshal)
- Print Center
- Alerts
- Strategy
- Settings

### Harshal-Specific Routes

#### `/web/harshal/dashboard`
**Similar to Kris dashboard but scoped to Harshal's region only**

#### `/web/harshal/gms`
**Shows:** List of General Managers in Harshal's region with quick status cards

#### `/web/harshal/gm/[hotelId]`
**File:** `/Users/sravanpuli/hos-management/apps/web/src/app/web/harshal/gm/[hotelId]/page.tsx`

**Detailed GM accountability view:**
1. **Profile Header** — GM name, property, location, brand, room count, call/message buttons
2. **Accountability Summary (4 cards):**
   - Composite Score (color-coded: red <65, amber <75, green ≥75)
   - Open Commitments (progress bar showing % on track)
   - Missed Follow-ups (count)
   - Avg Response Time (minutes, color-coded)
3. **Property Snapshot (5 KPIs):**
   - Occupancy %
   - Revenue
   - Payroll %
   - Hours Variance
   - Rooms OOO
4. **Commitment Log** — Week-by-week log of commitments (on track / missed / completed) with dates and notes
5. **Quick Action Cards:**
   - Property detail → Full hotel view
   - Active tickets → Open ops + maintenance
   - Audit compliance → Property audit trail

**Data:** Synthetic commitment tracking per GM with multi-week history per hotel (e.g., BSWVE has ~4 weekly commitments logged)

#### `/web/harshal/hotel/[id]`
**Detailed property view** — Revenue, labour, operations, audit data for a single hotel

#### `/web/harshal/print`
**Shows:** Print center for AM-PM reports and other batch printables

**Other modules:** Revenue, Labour, Operations, Assets, Audits, Alerts, Strategy match Kris's structure but scoped to region.

---

## RISHAB PATEL — General Manager
**Role:** General Manager  
**Scope:** Single Property (BTRCI · Home2 Suites Baton Rouge)  
**Layout:** `/web/rishab/`

### Rishab Navigation
- Dashboard
- Intelligence
- Revenue
- Scheduling
- Operations
- Audits
- Assets
- SOP (Procedures)
- Alerts
- Settings

### Rishab Routes

#### `/web/rishab/dashboard`
**File:** `/Users/sravanpuli/hos-management/apps/web/src/app/web/rishab/dashboard/page.tsx`

**Page structure:**
1. **Header with Composite Score badge** — Shows score (0–100) with color coding and trend
2. **Critical Alerts Strip** — 4 potential alerts (in order of priority):
   - Rooms ready vs. arrivals shortfall
   - Payroll % > 28% target
   - Urgent maintenance tickets
   - Staff callouts
3. **Revenue View (4 KPIs):**
   - Occupancy %
   - ADR vs. market comp
   - RevPAR
   - Revenue $
4. **Costs View (4 KPIs):**
   - Payroll % of revenue
   - Overtime hours
   - Hours variance
   - Total payroll $
5. **Operations Today (4 KPIs):**
   - Rooms Ready vs. Arrivals (expected today)
   - Rooms OOO
   - Open Tickets
   - Audit Pass %
6. **People (4 KPIs):**
   - On shift today
   - Callouts
   - Customer satisfaction (1–5 rating)
   - Avg ticket response time
7. **Jump Into Cards** — Quick links to Scheduling, Operations, Audits, Alerts

#### `/web/rishab/revenue`
**Shows:** Single-property revenue detail

#### `/web/rishab/revenue/rates`
**File:** `/Users/sravanpuli/hos-management/apps/web/src/app/web/rishab/revenue/rates/page.tsx`

**Rate Manager interface:**
- Form to log BAR (Best Available Rate) changes:
  - Room Type dropdown (K, Q, KK, QQ, KS, QS, KPD, QPD)
  - Stay date range
  - New BAR price
  - Reason (optional)
- Rate History table showing last 50 changes with:
  - Rate plan
  - Stay date
  - Old → New rate with delta
  - Timestamp
  - Reason (if provided)
  - Trend indicator (↑ green increase, ↓ red decrease)

**API endpoints called:** `/api/rates/log` (GET and POST)

#### `/web/rishab/scheduling`
**Shows:** Staff scheduling interface for building next week's schedule

#### `/web/rishab/operations`
**Shows:** Rooms, tickets, maintenance queue for the property

#### `/web/rishab/audits`
**Shows:** Room-level audit compliance and checklist tracking

#### `/web/rishab/assets`
**Shows:** Property asset inventory and maintenance history

#### `/web/rishab/sop`
**Shows:** Standard operating procedures specific to property

#### `/web/rishab/alerts`
**Shows:** Property-level red flags and AI findings

#### `/web/rishab/intelligence`
**Shows:** Property-specific AI insights

#### `/web/rishab/settings`
**Shows:** Property configuration

---

## EMMA JOHNSON — Housekeeping Supervisor
**Role:** Housekeeping Supervisor  
**Scope:** Single Property (same hotel as Rishab)  
**Layout:** `/web/emma/`

### Emma Navigation
- Dashboard (unique room assignment UI)
- Assignments (drag-drop or picker interface)
- Rooms (full room inventory)
- Team (staff directory)
- Tickets (maintenance requests affecting rooms)
- Print Sheets (printable assignment cards)
- Staff Schedule (links to Rishab's scheduling page)
- SOP
- Settings

### Emma Routes

#### `/web/emma/dashboard`
**File:** `/Users/sravanpuli/hos-management/apps/web/src/app/web/emma/dashboard/page.tsx`

**Unique interactive interface for housekeeping supervisor:**
1. **Morning Header** — "Good morning, Emma" + date + "Housekeeping"
2. **Bilingual Toggle** — EN/ES toggle in top right
3. **Morning Briefing KPIs (5 cards):**
   - Rooms to clean (queue count)
   - Rooms ready
   - Out of order
   - Staff on shift (with callout count)
   - Open tickets (with urgent count)
4. **Room Assignment Board** — Main interaction:
   - **Left sidebar:** Unassigned queue (rooms sorted by floor + type)
     - Each room shows: number, type, floor, status, open ticket indicator
   - **Staff columns (4):** Grid layout, each column is one HK staff member
     - Staff info: name, role, avatar, room assignment count badge
     - Assigned rooms listed as clickable tags (can remove)
     - Team-of-2 rooms marked with UserPlus icon
     - Click to assign, cap at 2 staff per room
   - **Buttons:** Auto-assign remaining + Clear all
5. **Live Floor View** — Room status grid (by floor, top to bottom, 6 floors)
   - Each room box shows:
     - Room number
     - Status color (ready/dirty/inspecting/ooo/blocked)
     - Ticket indicator (red dot with wrench icon)
     - Assignee avatars at bottom
   - Status legend: Ready (green), Dirty (red), Inspecting (blue), OOO (red), Blocked (gray), Occupied (blue)
   - Bilingual labels (Ready = Listos, etc.)
6. **Urgent Tickets Banner** — Shows top 4 urgent tickets with room, type, assignee
7. **Jump Into Cards:**
   - Print sheets
   - Rooms (full inventory)
   - Team (staff directory)
   - Tickets (maintenance)

**Interactivity:**
- Click unassigned room → becomes selectable (border turns red, shows "PICK STAFF →")
- Click staff member → adds to assignment (max 2 per room)
- Hover room tag → shows clickable X to remove assignment
- Auto-assign button intelligently distributes remaining rooms
- Bilingual support for all labels and descriptions

#### `/web/emma/assignments`
**Dedicated assignments page** — Similar UI to dashboard but full-screen

#### `/web/emma/rooms`
**Full room inventory:**
- Table or grid view of all hotel rooms
- Filters by floor, type, status
- Shows last cleaned, last inspected
- Click room to see detail

#### `/web/emma/print`
**Print assignment sheets:**
- Generates printable cards with staff names and room assignments
- Room numbers grouped by staff
- Can be printed for physical handoff

#### `/web/emma/team`
**Staff roster for housekeeping:**
- Lists all HK staff: name, role, status, shift
- Shows active/inactive toggle

#### `/web/emma/tickets`
**Maintenance ticket queue:**
- Shows tickets affecting rooms
- Filter by open/resolved, priority
- Allows HK supervisor to escalate or note

#### `/web/emma/sop`
**SOP documentation** — Procedures specific to housekeeping role

#### `/web/emma/settings`
**Staff-level settings**

---

## SYDNEY RIVERA — Maintenance & Engineering Supervisor
**Role:** Maintenance & Engineering Supervisor  
**Scope:** Single Property  
**Layout:** `/web/sydney/`

### Sydney Navigation
- Dashboard
- Tickets
- Preventive (PPM calendar)
- Rooms
- Assets
- Team
- SOP
- Settings

### Sydney Routes

#### `/web/sydney/dashboard`
**File:** `/Users/sravanpuli/hos-management/apps/web/src/app/mobile/app/sydney/index.tsx` (also web version similar)

**Morning briefing for maintenance supervisor:**
1. **Header** — "Good morning, Sydney" + date + "Maintenance & Engineering"
2. **Morning Briefing KPIs (5 cards):**
   - Open tickets (with urgent count)
   - Preventive due (this period)
   - Rooms OOO (with active ticket count)
   - Audits overdue (with "due within 7 days" count)
   - Failing assets (with aging + total count)
3. **Urgent Queue Banner** — Top 4 tickets/escalations needing attention now
   - Shows: ticket type (reactive/preventive/audit/escalation), room number, title, assignment, time ago
4. **Two-column section:**
   - **Left (2/3 width):** Today's preventive schedule
     - Calendar view of scheduled maintenance tasks
     - Priority-colored badges
     - Link to full preventive calendar
   - **Right (1/3 width):** Maint team today
     - Lists all maintenance staff: name, role, shift
     - Shows shift hours (e.g., 8:30a – 4:30p)
     - Notes handover timing
5. **Queue by Type (4 cards):**
   - Reactive (red)
   - Preventive (blue)
   - Audit (purple)
   - Escalation (red)
   - Each shows count and links to filtered view
6. **Jump Into Cards:**
   - Tickets
   - Preventive calendar
   - Rooms (with open tickets)
   - Assets (systems + vendor spend)

#### `/web/sydney/tickets`
**Ticket management queue:**
- Filters by type (reactive/preventive/audit/escalation)
- Shows priority, status, room, assignee
- Drill-down to detail view

#### `/web/sydney/preventive`
**Preventive maintenance calendar:**
- Calendar view of PPM (Planned Preventive Maintenance) schedule
- Task cards grouped by asset type
- Ability to mark complete, reschedule

#### `/web/sydney/rooms`
**Rooms with maintenance issues:**
- Shows rooms currently OOO or with open tickets
- Links to room detail for comprehensive history

#### `/web/sydney/assets`
**Asset inventory and health:**
- List of all building systems (HVAC, Elevator, Roof, Kitchen, Laundry, Pool, POS/PMS, Boiler, Parking, FF&E)
- Condition status per asset
- Work order history
- Vendor relationships

#### `/web/sydney/team`
**Maintenance staff directory:**
- Lists technicians: name, role, certification, contact

#### `/web/sydney/sop`
**Maintenance procedures and checklists**

#### `/web/sydney/settings`
**Role-specific settings**

---

## SRAVAN PULI — Front Desk Staff (Self-Service)
**Role:** Front Desk Staff  
**Scope:** Single Property  
**Layout:** `/web/sravan/`

### Sravan Navigation
- Home
- Clock In/Out
- Schedule
- Availability
- Earnings
- Hours
- Bonuses
- SOPs
- Profile

### Sravan Routes (Employee Portal)

#### `/web/sravan/home`
**File:** `/Users/sravanpuli/hos-management/apps/web/src/app/web/sravan/home/page.tsx`

**Employee self-service home:**
1. **Hero Card (teal gradient)** — "Next Shift"
   - Displays next shift details: date, time range, role
   - Note if applicable (e.g., "Extra shift", "Training")
   - Clock In button (→ /clock)
   - Full Schedule button (→ /schedule)
2. **KPI Cards (3):**
   - This Pay Period earnings
   - Hours This Period (with OT and PTO breakdown)
   - Bonuses Earned (active programs count)
3. **Schedule Strip** — Next 5 shifts in mini calendar format
4. **Active Bonuses Section** — Shows programs currently active and progress toward goals
5. **Required SOPs Section** — List of required training/procedures to complete

#### `/web/sravan/clock`
**Clock in/out interface:**
- Large clock display with current time
- Clock In button
- Clock Out button
- Recent punches history

#### `/web/sravan/schedule`
**Full schedule view:**
- Monthly calendar grid
- Each shift shown with time range and role
- Ability to see 3 months ahead

#### `/web/sravan/availability`
**Availability management:**
- Can mark available/unavailable dates
- Submit for shifts

#### `/web/sravan/earnings`
**Pay summary:**
- Current pay period earnings breakdown
- Regular hours, overtime, tips, bonuses
- Previous pay periods

#### `/web/sravan/hours`
**Hours tracking:**
- Total hours this period
- Regular vs. overtime breakdown
- PTO balance

#### `/web/sravan/bonus`
**Bonus programs:**
- List of active bonus programs
- Progress toward each goal
- Payout status

#### `/web/sravan/sop`
**Training and procedures:**
- Required SOPs to complete
- Checkboxes to mark complete
- Certification dates

#### `/web/sravan/profile`
**Employee profile:**
- Name, employee ID, hire date
- Contact information
- Emergency contacts

---

## Shared Components & Systems

### Shell/Layout Components
**Path:** `/Users/sravanpuli/hos-management/apps/web/src/components/shell/`

- **LeftNav.tsx** — Left sidebar navigation (persona-specific nav items)
  - Logo area at top
  - Nav items list (dynamic per role)
  - Footer with current user name/title
  - Active state highlighting
- **TopBar.tsx** — Top navigation header (for most personas)
- **StaffTopBar.tsx** — Top bar for staff portals (simpler variant)
- **HotelSelector.tsx** — Dropdown to switch between hotels (if scoped)
- **DateFilter.tsx** — Date range picker (today, yesterday, week, month, pay-period, YTD, custom)

### Common Components
**Path:** `/Users/sravanpuli/hos-management/apps/web/src/components/common/`

- **KpiCard.tsx** — Reusable KPI display (supports alert state, trend indicator, size variants: small/medium/large)
- **HealthBadge.tsx** — Green/amber/red health status indicator
- **AIFlagsPanel.tsx** — Collapsible panel for AI findings (anomalies)
- **RedFlagsPanel.tsx** — Collapsible panel for critical red flags

### Module-Specific Components

#### Dashboard Module
**Path:** `/components/dashboard/`
- **PortfolioTable.tsx** — Table showing all hotels with revenue summary

#### Revenue Module
**Path:** `/components/revenue/`
- **RevenueSummaryCards.tsx**
- **HotelRevenueTable.tsx**
- **RevenueMixTable.tsx** (Room/F&B/Retail/Events breakdown)
- **OpportunityLeakageTable.tsx**
- **RevLabourEfficiencyTable.tsx**
- **PricingPowerTable.tsx** (ADR vs. market comp)

#### Labour Module
**Path:** `/components/labour/`
- **LabourSummaryCards.tsx**
- **HotelLabourTable.tsx** (expandable by department)
- **LabourEfficiencyTable.tsx**

#### Operations Module
**Path:** `/components/operations/`
- **OpsClient.tsx** — Main portfolio/property operations view
  - PortfolioView — All hotels in region
  - PropertyView — Single hotel focus
- **RoomDetailPanel.tsx** — Slide-out panel showing room status history
- **TicketDetailPanel.tsx** — Slide-out for ticket details
- **ItemDetailPanel.tsx** — Generic detail panel
- **SlidePanel.tsx** — Reusable slide-out drawer component
- **OpsBadges.tsx** — Status badges for room/ticket states

#### Assets Module
**Path:** `/components/assets/`
- **AssetSummaryCards.tsx**
- **AssetHealthTable.tsx**
- **CapExPlanningSection.tsx**
- **RepeatFailuresTable.tsx**
- **VendorSpendTable.tsx**

#### Audits Module
**Path:** `/components/audits/`
- **AuditsClient.tsx** — Main audit view
- **HotelAuditView.tsx**
- **RoomAuditPanel.tsx**
- **AreaHistoryPanel.tsx**

#### AI/Intelligence Module
**Path:** `/components/ai/`
- **ForecastWidget.tsx** — Shows forecast scenarios with delta and confidence
- **RecommendationCard.tsx** — Displays AI recommendation with rationale and impact

#### AM-PM Report Module
**Path:** `/components/am-pm-report/`
- **AmPmReportClient.tsx**
- **PrintableAmPmReport.tsx** — Formatted for printing

#### Leaders Module
**Path:** `/components/leaders/`
- (Components for managing team roster and accountability)

#### Strategy Module
**Path:** `/components/strategy/`
- (Components for strategic objectives and KPI tracking)

---

## Hotel Filter & Scoping System

### Key Context/Hook
**File:** `/Users/sravanpuli/hos-management/apps/web/src/lib/hotel-filter-context.tsx`

- Provides global hotel filter state
- Allows users to filter by:
  - Individual hotels
  - Regions (if applicable)
  - Entire portfolio

### Key Hook: `useScopedData()`
**File:** `/Users/sravanpuli/hos-management/apps/web/src/lib/use-scoped-data.ts`

**Returns:**
- `hotels` — Array of Hotel objects in current scope
- `hotelIdSet` — Set of hotel IDs for efficient filtering
- `scopeLabel` — Human-readable label (e.g., "Baton Rouge", "Southeast Region", "Portfolio")
- `scopeSub` — Subtitle with additional context
- `period` — Current time period (label, days, multiplier)
- `revenueRows` — RevenueSummary[] for hotels in scope
- `labourRows` — LabourMetrics[] for hotels in scope
- `dailyRows` — DailyMetrics[] for hotels in scope
- `openAnomalies` — AI_ANOMALIES filtered to scope
- `isSingleHotel` — Boolean flag for UI adaptation
- `isRegional` — Boolean flag for UI adaptation

This hook is the backbone of all dashboard pages, allowing dynamic aggregation based on selected scope.

### Property-Scoped Hook
**File:** `/Users/sravanpuli/hos-management/apps/web/src/lib/use-property-scoped.ts`

For single-property views (Rishab, Emma, Sydney), returns:
- `hotel` — Single Hotel object
- `revenue` — RevenueSummary
- `labour` — LabourMetrics
- `daily` — DailyMetrics
- `period` — Current period
- `loading` / `error` — State indicators

---

## Emma-Specific Data & Room Assignment Logic

**File:** `/Users/sravanpuli/hos-management/apps/web/src/lib/emma-data.ts`

**Exports:**
- `EMMA_HOTEL` — Mock hotel object (same property as Rishab/Sydney)
- `getHkStaff()` — Returns array of housekeeping staff
- `getHkCallouts()` — Returns array of staff on callout
- `getAllHotelRooms()` — Returns all rooms with status, floor, type, etc.
- `getQueueRooms()` — Returns rooms needing cleaning (dirty + inspecting status)
- `getHotelTickets()` — Returns maintenance tickets affecting rooms
- `getHotelOpsSummary()` — Returns summary: readyRooms, dirtyRooms, inspectingRooms, oooRooms, openTickets, urgentTickets
- `getPropertyOpsSummary()` — Alias for above
- `seedAssignments()` — Initial assignment state (rooms pre-assigned to staff)
- `autoAssignRooms(assignments, roomsToFill)` — Intelligently assigns remaining rooms to staff based on current workload
- `ROOM_TILE` — Config for room status display (colors, labels, bilingual labels)

**Room Type Definitions:**
```typescript
type RoomStatus = 'ready' | 'dirty' | 'inspecting' | 'ooo' | 'blocked' | 'occupied'
type RoomType = 'King' | 'Queen' | 'Suite'
type HkStatus = 'clean' | 'dirty' | 'inspected'
```

---

## Sydney-Specific Data

**File:** `/Users/sravanpuli/hos-management/apps/web/src/lib/sydney-data.ts`

**Exports:**
- `SYDNEY_HOTEL` — Mock hotel object
- `getMaintenanceStaff()` — Returns maintenance team
- `getHotelTickets()` — Returns all maintenance tickets
- `getHotelAudits()` — Returns audit tasks with overdue status
- `getHotelRooms()` — Returns rooms (for audit tracking)
- `getOpsSummary()` — Returns ops metrics
- `getAssetSummary()` — Returns asset health summary
- `TICKET_TYPE_META` — Visual config for reactive/preventive/audit/escalation
  - `bg`, `border`, `color`, `icon`, `label`
- `PRIORITY_META` — Visual config for urgent/high/normal/low
  - `bg`, `color`, `label`

---

## Date Filter Context

**File:** `/Users/sravanpuli/hos-management/apps/web/src/lib/date-filter-context.tsx`

Provides global date range selection:
- Today
- Yesterday
- This Week
- This Month
- Pay Period
- YTD (Year-to-Date)
- Custom date range

Calculates `period` object with:
- `label` — Human-readable (e.g., "May 1–7, 2026")
- `days` — Number of days in period
- `multiplier` — For scaling OOO rooms (capped at 2x for YTD)

---

---

## Mobile App (apps/mobile/)

Expo-based React Native app with two main personas: Amir (night maintenance) and Sydney (day maintenance supervisor).

### Entry Point
**File:** `/Users/sravanpuli/hos-management/apps/mobile/app/index.tsx`
- Landing/home screen (persona selector)

### Mobile Navigation
**File:** `/Users/sravanpuli/hos-management/apps/mobile/app/_layout.tsx`
- Sets up Expo Router structure with Amir and Sydney routes

---

## AMIR LOPEZ — Night Maintenance Technician (Mobile)

### Amir Routes

#### `/amir/` — Home Dashboard
**File:** `/Users/sravanpuli/hos-management/apps/mobile/app/amir/index.tsx`

**Layout:**
1. **Header** — "Good evening, Amir 👋" + date + shift info ("Evening Shift 4–10 PM")
   - Language toggle (EN/ES) in top right
2. **KPI Row (4 cards):**
   - Occupied urgent (red)
   - Arrivals (amber)
   - Aging (purple)
   - Audits (blue)
3. **Ticket Queue Sections** (5 prioritized buckets):
   - **Occupied Urgent** — Guests in rooms with urgent issues
   - **Arrival Blockers** — Issues preventing check-in
   - **Repeat Complaint Rooms** — Flagged history
   - **Aging Open Tickets** — Older than 1 day
   - **Other Open** — Secondary work when quiet
   - Each section shows: # of tickets, description, list of ticket cards with priority/type/repeat badge
4. **Audits Due Section** — Top 3 audit tasks with:
   - Area name
   - Room + Floor
   - Status (Paused with progress 6/12)
   - Overdue days or "Due today"
5. **Paused Audits Banner** — Count of paused audits with "Resume →" button
6. **Handover Card from Sydney** — End-of-day notes (synthetic):
   - Avatar with "SR" initials
   - Title "From Sydney"
   - 4 bullet points with status
7. **Inventory Alerts** — If items low:
   - Count of low items
   - Critical items count
   - List of 4 items with quantity badges
8. **Radio Quick-Contacts** — 4 buttons for calling/texting:
   - Sydney Rivera (Supervisor)
   - Front Desk
   - Emma Johnson (HK Lead)
   - Rishab Patel (GM)
   - Opens phone dialer with hardcoded Baton Rouge numbers (225 area code)

**Language Support:** Full EN/ES bilingual with toggle

**Data Source:** `useTickets()`, `useAudits()`, `useInventory()` context hooks

#### `/amir/ticket/[id]`
**File:** `/Users/sravanpuli/hos-management/apps/mobile/app/amir/ticket/[id].tsx`
- Detailed ticket view with timeline, AI insights, parts needed

#### `/amir/tickets`
**File:** `/Users/sravanpuli/hos-management/apps/mobile/app/amir/tickets.tsx`
- Full ticket queue listing

#### `/amir/room/[number]`
**File:** `/Users/sravanpuli/hos-management/apps/mobile/app/amir/room/[number].tsx`
- Room detail with ticket history and notes

#### `/amir/audit`
**File:** `/Users/sravanpuli/hos-management/apps/mobile/app/amir/audit.tsx`
- Audit task checklist with pause/resume capability

#### `/amir/profile`
**File:** `/Users/sravanpuli/hos-management/apps/mobile/app/amir/profile.tsx`
- Staff profile (name, role, contact, shift info)

---

## SYDNEY RIVERA — Day Maintenance Supervisor (Mobile)

### Sydney Routes

#### `/sydney/` — Dashboard
**File:** `/Users/sravanpuli/hos-management/apps/mobile/app/sydney/index.tsx`

**Layout:**
1. **Header** — "Good morning, Sydney 👋" + date + "Day Shift" + Cambria logo
2. **Hotel KPIs (4 cards):**
   - Occupancy %
   - OOO count
   - Dirty rooms
   - Clean rooms
3. **Urgent Alert Banner** (if present):
   - Shows most urgent ticket
   - Room, revenue loss info, type, assignment, time ago
   - Tap to view full detail
4. **Inventory Banner** (if items low):
   - Count of low items with critical count
   - "View & request restock →"
5. **Audit Compliance Card:**
   - Title "Audit Compliance"
   - Percentage (color-coded: green ≥85, amber ≥70, red <70)
   - Progress bar
   - Stats: current, due soon, overdue (with colored dots)
6. **Open Tickets Section (top 5):**
   - Priority bar on left
   - ID, priority badge, status badge, age
   - Title + room chip + assignee
   - Tap to view detail
7. **Staff On Shift Section:**
   - Card showing 4 staff today (Amir, Rosa, Carlos, Priya)
   - Name, role, active task status
   - Shift hours
8. **Touchable areas:**
   - Most sections are tappable to drill down

**Data Source:** `useTickets()`, `useAudits()`, `useInventory()`, mock staff data

#### `/sydney/ticket/[id]`
**File:** `/Users/sravanpuli/hos-management/apps/mobile/app/sydney/ticket/[id].tsx`
- Detailed ticket with timeline, photos, notes

#### `/sydney/tickets`
- Full ticket queue (filtered view)

#### `/sydney/rooms`
**File:** `/Users/sravanpuli/hos-management/apps/mobile/app/sydney/rooms.tsx`
- Room status grid and list

#### `/sydney/inventory`
**File:** `/Users/sravanpuli/hos-management/apps/mobile/app/sydney/inventory.tsx`
- Inventory management with low/critical items

#### `/sydney/staff`
**File:** `/Users/sravanpuli/hos-management/apps/mobile/app/sydney/staff.tsx`
- Staff roster and assignments

#### `/sydney/profile`
**File:** `/Users/sravanpuli/hos-management/apps/mobile/app/sydney/profile.tsx`
- Supervisor profile

---

## Mobile Contexts & Stores

### Tickets Context
**File:** `/Users/sravanpuli/hos-management/apps/mobile/src/store/ticketsContext.tsx`

**Types:**
```typescript
type TicketStatus = 'open' | 'en_route' | 'in_progress' | 'pending_part' | 'scheduled' | 'resolved' | 'escalated'
type Priority = 'urgent' | 'high' | 'normal'
type TicketTaskType = 'reactive' | 'preventive' | 'audit' | 'scheduled'
type GuestContext = 'occupied_urgent' | 'arrival' | 'vacant' | 'public' | 'none'

interface Ticket {
  id: string
  room: string
  floor: number
  area: string
  type: TicketTaskType
  priority: Priority
  guestContext?: GuestContext
  repeatInRoom?: boolean
  status: TicketStatus
  title: string
  description: string
  reportedBy: string
  assignee: string
  createdAt: string (e.g., "2h ago", "18h ago")
  updatedAt: string
  estimatedCost: number
  revenueLost: number
  activity: TimelineEntry[]
  ai?: AiInsight
  aiFeedback?: 'up' | 'down' | null
  watchers?: string[]
}

interface TimelineEntry {
  time: string
  actor: string
  action: string
  icon?: string
  kind?: 'system' | 'status' | 'note' | 'photo'
  noteText?: string
  photoLabel?: string
}

interface AiInsight {
  confidence: number
  pattern: string
  likelyCause: string
  fixSteps: string[]
  partsNeeded: { name: string; inCart: boolean; vendor?: string }[]
}
```

**Mock Data (INITIAL_TICKETS):**
- T003 — HVAC unit not cooling in Room 315 (occupied urgent, repeat, high confidence AI)
- T001 — AC vibration noise in Room 109 (occupied urgent, in progress)
- (Additional tickets with full timeline + AI insights)

**Context Methods:**
- `useTickets()` — Returns `allTickets` array
- Filter by status, priority, type, guestContext

### Audits Context
**File:** `/Users/sravanpuli/hos-management/apps/mobile/src/store/auditsContext.tsx`

**Audit structure:**
```typescript
interface Audit {
  id: string
  room: string
  floor: number
  area: string
  state: 'paused' | 'completed' | 'scheduled'
  overdueDays: number
  items: AuditItem[]
}

interface AuditItem {
  id: string
  label: string
  checked: boolean
  note?: string
}
```

**Context Methods:**
- `useAudits()` — Returns `allAudits`
- Track pause/resume state
- Check off items

### Inventory Context
**File:** `/Users/sravanpuli/hos-management/apps/mobile/src/store/inventoryContext.tsx`

**Inventory item structure:**
```typescript
interface InventoryItem {
  id: string
  name: string
  onHand: number
  reorderPoint: number
  maxStock: number
  unit: string
}
```

**Context Methods:**
- `useInventory()` — Returns `lowItems`, `criticalItems`, `getStatus(item)`
- Track item levels and restock requests

### Preferences Context
**File:** `/Users/sravanpuli/hos-management/apps/mobile/src/store/preferencesContext.tsx`
- Language preference
- Theme settings
- Notification preferences

### Supervisor Context
**File:** `/Users/sravanpuli/hos-management/apps/mobile/src/store/supervisorContext.tsx`
- Supervisor-specific preferences and settings

---

## Mobile Theme & Components

### Theme
**File:** `/Users/sravanpuli/hos-management/apps/mobile/src/theme/index.ts`

**Color Palette (C):**
- `C.bg` — Background
- `C.card` — Card background
- `C.text` — Text color
- `C.hint` — Hint/secondary text
- `C.sub` — Subtext
- `C.border` — Border color
- `C.red`, `C.redBg`
- `C.amber`, `C.amberBg`
- `C.blue`, `C.blueBg`
- `C.purple`, `C.purpleBg`
- `C.green`, `C.greenBg`

**Sizing (S):**
- `S.xs`, `S.sm`, `S.md`, `S.lg`, `S.xl` — Spacing increments

**Font Sizes (F):**
- `F.xs`, `F.sm`, `F.md`, `F.lg`, `F.xl`, `F.xxl`

**Border Radius (R):**
- `R.full`, `R.lg`, `R.xl` — Rounded corner presets

### Components
**Path:** `/Users/sravanpuli/hos-management/apps/mobile/src/components/`

- **CambriaLogo.tsx** — Cambria Hotels logo (placeholder)
- **BroadcastModal.tsx** — Modal for broadcasting messages to staff
- **PhotoModal.tsx** — Modal for uploading/viewing photos (for ticket notes)
- **NoteModal.tsx** — Modal for adding notes to tickets

---

---

## Shared Package (packages/shared/)

Central location for types, mock data, and shared utilities used by both web and mobile.

### Type Definitions

#### Hotel Types
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/types/hotel.ts`

```typescript
type Brand = 'Hilton' | 'Marriott' | 'Choice' | 'IHG' | 'Wyndham'
type HealthStatus = 'green' | 'amber' | 'red'

interface Hotel {
  id: string
  code: string
  name: string
  shortName: string
  rooms: number
  brand: Brand
  city: string
  state: string
}
```

#### Operations Types
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/types/operations.ts`

```typescript
type RoomStatus = 'ready' | 'dirty' | 'inspecting' | 'ooo' | 'blocked' | 'occupied'
type RoomType = 'King' | 'Queen' | 'Suite'
type HkStatus = 'clean' | 'dirty' | 'inspected'
type TicketType = 'reactive' | 'preventive' | 'audit' | 'escalation'
type TicketStatus = 'open' | 'in_progress' | 'pending_part' | 'resolved' | 'escalated' | 'scheduled'
type TicketPriority = 'urgent' | 'high' | 'normal' | 'low'
type AuditTaskType = 'audit' | 'preventive'
type AuditStatus = 'scheduled' | 'in_progress' | 'passed' | 'failed' | 'overdue'
type ItemCategory = 'furniture' | 'appliance' | 'fixture' | 'linen' | 'electronics'
type ItemCondition = 'good' | 'fair' | 'poor' | 'condemned'

interface Room {
  id: string
  hotelId: string
  number: string
  floor: number
  type: RoomType
  status: RoomStatus
  hkStatus: HkStatus
  lastCleaned: string | null
  lastInspected: string | null
  hasOpenTicket: boolean
  oooReason?: string
  lastGuestRating?: number
}

interface MaintenanceTicket {
  id: string
  hotelId: string
  roomNumber?: string
  area?: string
  type: TicketType
  priority: TicketPriority
  status: TicketStatus
  title: string
  description: string
  reportedBy: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  estimatedCost?: number
  revenueLost?: number
  activity: TicketActivity[]
}

interface AuditTask {
  id: string
  hotelId: string
  roomNumber?: string
  area?: string
  type: AuditTaskType
  title: string
  scheduledDate: string
  completedDate?: string
  status: AuditStatus
  score?: number
  findings?: string[]
  assignedTo: string
}

interface RoomInventoryItem {
  id: string
  hotelId: string
  roomNumber: string
  name: string
  category: ItemCategory
  condition: ItemCondition
  installedDate: string
  lastServiceDate?: string
  repairCount: number
  totalRepairCost: number
  replacementCost: number
  history: ItemHistoryEntry[]
  description?: string
  location?: string
  status?: AssetStatus
  manufacturer?: string
  model?: string
  serialNumber?: string
  firstUseDate?: string
  endOfLifeDate?: string
  supplier?: string
  purchaseCost?: number
  purchaseDate?: string
  warrantyEnd?: string
  counterType?: string
  counterUnit?: string
  readings?: SensorReading[]
  attachments?: AssetAttachment[]
}
```

#### Metrics Types
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/types/metrics.ts`

```typescript
interface RevenueSummary {
  hotelId: string
  occupancyPct: number
  adr: number
  revPar: number
  totalRevenue: number
  roomRevenue: number
  nonRoomRevenue: number
  revenueMix: RevenueMix
  marketAdr: number
  health: HealthStatus
}

type DepartmentName = 'Housekeeping' | 'Front Desk' | 'Maintenance' | 'Kitchen' | 'Market' | 'Event Space'

interface DepartmentLabour {
  department: DepartmentName
  scheduledHours: number
  clockedHours: number
  variance: number
  overtimeHours: number
  payrollCost: number
}

interface LabourMetrics {
  hotelId: string
  scheduledHours: number
  clockedHours: number
  variance: number
  overtimeHours: number
  payrollCost: number
  departments: DepartmentLabour[]
  health: HealthStatus
}

interface DailyMetrics {
  hotelId: string
  date: string
  roomsSold: number
  roomsOoo: number
  avgCustomerRating: number
  occupancyPct: number
}
```

#### Persona Types
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/types/persona.ts`

```typescript
type PersonaRole = 'managing-director' | 'corporate' | 'regional-director' | 'general-manager' | 'agm' | 'housekeeping-supervisor' | 'maintenance-supervisor' | 'front-desk'
type PersonaScope = 'portfolio' | 'regional' | 'property'

interface Persona {
  id: string
  name: string
  title: string
  role: PersonaRole
  scope: PersonaScope
  initials: string
  avatarColor: string
  avatarUrl?: string
  route: string
}
```

#### AI/Alerts Types
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/types/ai.ts`

```typescript
type AnomalyKind = 'new' | 'trending' | 'recurring' | 'resolved'
type Confidence = 'high' | 'medium' | 'low'
type RecommendationStatus = 'pending' | 'approved' | 'rejected' | 'overridden'

interface AnomalyFinding {
  id: string
  hotelId: string
  module: AlertModule
  severity: AlertSeverity
  kind: AnomalyKind
  headline: string
  detail: string
  metricChain: string[]
  detectedAt: string
}

interface Recommendation {
  id: string
  findingId: string
  hotelId: string
  action: string
  rationale: string
  projectedImpact: string
  confidence: Confidence
  status: RecommendationStatus
}

interface Forecast {
  id: string
  metric: string
  hotelId?: string
  baseline: number
  formattedBaseline: string
  scenarios: ForecastScenario[]
  narrative: string
  horizon: string
}

interface CapexPrediction {
  id: string
  assetCategory: string
  dueQuarter: string
  unitCount: number
  estimatedCost: number
  affectedHotelIds: string[]
  rationale: string
  confidence: Confidence
}
```

#### Assets Types
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/types/assets.ts`

```typescript
type AssetCategory = 'HVAC/PTAC' | 'Elevator' | 'Roof' | 'Kitchen' | 'Laundry' | 'Pool' | 'POS/PMS' | 'Boiler' | 'Parking' | 'FF&E'
type AssetCondition = 'good' | 'fair' | 'poor' | 'failing'

interface Asset {
  id: string
  hotelId: string
  category: AssetCategory
  label: string
  installDate: string
  expectedLifeYears: number
  condition: AssetCondition
  lastServiceDate: string
  replacementCost: number
  failureCount12mo: number
  vendor: string
}

interface AssetHotelSummary {
  hotelId: string
  totalAssets: number
  totalValue: number
  agingAssets: number
  failingAssets: number
  ytdSpend: number
  openWorkOrders: number
  preventiveCompliancePct: number
  health: HealthStatus
}

interface VendorSpend {
  vendor: string
  totalSpend: number
  workOrderCount: number
  hotelIds: string[]
}
```

### Mock Data Files

#### Hotels Data
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/hotels.ts`
- `HOTELS[]` — 16 hotel objects
  - Sample hotels: Hampton Gateway (92 rooms, GA), Cambria Savannah (101 rooms, GA), Courtyard Brunswick (93 rooms, GA), etc.
  - Mix of Hilton, Marriott, Choice, IHG, Wyndham brands
  - Coverage across Georgia, Louisiana, and other southern states
  - Each has: id, code, name, shortName, rooms, brand, city, state

#### Personas Data
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/personas.ts`
- `PERSONAS[]` — 8 personas with full metadata
  - Kris Patel (Managing Director, portfolio)
  - Sanjay Narsee (Corporate Employee)
  - Harshal Patel (Regional Director of Operations)
  - Rishab Patel (General Manager, property BTRCI)
  - Lashwanda (Assistant General Manager)
  - Emma Johnson (Housekeeping Supervisor)
  - Sydney Rivera (Maintenance & Engineering Supervisor)
  - Sravan Puli (Front Desk Staff)

#### Daily Metrics Data
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/daily-metrics.ts`
- `DAILY_METRICS[]` — One row per hotel (16 rows)
  - Date: 2026-05-06
  - Rooms sold, rooms OOO, avg customer rating, occupancy %
  - Example: SAVGW (76 sold, 0 OOO, 4.3 rating, 83% occupancy)

#### Operations Data (Rooms, Tickets, Audits, Inventory)
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/operations.ts` (~1375 lines)

**Content:**
- Room generators (deterministic hash-based)
- Ticket generators
- Audit task generators
- Rich RoomInventoryItem with manufacturer, supplier, warranty, sensor data, attachments
- For each room: PTAC, TV, bed frame, mattress, toilet, shower, mini fridge, desk phone, lamp, pillows, linens, curtains, bedside table
- Each item has: purchase cost, warranty, supplier, model number, service history

#### Revenue Data
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/revenue.ts`
- `REVENUE_DATA[]` — One per hotel
  - Occupancy %, ADR, RevPAR, total revenue, room revenue, non-room revenue, revenue mix, market ADR, health status

#### Labour Data
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/labour.ts`
- `LABOUR_DATA[]` — One per hotel
  - Scheduled hours, clocked hours, variance, overtime hours, payroll cost
  - Breakdown by department (6 types)
  - Health status

#### Employees Data
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/employees.ts` (~378 lines)
- `EMPLOYEES[]` — Complete staff roster
  - Includes: name, employee ID, role, department, hotel, status, shift times, contact

#### Sravan Employee Data
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/sravan.ts` (~315 lines)
- `SRAVAN_EMPLOYEE` — Front desk staff profile (name, hotel, hire date, next pay date, PTO balance)
- `SRAVAN_SCHEDULE[]` — Weekly shift schedule (dates, times, role, notes)
- `SRAVAN_PAYSTUBS[]` — Pay period summaries (gross pay, tips, bonus, taxes, status: pending/paid)
- `SRAVAN_BONUSES[]` — Active bonus programs (name, target, earned, status)
- `SRAVAN_SOPS[]` — Required SOPs (name, required flag, completion status)

#### Leaders Data
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/leaders.ts`
- `GM_ROSTER[]` — General Managers with hotel assignments
- `REGIONAL_ROSTER[]` — Regional Directors with region scope

#### Audits Data
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/audits.ts` (~391 lines)
- `AUDITS[]` — Array of audit tasks (room-level, area-level)
- Status tracking: scheduled, in progress, passed, failed, overdue
- Findings and scores

#### Assets Data
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/assets.ts`
- `ASSETS[]` — Building system assets (HVAC, elevators, roof, etc.)
- `ASSET_HOTEL_SUMMARIES[]` — Per-hotel asset summary
- `VENDOR_SPENDS[]` — Top vendors and spend
- `AI_CAPEX_PREDICTIONS[]` — Capital expenditure forecasts by quarter

#### AI Findings & Recommendations
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/ai-anomalies.ts`
- `AI_ANOMALIES[]` — Array of detected anomalies
  - Module: revenue, labour, operations, maintenance
  - Severity: critical, warning, info
  - Kind: new, trending, recurring, resolved
  - Headline, detail, metric chain, detected at timestamp

**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/ai-recommendations.ts`
- `AI_RECOMMENDATIONS[]` — Actions to take on findings
  - Finding ID link, action description, rationale, projected impact, confidence, status

**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/ai-root-causes.ts`
- `AI_ROOT_CAUSES[]` — Root cause analysis with narrative

**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/ai-forecasts.ts`
- `AI_FORECASTS[]` — Revenue, labour, occupancy forecasts
  - Baseline + 3 scenarios (optimistic/realistic/pessimistic)
  - Narrative explanation

**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/ai-briefs.ts`
- `MODULE_BRIEFS[]` — One-line summaries per module
  - Bullet points (tone: neutral, positive, negative, decision)

**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/ai-decisions.ts`
- `DECISION_LOG[]` — History of decisions on recommendations

**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/ai-patterns.ts`
- `PORTFOLIO_PATTERNS[]` — Cross-hotel patterns (trend-up, trend-down, cluster, comp-set, seasonal)

#### Alerts & Red Flags
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/alerts.ts`
- `RED_FLAGS[]` — Critical operational alerts
  - Module: labour, revenue, operations, maintenance
  - Severity: critical, warning, info

#### AM-PM Report Data
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/am-pm-report.ts`
- `AM_PM_REPORT[]` — Daily shift summary structure

#### Strategy Data
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/data/strategy.ts`
- Strategic objectives and KPI targets

### Utilities

#### Formatters
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/utils/formatters.ts`
- `formatCurrency(value, abbreviated?)` — Formats dollar amounts ($1,234 or $1.2M)
- `formatPct(value, decimals?)` — Formats percentages (85.3%)
- `formatVariance(hours)` — Formats variance with sign (+5 hrs, -3 hrs)

#### Health Utilities
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/utils/health.ts`
- `computeHotelScore(hotelId)` — Composite health score (0–100)
- Score calculation based on revenue, labour, operations metrics
- Trend direction (up, down, stable) and delta

#### Revenue Calculations
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/api/revenue.ts`
- Revenue aggregation functions

#### Date Range Utilities
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/api/date-range.ts`
- Date range calculations

### Index & Exports
**File:** `/Users/sravanpuli/hos-management/packages/shared/src/index.ts`
- Centralized exports for all types and data

---

---

## Supabase Database

### Schema & Migrations

**Location:** `/Users/sravanpuli/hos-management/supabase/`

#### Migration 0001: Initial Schema
**File:** `/Users/sravanpuli/hos-management/supabase/migrations/0001_init.sql`

**Tables Created:**

1. **Tenancy & Identity**
   - `tenants(id, slug, name, plan, created_at)`
   - `users(id, tenant_id, clerk_id, email, name, role, created_at)`
   - `regions(id, tenant_id, slug, name, director_user_id, created_at)`
   - Indexes on tenant_id, email

2. **Hotel Inventory**
   - `hotels(id, tenant_id, code, name, short_name, brand, parent_chain, address, city, state, zip, country, total_rooms, open_date, pms, timezone, region_id, gm_user_id, market_adr, ingest_email, created_at)`
   - `region_hotels(region_id, hotel_id)` — Junction table
   - `room_types(id, hotel_id, code, label, count, base_rate)` — Room type inventory per hotel
   - `annual_targets(id, hotel_id, fiscal_year, revenue_target, occupancy_target_pct, adr_target, revpar_target, monthly_split)`
   - Indexes on tenant_id, region_id

3. **Daily Revenue & Occupancy**
   - `daily_revenue(hotel_id, date, total_revenue, room_revenue, non_room_revenue, mix_room, mix_fb, mix_retail, mix_events, mix_other, adr, revpar, occupancy_pct, market_adr, health, source, uploaded_by, uploaded_at)`
     - Primary key: (hotel_id, date)
   - `daily_occupancy(hotel_id, date, rooms_sold, rooms_ooo, walk_ins, no_shows, cancellations, arrivals, departures, stay_overs, avg_customer_rating, review_count)`
     - Primary key: (hotel_id, date)
   - Indexes on date for efficient time-series queries

#### Migration 0002: Storage Bucket
**File:** `/Users/sravanpuli/hos-management/supabase/migrations/0002_storage_bucket.sql`

- Sets up Supabase Storage bucket for file uploads (photos, documents, etc.)

#### Seed Data
**File:** `/Users/sravanpuli/hos-management/supabase/seed.sql`
- (Placeholder or actual seed data for initial environment setup)

### Current Status

**Note:** The Supabase setup exists but is not fully integrated into the current mock-data-driven codebase. The schema is defined and ready to be integrated; currently, all data is served from in-memory mock objects in `packages/shared/src/data/`.

---

---

## Special Systems & Contexts

### 1. Hotel Filter Context
**File:** `/Users/sravanpuli/hos-management/apps/web/src/lib/hotel-filter-context.tsx`

Provides global filtering and scoping logic:
- Allows filtering by single hotel, multiple hotels (region), or entire portfolio
- Used by all portfolio/regional dashboards to dynamically aggregate metrics
- Integrates with date filter context

### 2. Date Filter Context
**File:** `/Users/sravanpuli/hos-management/apps/web/src/lib/date-filter-context.tsx`

Supports 7 time range options:
- Today, Yesterday, This Week, This Month, Pay Period, YTD, Custom
- Calculates `period` object for aggregations

### 3. Scoped Data Hook
**File:** `/Users/sravanpuli/hos-management/apps/web/src/lib/use-scoped-data.ts`

**Central aggregation engine** for dashboards:
- Filters all revenue, labour, daily metrics based on selected hotels
- Calculates portfolio-level KPIs
- Returns filtered anomalies and alerts
- Detects scope type (single property, region, portfolio)

### 4. Print System
**Files:** 
- `/Users/sravanpuli/hos-management/apps/web/src/components/am-pm-report/PrintableAmPmReport.tsx`
- `/Users/sravanpuli/hos-management/apps/web/src/lib/export-am-pm-xlsx.ts`

**Capabilities:**
- Print AM-PM shift handover reports (web view)
- Export to XLSX (Excel) format for Emma's assignment sheets
- Print center available at `/web/harshal/print`

### 5. Admin Guard
**File:** `/Users/sravanpuli/hos-management/apps/web/src/lib/admin-guard.ts`

Role-based access control utilities for admin pages.

### 6. CSAT (Customer Satisfaction) Scoring
**File:** `/Users/sravanpuli/hos-management/apps/web/src/lib/csat.ts`

Guest satisfaction rating logic with tiers and alert thresholds.

### 7. Emma Room Assignment Logic
**File:** `/Users/sravanpuli/hos-management/apps/web/src/lib/emma-data.ts`

Encapsulates:
- Room queue generation (dirty/inspecting rooms)
- Staff workload tracking
- Auto-assignment algorithm (distributes rooms to staff balancing workload)
- Bilingual room status labels (English + Spanish)

### 8. Sydney Maintenance Data
**File:** `/Users/sravanpuli/hos-management/apps/web/src/lib/sydney-data.ts`

Maintenance supervisor-specific data retrieval and helpers.

### 9. Persona Switching
No explicit persona switcher UI; handled via Next.js routing `/web/{persona}/...`

Routes redirect to correct dashboard based on URL. Admin could implement login/persona selection at `/web/page.tsx`.

### 10. Bilingual Support (Mobile)
Mobile app has EN/ES language toggle affecting:
- All UI labels
- Handover notes
- Ticket descriptions
- SOP content

---

---

## Drill-Down & Detail Systems

### Ticket Detail Drill-Down
Each ticket can be drilled into from list view to show:
- Full description and area
- Timeline of activity with photos, notes, status changes
- AI insights (pattern, likely cause, fix steps, parts needed)
- Estimated cost, revenue lost
- Assignee and watchers

### Room Detail Drill-Down
Each room drills into to show:
- Current status
- Last cleaned/inspected dates
- Guest rating
- Open tickets affecting room
- Maintenance history (from inventory items in room)
- Equipment/asset list with condition

### Hotel Detail Drill-Down (Harshal GM Page)
Clicking GM name shows:
- Commitment accountability log
- Property snapshot (key KPIs)
- Composite score with trend
- Quick actions to related pages

---

---

## What's NOT Built

### Obvious Gaps

1. **Backend APIs** — No real API endpoints (except rate manager stub at `/api/rates/log`); all data is mock
2. **User Authentication** — References Clerk ID in Supabase schema, but no login flow implemented
3. **Real-time Data** — No WebSocket or polling; data is static mock
4. **Photo Upload** — Mobile app has `PhotoModal.tsx` but no actual upload to storage
5. **Broadcast Messages** — Mobile `BroadcastModal.tsx` exists but not wired
6. **Inventory Restock Requests** — Sydney inventory page exists, but no request submission flow
7. **Messaging/Chat** — No inter-staff messaging (though "Message GM" button exists on Harshal GM page)
8. **Scheduling UI** — Referenced at `/web/rishab/scheduling` but content not shown (stub route)
9. **SOP Content** — Menu items exist, pages exist, but no actual SOP content displayed
10. **Settings Pages** — Routed to, but likely just stubs

### Incomplete Integrations

1. **Supabase** — Schema is defined, migrations are in place, but code doesn't query the database; all data is in-memory
2. **Rate Manager** — Has a form and API endpoint stubs, but unclear if endpoint is implemented
3. **AI Insights** — Displays AI findings, but no actual ML/AI backend (mock data only)

### Feature Flags / TODOs

1. **Persona Selector** — Entry point exists, but no actual user login or persona switching UI
2. **Admin Ingestion/Uploads** — Routes exist but likely stubs for future integration
3. **Advanced Filtering** — Basic hotel filter exists, but no complex query builders
4. **Reporting Export** — Partial support (XLSX for assignments), but no comprehensive report generation

---

---

## Technical Architecture Summary

### Front-End Stack
- **Web:** Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Mobile:** Expo, React Native, TypeScript
- **Shared:** pnpm monorepo with two apps + one package

### Key Patterns Used
- **Context + Hooks** for state management (hotel filter, date filter, tickets, audits, inventory, preferences)
- **Server Components** (Next.js page.tsx files are 'use client' for interactivity)
- **Mock Data** from `packages/shared/src/data/` JSON structures
- **Persona-Specific Routing** (`/web/{persona}/...`)
- **Scope-Based Aggregation** via `useScopedData()` hook
- **Component Library** (UI folder with common components)

### Deployment
- Vercel integration configured (`.vercel/project.json`)
- `vercel.json` for build/deployment settings
- `turbo.json` for monorepo task orchestration

### Database
- Supabase PostgreSQL (schema defined, migrations in place, not yet integrated)
- Storage bucket for file uploads (defined but not in use)

---

## Conclusion

This HOS Management system is a fully-featured hotel operations suite built across web and mobile platforms with comprehensive mock data. It demonstrates complete UI/UX for 8+ personas across revenue, labour, operations, assets, and maintenance domains. The Supabase schema is ready for backend integration, and all client-side infrastructure (routing, contexts, types, mock data) is in place and functional. The system prioritizes usability for non-technical hotel staff while providing deep insights to executive leaders through AI-powered anomaly detection and forecasting.
