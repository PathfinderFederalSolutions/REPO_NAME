import { loadSession } from './session';

const BASE = process.env.NEXT_PUBLIC_DOC_NORM_URL || 'http://localhost:8787';

function authHeaders() {
  const s = loadSession();
  const h: Record<string, string> = {};
  if (s?.role) h['x-role'] = s.role;
  if (s?.providerId) h['x-provider-id'] = s.providerId;
  if (s?.actorName) h['x-actor'] = s.actorName;
  return h;
}

export async function listProviderJobs() {
  const s = loadSession();
  if (!s?.providerId) throw new Error('No providerId in session');
  const res = await fetch(`${BASE}/providers/${encodeURIComponent(s.providerId)}/jobs`, {
    headers: { ...authHeaders() },
  });
  if (res.status === 404) {
    const f = await fetch(`${BASE}/jobs?providerId=${encodeURIComponent(s.providerId)}`, { headers: { ...authHeaders() } });
    if (!f.ok) throw new Error('Jobs list not available');
    return f.json();
  }
  if (!res.ok) throw new Error(`Jobs list failed: ${res.status}`);
  return res.json();
}

export async function getJob(jobNumber: string) {
  const res = await fetch(`${BASE}/jobs/${encodeURIComponent(jobNumber)}`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(`Get job failed: ${res.status}`);
  return res.json();
}

export async function listJobActivities(jobNumber: string) {
  const res = await fetch(`${BASE}/jobs/${encodeURIComponent(jobNumber)}/activities`, { headers: { ...authHeaders() } });
  if (res.status === 404) {
    return [
      { id: 'SURVEY',   name: 'Pre-Move Survey' },
      { id: 'PICKUP',   name: 'Pickup' },
      { id: 'LINEHAUL', name: 'Linehaul' },
      { id: 'DELIVERY', name: 'Delivery' },
      { id: 'CLAIMS',   name: 'Claims' }
    ];
  }
  if (!res.ok) throw new Error(`List activities failed: ${res.status}`);
  return res.json();
}

export async function listJobArtifacts(jobNumber: string) {
  const res = await fetch(`${BASE}/jobs/${encodeURIComponent(jobNumber)}/artifacts`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(`List artifacts failed: ${res.status}`);
  return res.json();
}

export async function uploadActivityArtifact(jobNumber: string, activityId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  form.append('activityId', activityId);
  const res = await fetch(`${BASE}/jobs/${encodeURIComponent(jobNumber)}/artifacts`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export async function fetchLatestExtract(artifactId: string) {
  const res = await fetch(`${BASE}/extract/${encodeURIComponent(artifactId)}/latest`, {
    headers: { ...authHeaders(), 'x-role': 'MEMBER' },
  });
  if (!res.ok) throw new Error(`Latest extract failed: ${res.status}`);
  return res.json();
}
