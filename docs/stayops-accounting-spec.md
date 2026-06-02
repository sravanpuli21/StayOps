# StayOps Accounting Module — V1 Spec

Saved 2026-06-01 as the canonical roadmap. The actual brief sent by Sanjay/Charan
defines the product as "a complete CSV-based accounting system for hotel bank and
credit card expenses that supports hotel/entity setup, transaction import,
categorisation, split expenses, receipt/invoice attachment, OCR, vendor management,
recurring bills, date-wise reconciliation, date-wise close, P&L, cash flow
statement, balance sheet, portfolio reporting, budget vs actual, and CPA export."

V2 adds: vendor bills, purchase approvals, revenue matching, PMS integration,
StayOps tickets/audits/assets connection.

## V1 Navigation (15 items)

Dashboard · Uploads · Transactions · Banking · Credit Cards · Vendors · Bills ·
Recurring Bills · Reconciliation · Reports · Chart of Accounts · Budgets ·
Approvals · CPA Export · Settings.

## V1 Features (30)

1. Hotel/entity setup
2. Bank account setup
3. Credit card setup
4. One-hotel-at-a-time CSV upload
5. File-name-based detection
6. Duplicate flagging
7. Transaction parser
8. Transaction review queue
9. Hotel-specific chart of accounts
10. Vendor creation
11. Auto-categorisation rules
12. AI categorisation suggestions
13. Split transactions
14. Receipt/invoice upload
15. OCR extraction
16. Missing receipt flags
17. Repair and maintenance context flow
18. Date-wise reconciliation
19. Date-wise close
20. P&L
21. Cash flow statement
22. Balance sheet
23. Budget vs actual
24. Vendor spend reports
25. Credit card spend reports
26. Missing receipt reports
27. Bank balance reports
28. Debt/loan payment reports
29. Portfolio comparison reports
30. CPA export

## What's already built (push 1)

- Sanjay app shell at `/web/sanjay/accounting/*` with 4 sub-routes
- Hotel-specific 50-account COA + 25 vendors + bank accounts per hotel
- Bills page with filters + batch-pay UI
- Banking page with QBO row-by-row review, OTA payout splitter (gross / commission /
  tax / net deposit), Reconcile drawer, learned-rules panel
- Demo toggle (Seeded · 3 mo / Empty)
- USALI departmental P&L → GOP → NOI

## Push 2 scope (in progress)

Expanding nav to spec's 15 items, adding entities layer, real CSV parser +
filename detection + dupe check, full Uploads + Transactions + Vendors + Settings +
Chart of Accounts + Recurring Bills + CPA Export pages, Cash Flow + Balance Sheet
+ Budget vs Actual reports.

Deferred: full OCR, Approvals workflow UI, multi-file bulk upload, split
transactions UI (data model in).

## Build phases (per spec §36)

1. Foundation: hotels · entities · accounts · CCs · COA · vendors · CSV upload · parser
2. Transaction intelligence: auto-categorisation · vendor rules · splits · receipts · OCR · missing flags
3. Reconciliation: statement review · dupes · date-wise reconciliation · close + reopen
4. Reporting: P&L · Cash Flow · Balance Sheet · Budget vs Actual · vendor/card spend · portfolio comparison · CPA export
5. V2 expansion: vendor bills · approvals · revenue matching · StayOps integration
