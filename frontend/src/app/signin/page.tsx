'use client';

import { useRouter } from 'next/navigation';

export default function SignInLanding() {
  const router = useRouter();

  const Card = ({ title, desc, onClick, createHref }: { title: string; desc: string; onClick: () => void; createHref: string }) => (
    <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 16, background: 'white' }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <p style={{ color: '#555', marginTop: 8 }}>{desc}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClick} style={{ padding: '8px 12px', background: '#2563eb', color: 'white', borderRadius: 8 }}>Sign in</button>
        <a href={createHref} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 8 }}>Create account</a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Sign in</h1>
      <p style={{ color: '#555', marginBottom: 16 }}>Choose your role to continue.</p>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <Card
          title="USTRANSCOM"
          desc="Regional and global dashboards with oversight of household goods moves."
          onClick={() => router.push('/auth/transcom')}
          createHref="/auth/transcom?mode=signup"
        />
        <Card
          title="Service Provider"
          desc="Company dashboard, assigned jobs, activity uploads, and audit trails."
          onClick={() => router.push('/auth/provider')}
          createHref="/auth/provider?mode=signup"
        />
        <Card
          title="Service Member"
          desc="Your historical and in‑flight moves with document visibility."
          onClick={() => router.push('/auth/member')}
          createHref="/auth/member?mode=signup"
        />
      </div>
    </div>
  );
}
