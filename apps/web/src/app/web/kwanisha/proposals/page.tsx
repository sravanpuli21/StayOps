'use client';

import { useMemo, useState } from 'react';
import { FileText, Plus, Upload, X, Check, Calendar } from 'lucide-react';
import {
  useSalesState, addProposal, updateProposal, addContract, updateContract,
  PROPOSAL_TYPE_LABEL, PROPOSAL_STATUS_LABEL, PROPOSAL_STATUS_STYLE,
  CONTRACT_STATUS_LABEL, PROPERTY, fmtDate, fmtMoney,
  type Proposal, type ProposalType, type ProposalStatus,
  type Contract, type ContractType, type ContractStatus,
} from '@/lib/kwanisha-sales';
import { Badge, card } from '../_ui';

/* ── Shared styles (matches sibling pages) ────────────────────────────── */
const inputStyle: React.CSSProperties = {
  border: '1px solid #dddddd', borderRadius: 10, padding: '9px 12px', fontSize: 14, color: '#222', background: '#fff', width: '100%',
};
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#6a6a6a', marginBottom: 5, display: 'block' };

const todayISO = () => new Date().toISOString().slice(0, 10);

const PROPOSAL_TYPES = Object.keys(PROPOSAL_TYPE_LABEL) as ProposalType[];
const PROPOSAL_STATUSES = Object.keys(PROPOSAL_STATUS_LABEL) as ProposalStatus[];

const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  corporate: 'Corporate', group: 'Group', event: 'Event', 'long-stay': 'Long-Stay', partnership: 'Partnership',
};
const CONTRACT_TYPES = Object.keys(CONTRACT_TYPE_LABEL) as ContractType[];

/* Local status style map for contracts, drawn from the existing palette. */
const CONTRACT_STATUS_STYLE: Record<ContractStatus, { fg: string; bg: string }> = {
  draft:            { fg: '#6a6a6a', bg: '#f0f0f0' },
  sent:             { fg: '#1d4ed8', bg: '#dbeafe' },
  signed:           { fg: '#15803d', bg: '#dcfce7' },
  expired:          { fg: '#6a6a6a', bg: '#f0f0f0' },
  cancelled:        { fg: '#6a6a6a', bg: '#f0f0f0' },
  'renewal-needed': { fg: '#b45309', bg: '#fef3c7' },
};

/* ── Form state ───────────────────────────────────────────────────────── */
interface ProposalForm {
  name: string; type: ProposalType; account: string; contact: string; opportunity: string;
  dates: string; estRooms: string; estRoomNights: string; proposedRate: string; expirationDate: string; notes: string;
}
const EMPTY_PROPOSAL: ProposalForm = {
  name: '', type: 'corporate', account: '', contact: '', opportunity: '',
  dates: '', estRooms: '', estRoomNights: '', proposedRate: '', expirationDate: '', notes: '',
};

interface ContractForm {
  name: string; account: string; opportunity: string; type: ContractType;
  startDate: string; endDate: string; rateExpiration: string; renewalReminder: string; fileName: string; notes: string;
}
const EMPTY_CONTRACT: ContractForm = {
  name: '', account: '', opportunity: '', type: 'corporate',
  startDate: '', endDate: '', rateExpiration: '', renewalReminder: '', fileName: '', notes: '',
};

const numOrUndef = (s: string): number | undefined => {
  const n = Number(s.trim());
  return s.trim() === '' || Number.isNaN(n) ? undefined : n;
};

type Tab = 'proposals' | 'contracts';
type StatusFilter = 'all' | ProposalStatus;

