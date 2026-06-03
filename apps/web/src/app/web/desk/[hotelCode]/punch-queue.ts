'use client';

/**
 * Offline-resilient punch queue for the shared front-desk computer.
 *
 * A punch must NEVER be lost to a flaky network. So every punch is written to
 * this device-local queue first; we then try to send it to the server. If the
 * send fails (offline / network error), it stays queued and is retried
 * automatically when the connection returns (online event + periodic flush).
 *
 * NOTE (for backend / Charan): password verification happens server-side, so an
 * offline punch is trusted locally and verified at sync time. The queued record
 * carries the client `punchedAt` so the real punch time is preserved even if the
 * sync happens minutes later — the punch API should honor that timestamp. Storing
 * the password locally for replay is a demo simplification; real offline auth
 * (signed token / cached credential) is a backend follow-up.
 */

export interface QueuedPunch {
  id:         string;   // client-generated id (dedupe key)
  hotelCode:  string;
  employeeId: string;
  pin:        string;
  kind:       'in' | 'out';
  punchedAt:  string;   // client ISO time of the punch
  fullName?:  string;   // best-effort label for the offline confirmation
}

const keyFor = (hotelCode: string) => `stayops.desk.punchQueue.${hotelCode}`;

function read(hotelCode: string): QueuedPunch[] {
  try {
    const raw = localStorage.getItem(keyFor(hotelCode));
    return raw ? (JSON.parse(raw) as QueuedPunch[]) : [];
  } catch { return []; }
}

function write(hotelCode: string, items: QueuedPunch[]) {
  try { localStorage.setItem(keyFor(hotelCode), JSON.stringify(items)); } catch { /* ignore */ }
}

export function pendingCount(hotelCode: string): number {
  return read(hotelCode).length;
}

export function enqueue(p: QueuedPunch) {
  const items = read(p.hotelCode);
  items.push(p);
  write(p.hotelCode, items);
}

/** Try to send one queued punch to the server. Returns true if accepted (or permanently rejected). */
async function send(p: QueuedPunch): Promise<{ ok: boolean; permanent: boolean }> {
  try {
    const res = await fetch('/api/employees/punch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        hotelCode: p.hotelCode, employeeId: p.employeeId, pin: p.pin,
        kind: p.kind, punchedAt: p.punchedAt,
      }),
    });
    if (res.ok) return { ok: true, permanent: false };
    // 4xx (e.g. bad password) is a permanent rejection — stop retrying it.
    if (res.status >= 400 && res.status < 500) return { ok: false, permanent: true };
    return { ok: false, permanent: false }; // 5xx → retry later
  } catch {
    return { ok: false, permanent: false };  // network down → retry later
  }
}

/**
 * Flush the queue for a hotel. Sends each pending punch; keeps the ones that
 * still can't reach the server. Returns how many were synced and how many remain.
 */
export async function flushQueue(hotelCode: string): Promise<{ synced: number; remaining: number; rejected: QueuedPunch[] }> {
  const items = read(hotelCode);
  if (items.length === 0) return { synced: 0, remaining: 0, rejected: [] };

  const keep: QueuedPunch[] = [];
  const rejected: QueuedPunch[] = [];
  let synced = 0;

  for (const p of items) {
    const r = await send(p);
    if (r.ok) synced++;
    else if (r.permanent) rejected.push(p); // drop from queue, surface to caller
    else keep.push(p);                       // retry next time
  }

  write(hotelCode, keep);
  return { synced, remaining: keep.length, rejected };
}
