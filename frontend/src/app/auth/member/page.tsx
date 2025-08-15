'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveSession, loadSession, type Session } from '@/lib/session';

export default function MemberAuthPage() {
  const qp = useSearchParams();
  const mode = qp.get('mode') === 'signup' ? 'signup' : 'signin';
  const router = useRouter();

  const [memberId, setMemberId] = useState('');
  const [memberName, setMemberName] = useState('');

  useEffect(() => {
    const s = loadSession();
    if (s?.role === 'MEMBER') router.push('/member');
  }, [router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const s: Session = {
      role: 'MEMBER',
      memberId: memberId.trim(),
      memberName: memberName || undefined,
    };
    // Real flow: backend credential check + MFA. Then return canonical memberId.
    saveSession(s);
    router.push('/member');
  }

  return (
    <div style={{ minHeight: '100vh', padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>
        Service Member {mode === 'signup' ? 'Account Creation' : 'Sign In'}
      </h1>
      <form onSubmit={onSubmit} style={{ marginTop: 12, display: 'grid', gap: 10, maxWidth: 460 }}>
        <label>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Member ID</div>
          <input value={memberId} onChange={e=>setMemberId(e.target.value)} placeholder="e.g., M-123456" style={inputStyle}/>
        </label>

        <label>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Full name</div>
          <input value={memberName} onChange={e=>setMemberName(e.target.value)} placeholder="e.g., Sgt. Chris Lee" style={inputStyle}/>
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
