'use client';

import { useEffect, useState } from 'react';
import { loadSession, clearSession, type Session } from '@/lib/session';

type MemberJob = { jobNumber: string; taskOrderId?: string; status?: string; createdAt?: string };

export default function MemberDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<string>('Loading…');
  const [jobs, setJobs] = useState<MemberJob[]>([]);

  useEffect(() => {
    const s = loadSession();
    if (!s || s.role !== 'MEMBER' || !s.memberId) { setStatus('Please sign in as Service Member.'); return; }
    setSession(s);
    refresh(s);
  }, []);

  async function refresh(s: Session) {
    setStatus('Loading your moves…');
    try {
      // Preferred endpoint when backend is ready:
      // GET /members/{memberId}/jobs
      const base = process.env.NEXT_PUBLIC_DOC_NORM_URL || 'http://localhost:8787';
      let res = await fetch(`${base}/members/${encodeURIComponent(s.memberId!)}/jobs`, { headers: { 'x-role': 'MEMBER' }});
      if (res.status === 404) {
        // fallback while endpoint isn’t there
        res = await fetch(`${base}/jobs?memberId=${encodeURIComponent(s.memberId!)}`, { headers: { 'x-role': 'MEMBER' }});
      }
      const data = res.ok ? await res.json() : [];
      setJobs(Array.isArray(data) ? data : []);
      setStatus(`Ready. ${Array.isArray(data) ? data.length : 0} move(s).`);
    } catch (e: any) {
      setStatus(`❌ ${e.message || 'Failed to load moves'}`);
    }
  }

  function signOut() { clearSession(); setSession(null); setJobs([]); setStatus('Signed out.'); }

  if (!session) return <div style={{ padding: 24 }}>Please <a href="/auth/member" style={{ color: '#2563eb' }}>sign in</a>.</div>;

  return (
    <div style={{ minHeight: '100vh', padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>My Moves</h1>
          <div style={{ fontSize: 12, color: '#444' }}>
            {session.memberName ?? 'Member'} · ID: <b>{session.memberId}</b>
          </div>
        </div>
        <a href="/signin" onClick={(e)=>{e.preventDefault();signOut();}} style={{ color: '#2563eb' }}>Sign out</a>
      </header>

      <p style={{ marginTop: 8, fontSize: 12 }}>{status}</p>

      <section style={{ marginTop: 12, border: '1px solid #ddd', borderRadius: 8, background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={th}>Job Number</th>
              <th style={th}>Task Order</th>
              <th style={th}>Status</th>
              <th style={th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 12, color: '#666' }}>No moves yet.</td></tr>
            ) : jobs.map(j => (
              <tr key={j.jobNumber}>
                <td style={td}><code>{j.jobNumber}</code></td>
                <td style={td}>{j.taskOrderId ?? '—'}</td>
                <td style={td}>{j.status ?? '—'}</td>
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