export default function ProposalsPage() {
  const { proposals, contracts } = useSalesState();
  const [tab, setTab] = useState<Tab>('proposals');

  /* Proposals tab state */
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [pForm, setPForm] = useState<ProposalForm>(EMPTY_PROPOSAL);

  /* Contracts tab state */
  const [showContractForm, setShowContractForm] = useState(false);
  const [cForm, setCForm] = useState<ContractForm>(EMPTY_CONTRACT);

  const visibleProposals = useMemo(
    () => proposals.filter((p) => statusFilter === 'all' || p.status === statusFilter),
    [proposals, statusFilter],
  );

  function buildProposalPartial(): Omit<Proposal, 'id' | 'propertyCode' | 'owner' | 'createdAt' | 'updatedAt' | 'status'> {
    return {
      name: pForm.name.trim(),
      type: pForm.type,
      account: pForm.account.trim() || undefined,
      contact: pForm.contact.trim() || undefined,
      opportunity: pForm.opportunity.trim() || undefined,
      dates: pForm.dates.trim() || undefined,
      estRooms: numOrUndef(pForm.estRooms),
      estRoomNights: numOrUndef(pForm.estRoomNights),
      proposedRate: numOrUndef(pForm.proposedRate),
      expirationDate: pForm.expirationDate || undefined,
      notes: pForm.notes.trim() || undefined,
    };
  }

  function saveProposal(status: ProposalStatus) {
    if (!pForm.name.trim()) return;
    const partial = buildProposalPartial();
    if (status === 'sent') {
      addProposal({ ...partial, status: 'sent', sentDate: todayISO() });
    } else {
      addProposal({ ...partial, status: 'draft' });
    }
    setPForm(EMPTY_PROPOSAL);
    setShowProposalForm(false);
  }

  function saveContract() {
    if (!cForm.name.trim()) return;
    addContract({
      name: cForm.name.trim(),
      account: cForm.account.trim() || undefined,
      opportunity: cForm.opportunity.trim() || undefined,
      type: cForm.type,
      startDate: cForm.startDate || undefined,
      endDate: cForm.endDate || undefined,
      rateExpiration: cForm.rateExpiration || undefined,
      renewalReminder: cForm.renewalReminder || undefined,
      fileName: cForm.fileName.trim() || undefined,
      notes: cForm.notes.trim() || undefined,
      status: 'draft',
    });
    setCForm(EMPTY_CONTRACT);
    setShowContractForm(false);
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#222' }}>
          <FileText className="w-6 h-6" style={{ color: '#7c3aed' }} /> Proposals &amp; Contracts
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Track proposal and agreement status for {PROPERTY.name}.
        </p>
        <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>
          {PROPERTY.name} · {PROPERTY.code}
        </p>
      </div>

      {/* Top tabs */}
      <div className="flex gap-2">
        {([['proposals', 'Proposals', proposals.length], ['contracts', 'Contracts', contracts.length]] as const).map(([k, label, count]) => {
          const on = tab === k;
          return (
            <button
              key={k}
              onClick={() => setTab(k)}
              className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-2"
              style={{ background: on ? '#7c3aed' : '#fff', color: on ? '#fff' : '#6a6a6a', border: `1px solid ${on ? '#7c3aed' : '#dddddd'}` }}
            >
              {label}
              <span
                className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold"
                style={{ background: on ? 'rgba(255,255,255,0.22)' : '#f0f0f0', color: on ? '#fff' : '#929292' }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── PROPOSALS TAB ──────────────────────────────────────────────── */}
      {tab === 'proposals' && (
        <>
          {/* Status filter pills + New Proposal */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {([['all', 'All'], ...PROPOSAL_STATUSES.map((s) => [s, PROPOSAL_STATUS_LABEL[s]] as const)] as const).map(([k, label]) => {
                const on = statusFilter === k;
                return (
                  <button
                    key={k}
                    onClick={() => setStatusFilter(k as StatusFilter)}
                    className="h-9 px-3.5 rounded-full text-xs font-semibold"
                    style={{ background: on ? '#222' : '#fff', color: on ? '#fff' : '#6a6a6a', border: `1px solid ${on ? '#222' : '#dddddd'}` }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowProposalForm((v) => !v)}
              className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 flex-shrink-0"
              style={{ background: showProposalForm ? '#fff' : '#7c3aed', color: showProposalForm ? '#6a6a6a' : '#fff', border: `1px solid ${showProposalForm ? '#dddddd' : '#7c3aed'}` }}
            >
              {showProposalForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Proposal</>}
            </button>
          </div>

          {/* New proposal form */}
          {showProposalForm && (
            <div className="p-4 sm:p-5 flex flex-col gap-4" style={card}>
              <p className="font-bold text-sm" style={{ color: '#222' }}>New proposal</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label style={labelStyle}>Proposal Name <span style={{ color: '#7c3aed' }}>*</span></label>
                  <input style={inputStyle} value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })} placeholder="e.g. ABC Construction Corporate Rate Proposal" />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select style={inputStyle} value={pForm.type} onChange={(e) => setPForm({ ...pForm, type: e.target.value as ProposalType })}>
                    {PROPOSAL_TYPES.map((t) => <option key={t} value={t}>{PROPOSAL_TYPE_LABEL[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Account</label>
                  <input style={inputStyle} value={pForm.account} onChange={(e) => setPForm({ ...pForm, account: e.target.value })} placeholder="Company / group / event" />
                </div>
                <div>
                  <label style={labelStyle}>Contact</label>
                  <input style={inputStyle} value={pForm.contact} onChange={(e) => setPForm({ ...pForm, contact: e.target.value })} placeholder="Decision-maker" />
                </div>
                <div>
                  <label style={labelStyle}>Opportunity</label>
                  <input style={inputStyle} value={pForm.opportunity} onChange={(e) => setPForm({ ...pForm, opportunity: e.target.value })} placeholder="Linked opportunity" />
                </div>
                <div>
                  <label style={labelStyle}>Proposed Dates</label>
                  <input style={inputStyle} value={pForm.dates} onChange={(e) => setPForm({ ...pForm, dates: e.target.value })} placeholder="e.g. Monthly, May 2027" />
                </div>
                <div>
                  <label style={labelStyle}>Estimated Rooms</label>
                  <input type="number" min={0} style={inputStyle} value={pForm.estRooms} onChange={(e) => setPForm({ ...pForm, estRooms: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Estimated Room Nights</label>
                  <input type="number" min={0} style={inputStyle} value={pForm.estRoomNights} onChange={(e) => setPForm({ ...pForm, estRoomNights: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Proposed Rate ($)</label>
                  <input type="number" min={0} style={inputStyle} value={pForm.proposedRate} onChange={(e) => setPForm({ ...pForm, proposedRate: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Expiration Date</label>
                  <input type="date" style={inputStyle} value={pForm.expirationDate} onChange={(e) => setPForm({ ...pForm, expirationDate: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label style={labelStyle}>Notes</label>
                  <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={pForm.notes} onChange={(e) => setPForm({ ...pForm, notes: e.target.value })} placeholder="Context, terms, what wins this." />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => saveProposal('draft')}
                  disabled={!pForm.name.trim()}
                  className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5"
                  style={{ background: '#fff', color: pForm.name.trim() ? '#7c3aed' : '#c9c9c9', border: `1px solid ${pForm.name.trim() ? '#ece4fb' : '#eee'}`, cursor: pForm.name.trim() ? 'pointer' : 'not-allowed' }}
                >
                  <FileText className="w-4 h-4" /> Save Draft
                </button>
                <button
                  onClick={() => saveProposal('sent')}
                  disabled={!pForm.name.trim()}
                  className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5"
                  style={{ background: pForm.name.trim() ? '#7c3aed' : '#e9e2f8', color: '#fff', border: 'none', cursor: pForm.name.trim() ? 'pointer' : 'not-allowed' }}
                >
                  <Check className="w-4 h-4" /> Mark Sent
                </button>
                <button onClick={() => { setPForm(EMPTY_PROPOSAL); setShowProposalForm(false); }} className="h-10 px-4 rounded-full text-sm font-semibold" style={{ background: '#fff', color: '#6a6a6a', border: '1px solid #dddddd' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Proposal list */}
          {visibleProposals.length === 0 ? (
            <div className="p-8 text-center" style={{ ...card, border: '1px dashed #dddddd' }}>
              <FileText className="w-7 h-7 mx-auto mb-2" style={{ color: '#c9c9c9' }} />
              <p className="text-sm" style={{ color: '#929292' }}>
                {statusFilter !== 'all'
                  ? 'No proposals match this status.'
                  : 'No proposals yet. Create a corporate, group, event, long-stay, or partnership proposal.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visibleProposals.map((p) => {
                const ss = PROPOSAL_STATUS_STYLE[p.status];
                return (
                  <div key={p.id} className="p-4 flex flex-col gap-3" style={card}>
                    {/* Top row */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ece4fb', color: '#7c3aed' }}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm" style={{ color: '#222' }}>{p.name}</p>
                          <Badge label={PROPOSAL_TYPE_LABEL[p.type]} fg="#7c3aed" bg="#ece4fb" />
                        </div>
                        {p.account && <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}><span style={{ color: '#222', fontWeight: 600 }}>{p.account}</span></p>}
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0" style={{ background: ss.bg, color: ss.fg }}>
                        {PROPOSAL_STATUS_LABEL[p.status]}
                      </span>
                    </div>

                    {/* Detail row */}
                    <div className="flex items-center gap-x-5 gap-y-1 flex-wrap pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
                      <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
                        <Calendar className="w-3.5 h-3.5" /> Sent: <span style={{ color: '#222' }}>{fmtDate(p.sentDate)}</span>
                      </span>
                      <span className="text-xs" style={{ color: '#6a6a6a' }}>
                        Expires: <span style={{ color: '#222' }}>{fmtDate(p.expirationDate)}</span>
                      </span>
                      <span className="text-xs" style={{ color: '#6a6a6a' }}>
                        Value: <span style={{ color: '#222', fontWeight: 600 }}>{fmtMoney(p.value)}</span>
                      </span>
                      <span className="text-xs" style={{ color: '#6a6a6a' }}>
                        Next follow-up: <span style={{ color: p.nextFollowUp ? '#7c3aed' : '#929292', fontWeight: p.nextFollowUp ? 600 : 400 }}>{fmtDate(p.nextFollowUp)}</span>
                      </span>
                    </div>

                    {p.notes && <p className="text-xs" style={{ color: '#6a6a6a', lineHeight: 1.5 }}>{p.notes}</p>}

                    {/* Row actions */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <button
                        onClick={() => updateProposal(p.id, { status: 'sent', sentDate: todayISO() })}
                        className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                        style={{ background: '#fff', color: '#1d4ed8', border: '1px solid #dbeafe' }}
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Sent
                      </button>
                      <button
                        onClick={() => updateProposal(p.id, { status: 'accepted' })}
                        className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                        style={{ background: '#fff', color: '#15803d', border: '1px solid #dcfce7' }}
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Accepted
                      </button>
                      <button
                        onClick={() => updateProposal(p.id, { status: 'rejected' })}
                        className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                        style={{ background: '#fff', color: '#b91c1c', border: '1px solid #fee2e2' }}
                      >
                        <X className="w-3.5 h-3.5" /> Mark Rejected
                      </button>
                      <button
                        onClick={() => updateProposal(p.id, { status: 'cancelled' })}
                        className="h-8 px-3 rounded-full text-xs font-semibold ml-auto"
                        style={{ background: '#fff', color: '#929292', border: '1px solid #dddddd' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── CONTRACTS TAB ──────────────────────────────────────────────── */}
      {tab === 'contracts' && (
        <>
          <div className="flex items-center justify-end">
            <button
              onClick={() => setShowContractForm((v) => !v)}
              className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 flex-shrink-0"
              style={{ background: showContractForm ? '#fff' : '#7c3aed', color: showContractForm ? '#6a6a6a' : '#fff', border: `1px solid ${showContractForm ? '#dddddd' : '#7c3aed'}` }}
            >
              {showContractForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Contract</>}
            </button>
          </div>

          {/* Add contract form */}
          {showContractForm && (
            <div className="p-4 sm:p-5 flex flex-col gap-4" style={card}>
              <p className="font-bold text-sm" style={{ color: '#222' }}>New contract</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label style={labelStyle}>Contract Name <span style={{ color: '#7c3aed' }}>*</span></label>
                  <input style={inputStyle} value={cForm.name} onChange={(e) => setCForm({ ...cForm, name: e.target.value })} placeholder="e.g. ABC Construction Corporate Agreement" />
                </div>
                <div>
                  <label style={labelStyle}>Account</label>
                  <input style={inputStyle} value={cForm.account} onChange={(e) => setCForm({ ...cForm, account: e.target.value })} placeholder="Company / group / event" />
                </div>
                <div>
                  <label style={labelStyle}>Opportunity</label>
                  <input style={inputStyle} value={cForm.opportunity} onChange={(e) => setCForm({ ...cForm, opportunity: e.target.value })} placeholder="Linked opportunity" />
                </div>
                <div>
                  <label style={labelStyle}>Contract Type</label>
                  <select style={inputStyle} value={cForm.type} onChange={(e) => setCForm({ ...cForm, type: e.target.value as ContractType })}>
                    {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{CONTRACT_TYPE_LABEL[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input type="date" style={inputStyle} value={cForm.startDate} onChange={(e) => setCForm({ ...cForm, startDate: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>End Date</label>
                  <input type="date" style={inputStyle} value={cForm.endDate} onChange={(e) => setCForm({ ...cForm, endDate: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Rate Expiration Date</label>
                  <input type="date" style={inputStyle} value={cForm.rateExpiration} onChange={(e) => setCForm({ ...cForm, rateExpiration: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Renewal Reminder</label>
                  <input type="date" style={inputStyle} value={cForm.renewalReminder} onChange={(e) => setCForm({ ...cForm, renewalReminder: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label style={labelStyle}>Uploaded File</label>
                  <input style={inputStyle} value={cForm.fileName} onChange={(e) => setCForm({ ...cForm, fileName: e.target.value })} placeholder="e.g. ABC-Construction-Signed.pdf" />
                  <p className="text-[11px] mt-1.5 inline-flex items-center gap-1.5" style={{ color: '#929292' }}>
                    <Upload className="w-3 h-3" /> File upload coming soon — record the file name for now.
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label style={labelStyle}>Notes</label>
                  <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={cForm.notes} onChange={(e) => setCForm({ ...cForm, notes: e.target.value })} placeholder="Terms, renewal context, anything to remember." />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveContract}
                  disabled={!cForm.name.trim()}
                  className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5"
                  style={{ background: cForm.name.trim() ? '#7c3aed' : '#e9e2f8', color: '#fff', border: 'none', cursor: cForm.name.trim() ? 'pointer' : 'not-allowed' }}
                >
                  <Check className="w-4 h-4" /> Save
                </button>
                <button onClick={() => { setCForm(EMPTY_CONTRACT); setShowContractForm(false); }} className="h-10 px-4 rounded-full text-sm font-semibold" style={{ background: '#fff', color: '#6a6a6a', border: '1px solid #dddddd' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Contract list */}
          {contracts.length === 0 ? (
            <div className="p-8 text-center" style={{ ...card, border: '1px dashed #dddddd' }}>
              <Upload className="w-7 h-7 mx-auto mb-2" style={{ color: '#c9c9c9' }} />
              <p className="text-sm" style={{ color: '#929292' }}>
                No contracts yet. Upload a signed agreement or add one to track renewal dates.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {contracts.map((c) => {
                const ss = CONTRACT_STATUS_STYLE[c.status];
                return (
                  <div key={c.id} className="p-4 flex flex-col gap-3" style={card}>
                    {/* Top row */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ece4fb', color: '#7c3aed' }}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm" style={{ color: '#222' }}>{c.name}</p>
                          <Badge label={CONTRACT_TYPE_LABEL[c.type]} fg="#7c3aed" bg="#ece4fb" />
                        </div>
                        {c.account && <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}><span style={{ color: '#222', fontWeight: 600 }}>{c.account}</span></p>}
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0" style={{ background: ss.bg, color: ss.fg }}>
                        {CONTRACT_STATUS_LABEL[c.status]}
                      </span>
                    </div>

                    {/* Detail row */}
                    <div className="flex items-center gap-x-5 gap-y-1 flex-wrap pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
                      <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
                        <Calendar className="w-3.5 h-3.5" /> {fmtDate(c.startDate)} – {fmtDate(c.endDate)}
                      </span>
                      <span className="text-xs" style={{ color: '#6a6a6a' }}>
                        Rate expires: <span style={{ color: '#222' }}>{fmtDate(c.rateExpiration)}</span>
                      </span>
                      <span className="text-xs" style={{ color: '#6a6a6a' }}>
                        Renewal reminder: <span style={{ color: c.renewalReminder ? '#7c3aed' : '#929292', fontWeight: c.renewalReminder ? 600 : 400 }}>{fmtDate(c.renewalReminder)}</span>
                      </span>
                    </div>

                    {c.fileName && (
                      <span className="inline-flex items-center gap-1.5 text-xs self-start px-2.5 py-1.5 rounded-lg" style={{ background: '#f7f7f7', color: '#6a6a6a' }}>
                        <FileText className="w-3.5 h-3.5" /> {c.fileName}
                      </span>
                    )}

                    {c.notes && <p className="text-xs" style={{ color: '#6a6a6a', lineHeight: 1.5 }}>{c.notes}</p>}

                    {/* Row actions */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <button
                        onClick={() => updateContract(c.id, { status: 'signed' })}
                        className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                        style={{ background: '#fff', color: '#15803d', border: '1px solid #dcfce7' }}
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Signed
                      </button>
                      <button
                        onClick={() => updateContract(c.id, { status: 'expired' })}
                        className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                        style={{ background: '#fff', color: '#6a6a6a', border: '1px solid #dddddd' }}
                      >
                        Mark Expired
                      </button>
                      <button
                        onClick={() => updateContract(c.id, { status: 'renewal-needed' })}
                        className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                        style={{ background: '#fff', color: '#b45309', border: '1px solid #fef3c7' }}
                      >
                        <Calendar className="w-3.5 h-3.5" /> Set Renewal Needed
                      </button>
                      <button
                        onClick={() => updateContract(c.id, { status: 'cancelled' })}
                        className="h-8 px-3 rounded-full text-xs font-semibold ml-auto"
                        style={{ background: '#fff', color: '#929292', border: '1px solid #dddddd' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
