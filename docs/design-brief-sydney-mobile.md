# Design Brief — Maintenance & Engineering Supervisor Mobile App

**For:** UX Designer · UI Designer · Information Architect
**From:** StayOps product
**Scope:** Design a mobile app (Expo / React Native, phone-first) for a hotel's Maintenance & Engineering Supervisor.
**Deliverable expectations:** This brief defines *what the app must accomplish and for whom* — not how it should look. You own the UX flows, visual design, and information architecture. Where this brief states a constraint (platform, data that must exist, a job that must be supported), treat it as fixed. Everything about layout, navigation model, visual language, and interaction design is yours to design from first principles.

---

## 1. Context

StayOps is an operations platform for hotel groups. This brief covers **one role inside that platform: the Maintenance & Engineering Supervisor at a single hotel.** It is part of a larger product family (other roles include the General Manager, front desk, housekeeping, and corporate finance), so the app should feel like it could belong to one coherent product — but you are only designing this one role's app here.

We want a deliberate, ground-up design rooted in what this supervisor actually needs to get done across a shift. Start from the role and the work, not from any assumptions about screens or features.

---

## 2. Who the user is

**The Maintenance & Engineering Supervisor — runs the day shift (≈7am–3pm) at a single hotel.** We'll call her Sydney.

She is responsible for everything that's physically broken, at risk, or needs inspecting across the property.

- **She supervises technicians** (e.g. a night tech) — she assigns, reassigns, escalates, and can override or close their work.
- She **hands the property off** to the night tech at end of shift, and picks up their handover in the morning.
- She owns **inventory** (parts/supplies) and **audits** (safety, fixtures, preventive checks).
- She reports up to a General Manager and, above them, a multi-property director.

**How she actually works (the realities that should shape the design):**

- She is **mobile and interrupted** — walking the property, in mechanical rooms, between tasks. Often one-handed, sometimes gloved, variable lighting, possibly spotty connectivity.
- Her day is **driven by what's urgent and what costs money** — a broken room that can't be sold loses revenue every night it's down.
- She is a **dispatcher and decision-maker**, not the person who does every task — she triages, assigns, and keeps things moving.
- **Time and trust matter:** she needs to know what's on fire, who's handling it, and what she's accountable for — fast.

---

## 3. The jobs the app must support (jobs-to-be-done)

These are the outcomes the app exists to deliver. How they're organized, surfaced, and prioritized is your design decision.

1. **Start the shift oriented.** In under a minute, she needs to know: what's urgent, what's costing money right now, what was handed to her overnight, and what's due today.
2. **Triage and dispatch work.** See incoming/open issues, understand severity and impact, assign or reassign them to the right tech, and track who's doing what.
3. **Manage a single issue end-to-end.** Open a problem, understand it (including guest/revenue impact and any diagnostic help), act on it (reprioritize, reassign, message the tech, escalate to the GM, or close it), and see its history.
4. **Protect revenue.** Quickly identify rooms that are out of service or at risk of a bad guest arrival, and understand the financial stakes.
5. **Run and review audits.** Conduct or review structured inspections (room-by-room, item-by-item pass/fail), capture evidence for failures, and turn failures into action (repair, ticket, replace, escalate).
6. **Keep parts available.** See what's low or out, what was used today, what was borrowed from other rooms (and must be returned), and reorder — sometimes requiring approval up the chain.
7. **Know the team.** See who's on shift, their status, what they're working on, and reach them quickly.
8. **Hand off the shift.** Compose a clear handover for the incoming tech, and review the one left for her — notes, unresolved issues, parts, watchlist rooms.
9. **Manage herself.** Hours/schedule, on-call status, notification preferences, assignment and audit-cadence settings, and her own performance.

---

## 4. Information the app works with

Your IA must account for the following content existing and relating to each other:

- **Tickets / work items** — each has a severity/priority, a status, a location (room + floor), an assignee, a description, a history/timeline, and may carry guest-impact, revenue-impact, and optional diagnostic hints.
- **Rooms** — can be out of service, occupied-with-issue, at-risk for an arrival, or on a watchlist; each ties back to underlying work and a nightly revenue value.
- **Audits** — a hierarchy of audit → rooms → areas → items; each item is inspected (pass/fail), and failures need evidence and a follow-up action.
- **Inventory** — items grouped by category, each with a stock level, a target ("par"), a location, and a usage/borrow history.
- **Staff** — people with a role, shift window, current status, current task and progress, and contact info.
- **Handover** — a shift-boundary bundle of notes, unresolved items, parts status, and watchlist.
- **The supervisor herself** — schedule/hours, preferences, broadcasts, performance stats.

**Cross-cutting signals that recur across all of the above, and likely deserve a single consistent treatment:** urgency/priority, status, revenue-at-risk, guest impact, "who owns this," and time/recency.

---

## 5. Constraints (fixed)

- **Platform:** Expo / React Native, phone-first (iOS + Android). Design for a handheld device used on the move. Tablet is not in scope, but don't actively preclude it.
- **Offline / poor connectivity is real.** The app may be used where signal is weak. Consider how status, freshness, and actions behave when data can't sync immediately.
- **One-handed, glanceable, interruptible use.** Touch targets, contrast, and scannability matter more than density.
- **This is a supervisor's tool** — it includes authority actions (override, escalate, force-close, approve) that a regular technician wouldn't have. Those need to feel deliberate and safe, not accidental.
- **Single property.** The supervisor sees one hotel. Don't design portfolio/multi-hotel switching.

---

## 6. What we want back from you

Organized by discipline — collaborate, but these are the lenses we expect:

**Information Architect**
- A navigation model and content structure: what are the primary destinations, what's secondary, what's contextual? Justify it against the jobs in §3.
- A consistent scheme for the cross-cutting signals in §4 (priority, status, revenue, ownership, recency) so they read the same everywhere.
- How detail relates to overview (e.g. how a room, a ticket, and an audit finding interconnect).

**UX Designer**
- Key flows for the jobs in §3 — especially: shift start, triage→dispatch, single-issue resolution, running an audit with a failure, reorder-with-approval, and shift handover (both directions).
- How authority/destructive actions are made safe and clear.
- Offline / stale-data and empty/edge states for the core flows.

**UI Designer**
- A visual language for the app: typography scale, color/semantic system (including the recurring signals), spacing, components.
- A component set covering the recurring patterns (lists/feeds, detail screens, status indicators, action sheets, forms/inputs, modals).
- Accessibility: contrast, touch-target sizing, legibility in poor conditions.

**Format:** whatever communicates best — flows, wireframes, a component inventory, a clickable prototype. We care about the thinking and the rationale, not pixel-polish on every screen.

---

## 7. Success criteria

The design is successful if:

- A new supervisor can orient themselves at shift start **without training**.
- "What needs my attention and what is it costing us" is answerable **at a glance**.
- Dispatching and resolving an issue takes **few taps and little hunting**.
- Authority actions feel **deliberate and reversible-where-possible**, never accidental.
- The app stays **usable and trustworthy when connectivity is poor**.
- It reads as **one coherent product**, not a pile of features.
