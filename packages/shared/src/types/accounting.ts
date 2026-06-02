export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type UsaliDept =
  | 'rooms'
  | 'fb'
  | 'other-op'
  | 'undistributed'
  | 'fixed'
  | 'non-op'
  | 'balance-sheet';

export interface ChartOfAccount {
  id: string;
  number: string;          // e.g. "4100" or "5210-OTA"
  name: string;
  type: AccountType;
  usaliDept: UsaliDept;
  parentId?: string;
}

export type VendorTerms = 'Due on Receipt' | 'Net 7' | 'Net 15' | 'Net 30' | 'Net 60';

export interface Vendor {
  id: string;
  name: string;
  defaultAccountId: string;     // posts to this account by default
  terms: VendorTerms;
  category: 'utility' | 'food' | 'supplies' | 'maintenance' | 'ota' | 'franchise' | 'tech' | 'payroll' | 'insurance' | 'tax' | 'bank' | 'other';
}

export type TxSource = 'bank' | 'cc' | 'payroll' | 'ota' | 'manual';

export interface LedgerTransaction {
  id: string;
  hotelId: string;
  dateIso: string;
  accountId: string;
  vendorId?: string;
  amount: number;          // signed: + = debit/inflow into account, - = outflow
  memo: string;
  source: TxSource;
  sourceRowId?: string;
  reconciledIso?: string | null;
  aiSuggested?: boolean;
  ruleId?: string | null;
}

export type BillStatus = 'open' | 'overdue' | 'paid';

export interface Bill {
  id: string;
  hotelId: string;
  vendorId: string;
  billNumber: string;
  billDateIso: string;
  dueDateIso: string;
  amount: number;
  status: BillStatus;
  accountId: string;
  paidIso?: string;
}

export type BankAccountKind = 'operating' | 'reserve' | 'cc';

export interface BankAccount {
  id: string;
  hotelId: string | 'CONSOLIDATED';
  name: string;            // e.g. "Wells Fargo Operating - SAVMT"
  kind: BankAccountKind;
  last4: string;
  statementBalance: number;
  bookBalance: number;
  lastReconciledIso?: string;
}

export interface BankImportRow {
  id: string;
  bankAccountId: string;
  hotelId: string;
  dateIso: string;
  description: string;
  amount: number;          // - = debit out, + = credit in
  runningBalance: number;
  matchedTxId?: string | null;
}

export interface CreditCardImportRow {
  id: string;
  bankAccountId: string;   // CC account
  hotelId: string;
  dateIso: string;
  description: string;
  amount: number;          // CC charges are positive expenses
  cardLast4: string;
  matchedTxId?: string | null;
}

export interface PayrollImportRow {
  id: string;
  hotelId: string;
  periodEndIso: string;
  employeeName: string;
  department: 'rooms' | 'fb' | 'maintenance' | 'admin';
  gross: number;
  taxes: number;
  netPay: number;
  employerTaxes: number;
}

export type OtaName = 'Expedia' | 'Booking.com' | 'Agoda';

export interface OtaRemittanceRow {
  id: string;
  hotelId: string;
  dateIso: string;
  otaName: OtaName;
  reservationCount: number;
  grossBookings: number;
  commission: number;
  taxesCollected: number;
  netPayout: number;
  matchedTxId?: string | null;
}

export interface ReconciliationStatus {
  bankAccountId: string;
  period: string;          // YYYY-MM
  clearedDebits: number;
  clearedCredits: number;
  statementBalance: number;
  bookBalance: number;
  diff: number;
  status: 'in-balance' | 'out-of-balance' | 'not-started';
}

export type RuleMatchKind = 'contains' | 'equals';

export interface CategoryRule {
  id: string;
  pattern: string;
  matchKind: RuleMatchKind;
  accountId: string;
  vendorId?: string;
  createdIso: string;
  hits: number;
}

// ---- Receipts / invoices --------------------------------------------------

export type ReceiptStatus = 'attached' | 'missing' | 'needs-review' | 'not-required';

export interface ReceiptLineItem {
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface Receipt {
  id: string;
  transactionId: string;
  hotelId: string;
  filename: string;
  uploadedIso: string;
  uploadedBy: string;
  ocrVendor: string;
  ocrDateIso: string;
  ocrTotal: number;
  ocrTax?: number;
  ocrInvoiceNumber?: string;
  ocrConfidence: number;     // 0..1
  lineItems: ReceiptLineItem[];
  status: ReceiptStatus;
  thumbnailEmoji: string;    // visual stand-in for image
}

// ---- Audit log ------------------------------------------------------------

export type AuditAction =
  | 'upload'
  | 'edit'
  | 'categorize'
  | 'reconcile'
  | 'close-period'
  | 'reopen-period'
  | 'attach-receipt'
  | 'split-transaction'
  | 'approve'
  | 'reject';

export interface AuditEntry {
  id: string;
  actorName: string;
  action: AuditAction;
  targetType: 'transaction' | 'period' | 'bill' | 'receipt' | 'statement';
  targetId: string;
  hotelId?: string;
  timestampIso: string;       // ISO datetime
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  notes?: string;
}

// ---- Approval workflow ----------------------------------------------------

export type ApprovalStatus =
  | 'not-required'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'approved-with-exception'
  | 'emergency-bypass';

export interface ApprovalRequest {
  id: string;
  transactionId: string;
  hotelId: string;
  amount: number;
  category: string;
  requestedBy: string;
  requestedIso: string;
  status: ApprovalStatus;
  approverRole: 'GM' | 'Regional Manager' | 'Owner';
  approverName?: string;
  decidedIso?: string;
  reason?: string;       // for rejected
  notes?: string;
}

// ---- Close periods --------------------------------------------------------

export type CloseStatus = 'open' | 'ready-to-close' | 'closed' | 'reopened' | 'closed-with-exceptions';

export interface ClosePeriod {
  id: string;
  hotelId: string;
  accountId: string;        // bank account id
  periodEndIso: string;     // YYYY-MM-DD — the through-date
  status: CloseStatus;
  closedBy?: string;
  closedIso?: string;
  reopenedBy?: string;
  reopenedIso?: string;
  reopenReason?: string;
  exceptionCount?: number;  // how many tx flagged as exception at close
}

// ---- Split transactions ---------------------------------------------------

export interface TransactionSplit {
  id: string;
  parentTransactionId: string;
  accountId: string;
  amount: number;            // sum of children = parent
  department?: string;
  area?: string;
  roomNumber?: string;
  notes?: string;
}
