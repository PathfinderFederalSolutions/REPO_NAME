'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { loadSession, type Session } from '@/lib/session';
import { getJob, listJobActivities, listJobArtifacts, uploadActivityArtifact, fetchLatestExtract } from '@/lib/docnorm';

type Activity = { id: string; name: string };
type Artifact = { artifactId: string; originalName: string; createdAt: string; providerId?: string; activityId?: string };

export default function JobWorkspacePage() {
  const params = useParams<{ jobNumber: string }>();
  const jobNumber = decodeURIComponent(String(params.jobNumber || ''));

  const [session, setSession] = useState<Session | null>(null);
  const [job, setJob] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [status, setStatus] = useState<string>('Loading…');
  const [preview, setPreview] = useState<{ artifactId: string; json: any } | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s || s.role !== 'PROVIDER' || !s.providerId) {
      setStatus('Please sign in as a Provider on /provider first.');
      return;
    }
    setSession(s);
    bootstrap(jobNumber);
  }, [jobNumber]);

  async function bootstrap(jn: string) {
    setStatus('Loading job details…');
    try {
      const [j, acts, arts] = await Promise.all([
        getJob(jn), listJobActivities(jn), listJobArtifacts(jn)
      ]);
      setJob(j);
      setActivities(acts);
      setArtifacts(arts);
      setStatus(`Ready. ${acts.length} activities · ${arts.length} artifacts`);
    } catch (e: any) {
      setStatus(`❌ ${e.message || 'Failed to load'}`);
    }
  }

  async function handleUpload(activityId: string, file: File) {
    setStatus(`Uploading to ${activityId}…`);
    try {
      await uploadActivityArtifact(jobNumber, activityId, file);
      const arts = await listJobArtifacts(jobNumber);
      setArtifacts(arts);
      setStatus('✅ Uploaded');
    } catch (e: any) {
      setStatus(`❌ ${e.message || 'Upload failed'}`);
    }
  }

  async function handlePreview(artifactId: string) {
    setStatus('Fetching latest normalized JSON…');
    try {
      const json = await fetchLatestExtract(artifactId);
      setPreview({ artifactId, json });
      setStatus('Preview updated.');
    } catch (e: any) {
      setStatus(`❌ ${e.message || 'Preview failed'}`);
    }
  }

  if (!session) {
    return <div style={{ padding: 24 }}>Please go to <a style={{ color: '#2563eb', textDecoration: 'underline' }} href="/provider">/provider</a> and sign in.</div>;
  }

  return (
    <div className="min-h-screen" style={{ padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Job {jobNumber}</h1>
          <div style={{ fontSize: 12, color: '#444' }}>
            Provider: <b>{session.providerId}</b>{session.actorName ? <> &nbsp;|&nbsp; {session.actorName}</> : null}
          </div>
        </div>
        <a href="/provider" style={{ color: '#2563eb', textDecoration: 'underline' }}>← Back to Jobs</a>
      </header>

      {/* Job Summary */}
      <section style={{ background: 'white', border: '1px solid #ddd', borderRadius: 8, padding: 12, marginTop: 16 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Job Summary</h2>
        {job ? (
          <div style={{ fontSize: 13, display: 'grid', gap: 4 }}>
            <div>Task Order: {job.taskOrderId ?? '—'}</div>
            <div>Member: {job.memberName ?? '—'} ({job.memberId ?? '—'})</div>
            <div>Contact: {job.memberPhone ?? '—'} · {job.memberEmail ?? '—'}</div>
            <div>Pickup: {job.pickupAddress ?? '—'}</div>
            <div>Delivery: {job.deliveryAddress ?? '—'}</div>
          </div>
        ) : <div style={{ color: '#666', fontSize: 13 }}>—</div>}
      </section>

      {/* Activities + Uploads */}
      <section style={{ background: 'white', border: '1px solid #ddd', borderRadius: 8, padding: 12, marginTop: 16 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Service Activities</h2>
        <ul style={{ display: 'grid', gap: 12 }}>
          {activities.map(a => (
            <li key={a.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600 }}>{a.name}</div>
                <label style={{ fontSize: 13 }}>
                  <span style={{ padding: '6px 10px', background: '#2563eb', color: 'white', borderRadius: 6, cursor: 'pointer' }}>Upload PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(a.id, file);
                      e.currentTarget.value = '';
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <ActivityArtifacts activityId={a.id} artifacts={artifacts} onPreview={handlePreview} />
            </li>
          ))}
        </ul>
      </section>

      {/* Preview JSON */}
      <section style={{ background: 'white', border: '1px solid #ddd', borderRadius: 8, padding: 12, marginTop: 16 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Latest Extract (Preview)</h2>
        {preview ? (
          <pre style={{ fontSize: 12, overflow: 'auto', background: '#f9fafb', border: '1px solid #eee', borderRadius: 6, padding: 12 }}>
            {JSON.stringify(preview.json, null, 2)}
          </pre>
        ) : (
          <div style={{ fontSize: 13, color: '#666' }}>Select an artifact to preview its latest normalized JSON.</div>
        )}
      </section>

      <p style={{ fontSize: 12, color: '#444', marginTop: 8 }}>{status}</p>
    </div>
  );
}

function ActivityArtifacts({
  activityId,
  artifacts,
  onPreview,
}: {
  activityId: string;
  artifacts: Artifact[];
  onPreview: (artifactId: string) => void;
}) {
  const filtered = artifacts.filter(a => (a.activityId || '') === activityId);
  if (filtered.length === 0) {
    return <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>No documents uploaded yet.</div>;
  }
  return (
    <ul style={{ marginTop: 10, display: 'grid', gap: 8 }}>
      {filtered.map(a => (
        <li key={a.artifactId} style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{a.originalName}</div>
            <div style={{ color: '#666' }}>Uploaded: {a.createdAt ?? '—'} · Provider: {a.providerId ?? '—'}</div>
          </div>
          <button onClick={() => onPreview(a.artifactId)} style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6 }}>
            Preview JSON
          </button>
        </li>
      ))}
    </ul>
  );
}
