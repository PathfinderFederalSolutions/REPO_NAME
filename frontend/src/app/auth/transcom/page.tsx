'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveSession, loadSession, type Session, type RegionCode, type TranscomScope } from '@/lib/session';

const REGIONS: RegionCode[] = ['CONUS-EAST','CONUS-WEST','EUCOM','PACOM','CENTCOM','OTHER'];

export default function TranscomAuthPage() {
  const qp = useSearchParams();
  const mode = qp.get('mode') === 'signup' ? 'signup' : 'signin';
  const router = useRouter();

  const [region, setRegion] = useState<RegionCode>('CONUS-EAST');
  const [scope, setScope] = useState<TranscomScope>('REGION');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const s = loadSession();
    if (s?.role === 'USTRANSCOM') router.push('/transcom');
  }, [router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const s: Session = {
      role: 'USTRANSCOM',
      transcomRegion: region,
      transcomScope: scope,
      actorName: name || undefined,
    };
    // In real life: call backend; verify email/password; receive scopes.
    saveSession(s);
    router.push('/transcom');
  }

  return (
    <div style={{ minHeight: '100vh', padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>
        USTRANSCOM {mode === 'signup' ? 'Account Creation' : 'Sign In'}
      </h1>
      <form onSubmit={onSubmit} style={{ marginTop: 12, display: 'grid', gap: 10, maxWidth: 460 }}>
        <label>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Full name</div>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g., Capt. Alex Smith" style={inputStyle}/>
        </label>

        {mode === 'signup' && (
          <label>
            <div style={{ fontSize: 12, marginBottom: 4 }}>Email</div>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@ustranscom.mil" style={inputStyle}/>
          </label>
        )}

        <label>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Scope</div>
          <select value={scope} onChange={e=>setScope(e.target.value as TranscomScope)} style={inputStyle}>
            <option value="REGION">Region‑only (default)</option>
            <option value="GLOBAL">Global (all regions)</option>
          </select>
        </label>

        <label>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Assigned region</div>
          <select value={region} onChange={e=>setRegion(e.target.value as RegionCode)} style={inputStyle}>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
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
