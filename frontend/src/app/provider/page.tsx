'use client';

import { useEffect, useState } from 'react';
import { loadSession, saveSession, clearSession, type Session } from '@/lib/session';
import { listProviderJobs } from '@/lib/docnorm';
import Link from 'next/link';

export default function ProviderDashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [jobs, setJobs] = useState<Array<{ jobNumber: string; taskOrderId?: string; createdAt?: string }>>([]);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const s = loadSession();
    if (!s || s.role !== 'PROVIDER' || !s.providerId) {
      setStatus('Please sign in as a Provider.');
    } else {
      setSession(s);
      refresh(s);
    }
  }, []);

  async function refresh(s: Session) {
    setStatus('Loading your jobs…');
    try {
      const data = await listProviderJobs();
      setJobs(data || []);
      setStatus(`Found ${data?.length ?? 0} job(s).`);
    } catch (e: any) {
      setStatus(`❌ ${e.message || 'Failed to load jobs'}`);
    }
  }

  function onSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const providerId = String(form.get('providerId') || '').trim();
    const actorName = String(form.get('actorName') || '').trim();
    if (!providerId) { setStatus('Enter Provider ID'); return; }
    const s: Session = { role: 'PROVIDER', providerId, actorName: actorName || undefined };
    saveSession(s);
    setSession(s);
    refresh(s);
  }

  function signOut() {
    clearSession();
    setSession(null);
    setJobs([]);
    setStatus('Signed out.');
  }

  if (!session) {
    return (
      <div className="min-h-screen" style={{ padding: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Provider Sign-In</h1>
        <form onSubmit={onSignIn} style={{ maxWidth: 420, display: 'grid', gap: 12 }}>
          <label>
            <div style={{ fontSize: 12, marginBottom: 6 }}>Provider ID</div>
            <input name="providerId" placeholder="e.g., ACME-MOVERS" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6 }} />
          </label>
          <label>
            <div style={{ fontSize: 12, marginBottom: 6 }}>Your Name (for audit)</div>
            <input name="actorName" placeholder="e.g., Jane Doe" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6 }} />
          </label>
          <button style={{ padding: '8px 12px', background: '#2563eb', color: 'white', borderRadius: 6 }}>Continue</button>
        </form>
        <p style={{ marginTop: 8, fontSize: 12 }}>{status}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>My Assigned Jobs</h1>
        <div style={{ fontSize: 12 }}>
          Provider: <b>{session.providerId}</b>{session.actorName ? <> &nbsp;|&nbsp; {session.actorName}</> : null}
          <button onClick={signOut} style={{ marginLeft: 12, color: '#2563eb', textDecoration: 'underline', background: 'none', border: 0 }}>
            Sign out
          </button>
        </div>
      </header>

      <p style={{ fontSize: 12, marginBottom: 12 }}>{status}</p>

      {jobs.length === 0 ? (
        <div style={{ color: '#666' }}>No jobs yet.</div>
      ) : (
        <ul style={{ display: 'grid', gap: 12 }}>
          {jobs.map(j => (
            <li key={j.jobNumber} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{j.jobNumber}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    Task Order: {j.taskOrderId ?? '—'} &nbsp; · &nbsp; Created: {j.createdAt ?? '—'}
                  </div>
                </div>
                <Link href={`/provider/${encodeURIComponent(j.jobNumber)}`} style={{ padding: '6px 10px', background: '#2563eb', color: 'white', borderRadius: 6 }}>
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
