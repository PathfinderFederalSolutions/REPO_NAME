export type Role = 'USTRANSCOM' | 'PROVIDER' | 'MEMBER';

export type TranscomScope = 'GLOBAL' | 'REGION';
export type RegionCode = 'CONUS-EAST' | 'CONUS-WEST' | 'EUCOM' | 'PACOM' | 'CENTCOM' | 'OTHER';

export type Session = {
  role: Role;

  // TRANSCOM-only
  transcomRegion?: RegionCode;
  transcomScope?: TranscomScope; // GLOBAL can view all; REGION limited to transcomRegion

  // Provider-only
  providerId?: string;     // company id, e.g., ACME-MOVERS
  actorName?: string;      // human name for audit
  providerRole?: 'OWNER' | 'MANAGER' | 'COORDINATOR' | 'OPERATOR'; // internal provider access levels

  // Member-only
  memberId?: string;       // unique member identifier (EDIPI or system id)
  memberName?: string;

  // Optional: last job they were viewing (handy for deep-link)
  jobNumber?: string;
};

const KEY = 'docnorm_session_v2';

export function saveSession(s: Session) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(s));
}
export function loadSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}
export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
