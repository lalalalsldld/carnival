'use client';

import { useEffect, useMemo, useState } from 'react';
import { ContentEditor } from '@/components/ContentEditor';

type UserRecord = { id: string; name: string; email: string; status: string; createdAt: string };

export function AdminDashboard() {
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [settingsResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/settings'), fetch('/api/admin/users'),
      ]);
      const settings = await settingsResponse.json();
      const userData = await usersResponse.json();
      if (!settingsResponse.ok || !usersResponse.ok) setError(settings.error || userData.error || 'Could not load admin data.');
      setSignupEnabled(Boolean(settings.signupEnabled));
      setUsers(userData.users || []);
      setIsLoading(false);
    })();
  }, []);

  const activeCount = useMemo(() => users.filter((entry) => entry.status === 'active').length, [users]);

  async function toggleSignup() {
    setError('');
    const response = await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signupEnabled: !signupEnabled }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error || 'Could not update signup settings.');
    setSignupEnabled(data.signupEnabled);
  }

  async function updateUserAction(userId: string, action: string) {
    setError('');
    setBusy(`${userId}:${action}`);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Action failed.');
      if (data.status) setUsers((current) => current.map((entry) => entry.id === userId ? { ...entry, status: data.status } : entry));
      if (action === 'reset-password') setError('Password-reset instructions sent by email.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setBusy(null);
    }
  }

  return <div className="admin-grid">
    <div className="stack">
      <section className="panel">
        <h2>Account control</h2>
        <div className="toggle-row">
          <div><strong>{signupEnabled ? 'Sign up allowed' : 'Sign up blocked'}</strong><div className="inline-note">Controls the app’s signup page.</div></div>
          <button type="button" className={`toggle ${signupEnabled ? 'enabled' : ''}`} onClick={toggleSignup} aria-pressed={signupEnabled} aria-label="Toggle sign up"><span className="knob" /></button>
        </div>
        <div className="stat-row">
          <div className="stat-card"><span className="label">Total users</span><span className="value">{users.length}</span></div>
          <div className="stat-card"><span className="label">Active</span><span className="value">{activeCount}</span></div>
          <div className="stat-card"><span className="label">Uploads</span><span className="value">Disabled</span></div>
        </div>
      </section>
      <section className="table-wrap">
        <h2>User administration</h2>
        {error && <p role="status" className="inline-note">{error}</p>}
        {isLoading ? <div className="empty-state">Loading users…</div> : users.length === 0 ? <div className="empty-state">No users found.</div> :
          <table className="user-table"><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            {users.map((entry) => <tr key={entry.id}><td>{entry.name}</td><td>{entry.email}</td><td><span className={`status-badge ${entry.status === 'active' ? 'status-active' : entry.status === 'banned' ? 'status-banned' : 'status-deactivated'}`}>{entry.status}</span></td><td>
              <div className="user-actions">
                {entry.status === 'active' && <button disabled={busy !== null} className="action-btn warning" onClick={() => updateUserAction(entry.id, 'deactivate')}>Deactivate</button>}
                {entry.status !== 'banned' && <button disabled={busy !== null} className="action-btn danger" onClick={() => updateUserAction(entry.id, 'ban')}>Ban</button>}
                {entry.status !== 'active' && <button disabled={busy !== null} className="action-btn warning" onClick={() => updateUserAction(entry.id, 'reactivate')}>Reactivate</button>}
                <button disabled={busy !== null} className="action-btn" onClick={() => updateUserAction(entry.id, 'reset-password')}>Send reset email</button>
              </div>
            </td></tr>)}
          </tbody></table>}
      </section>
    </div>
    <div className="stack"><ContentEditor /><section className="file-panel"><h2>File uploads removed</h2><p className="inline-note">File upload endpoints are disabled and the upload panel has been removed.</p></section></div>
  </div>;
}
