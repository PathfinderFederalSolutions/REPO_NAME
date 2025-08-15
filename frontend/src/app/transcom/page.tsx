'use client';

import { useEffect, useState } from 'react';
import { loadSession, clearSession, type Session, type RegionCode } from '@/lib/session';

type JobRow = { jobNumber: string; taskOrderId?: string; region?: RegionCode; memberName?: string; createdAt?: string };

export default function TranscomDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<string>('Loading…');
  const [jobs, setJobs] = useState<JobRow[]>([]);

  useEffect(() => {
    const s = loadSession();
    if (!s || s.role !== 'USTRANSCOM') { setStatus('Please sign in as USTRANSCOM.'); return; }
    setSession(s);
    refresh(s);
  }, []);

  async function refresh(s: Session) {
    setStatus('Loading jobs…');
    try {
      // When backend is ready, use real endpoints like:
      // /jobs?scope=GLOBAL or /jobs?region=CONUS-EAST
      // For now we just try a generic /jobs and fall back to empty.
      const q = s.transcomScope === 'GLOBAL' ? '' : `?region=${encodeURIComponent(s.transcomRegion || 'CONUS-EAST')}`;
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOC_NORM_URL || 'http://localhost:8787'}/jobs${q}`, {
        headers: { 'x-role': 'USTRANSCOM' },
      });
      const data = res.ok ? await res.json() : [];
      setJobs(Array.isArray(data) ? data : []);
      setStatus(`Ready. ${Array.isArray(data) ? data.length : 0} job(s).`);
    } catch (e: any) {
      setStatus(`❌ ${e.message || 'Failed to load jobs'}`);
    }
  }

  function signOut() { clearSession(); setSession(null); setJobs([]); setStatus('Signed out.'); }

  if (!session) return <div style={{ padding: 24 }}>Please <a href="/auth/transcom" style={{ color: '#2563eb' }}>sign in</a>.</div>;

  return (
    <div style={{ minHeight: '100vh', padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>USTRANSCOM Dashboard</h1>
          <div style={{ fontSize: 12, color: '#444' }}>
            Scope: <b>{session.transcomScope}</b>
            {session.transcomScope === 'REGION' ? <> · Region: <b>{session.transcomRegion}</b></> : null}
          </div>
        </div>
        <div>
          <a href="/signin" onClick={(e)=>{e.preventDefault();signOut();}} style={{ color: '#2563eb' }}>Sign out</a>
        </div>
      </header>

      <p style={{ marginTop: 8, fontSize: 12 }}>{status}</p>

      <section style={{ marginTop: 12, border: '1px solid #ddd', borderRadius: 8, background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={th}>Job Number</th>
              <th style={th}>Task Order</th>
              <th style={th}>Region</th>
              <th style={th}>Member</th>
              <th style={th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 12, color: '#666' }}>No jobs visible{session.transcomScope==='REGION'?' for this region.':' .'}</td></tr>
            ) : jobs.map((j) => (
              <tr key={j.jobNumber}>
                <td style={td}><code>{j.jobNumber}</code></td>
                <td style={td}>{j.taskOrderId ?? '—'}</td>
                <td style={td}>{j.region ?? '—'}</td>
                <td style={td}>{j.memberName ?? '—'}</td>
                <td style={td}>{j.createdAt ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 12 };
const td: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 13 };
