'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveSession, loadSession, type Session } from '@/lib/session';

export default function ProviderAuthPage() {
  const qp = useSearchParams();
  const mode = qp.get('mode') === 'signup' ? 'signup' : 'signin';
  const router = useRouter();

  const [providerId, setProviderId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [actorName, setActorName] = useState('');
  const [providerRole, setProviderRole] = useState<'OWNER'|'MANAGER'|'COORDINATOR'|'OPERATOR'>('COORDINATOR');

  useEffect(() => {
    const s = loadSession();
    if (s?.role === 'PROVIDER') router.push('/provider');
  }, [router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const s: Session = {
      role: 'PROVIDER',
      providerId: providerId.trim(),
      actorName: actorName || undefined,
      providerRole,
    };
    // Real flow: Call backend to verify creds / provision company; receive canonical providerId + role.
    saveSession(s);
    router.push('/provider');
  }

  return (
    <div style={{ minHeight: '100vh', padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>
        Service Provider {mode === 'signup' ? 'Account Creation' : 'Sign In'}
      </h1>
      <form onSubmit={onSubmit} style={{ marginTop: 12, display: 'grid', gap: 10, maxWidth: 460 }}>
        <label>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Company ID (exact)</div>
          <input value={providerId} onChange={e=>setProviderId(e.target.value)} placeholder="e.g., ACME-MOVERS" style={inputStyle}/>
        </label>

        {mode === 'signup' && (
          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>Company legal name</div>
            <input value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="e.g., ACME Moving & Storage LLC" style={inputStyle}/>
          </label>
        )}

        <label>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Your name (for audit)</div>
          <input value={actorName} onChange={e=>setActorName(e.target.value)} placeholder="e.g., Jane Doe" style={inputStyle}/>
        </label>

        <label>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Access level</div>
          <select value={providerRole} onChange={e=>setProviderRole(e.target.value as any)} style={inputStyle}>
            <option value="OWNER">Owner</option>
            <option value="MANAGER">Manager</option>
            <option value="COORDINATOR">Coordinator</option>
            <option value="OPERATOR">Operator / Driver</option>
          </select>
        </label>

        <button style={primaryBtn}>
          {mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
        <a href="/signin" style={{ fontSize: 12, color: '#2563eb' }}>Back</a>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 8 };
const primaryBtn: React.CSSProperties = { padding: '8px 12px', background: '#2563eb', color: 'white', borderRadius: 8 };
