'use client';

import { useEffect, useMemo, useState } from 'react';
import { ContentEditor } from '@/components/ContentEditor';

type UserRecord = { id: string; name: string; email: string; status: string; createdAt: string };

export function AdminDashboard() {
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [settingsResponse, usersResponse] = await Promise.all([fetch('/api/admin/settings'), fetch('/api/admin/users')]);
        const settings = await settingsResponse.json(); const userData = await usersResponse.json();
        if (!settingsResponse.ok || !usersResponse.ok) throw new Error(settings.error || userData.error || 'Could not load admin data.');
        setSignupEnabled(Boolean(settings.signupEnabled)); setUsers(userData.users || []);
      } catch (e) { setError(e instanceof Error ? e.message : 'Could not load admin data.'); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const activeCount = useMemo(() => users.filter((entry) => entry.status === 'active').length, [users]);

  async function toggleSignup() {
    setError(''); setNotice('');
    const response = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ signupEnabled: !signupEnabled }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error || 'Could not update signup settings.');
    setSignupEnabled(data.signupEnabled); setNotice(`Sign-up is now ${data.signupEnabled ? 'open' : 'closed'}.`);
  }

  async function updateUserAction(userId: string, action: string) {
    setError(''); setNotice(''); setBusy(`${userId}:${action}`);
    try {
      const response = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Action failed.');
      if (data.status && data.status !== 'reset-flow') setUsers((current) => current.map((entry) => entry.id === userId ? { ...entry, status: data.status } : entry));
      setNotice(action === 'reset-password' ? 'Clerk handles password reset through its sign-in flow. Ask the user to choose “Forgot password”.' : `Account ${data.status}.`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Action failed.'); }
    finally { setBusy(null); }
  }

  return <main className="admin-page">
    <div className="admin-heading"><div><div className="eyebrow">CONTROL CENTER <span className="live-dot"/> SECURE SESSION</div><h1>Workspace overview</h1><p>Manage access, accounts, and your public homepage.</p></div><div className="admin-mark">C<span>·</span></div></div>
    {(error || notice) && <div role="status" className={`feedback ${error ? 'feedback-error' : ''}`}>{error || notice}</div>}
    <div className="stat-row dashboard-stats"><div className="stat-card"><span className="label">Directory</span><span className="value">{isLoading ? '—' : users.length}</span><span className="stat-hint">registered accounts</span></div><div className="stat-card"><span className="label">Active access</span><span className="value">{isLoading ? '—' : activeCount}</span><span className="stat-hint">currently enabled</span></div><div className="stat-card"><span className="label">Registration</span><span className="value small-value">{signupEnabled ? 'Open' : 'Closed'}</span><span className="stat-hint">public sign-up</span></div></div>
    <div className="admin-grid">
      <div className="stack">
        <section className="panel control-panel"><div className="section-title"><div><div className="eyebrow">ACCESS POLICY</div><h2>Registration</h2></div><span className={`status-badge ${signupEnabled ? 'status-active' : 'status-deactivated'}`}>{signupEnabled ? 'Accepting users' : 'Invite only'}</span></div><p className="section-copy">Control whether new accounts can be created through the public sign-up page.</p><div className="toggle-row"><div><strong>{signupEnabled ? 'Allow new sign-ups' : 'Block new sign-ups'}</strong><div className="inline-note">Existing accounts are unaffected.</div></div><button type="button" className={`toggle ${signupEnabled ? 'enabled' : ''}`} onClick={toggleSignup} aria-pressed={signupEnabled} aria-label="Toggle sign up"><span className="knob"/></button></div></section>
        <section className="table-wrap users-panel"><div className="section-title"><div><div className="eyebrow">IDENTITIES</div><h2>User directory</h2></div><span className="directory-count">{users.length} accounts</span></div>{isLoading ? <div className="empty-state">Loading directory…</div> : users.length === 0 ? <div className="empty-state">No users found.</div> : <div className="table-scroll"><table className="user-table"><thead><tr><th>User</th><th>Status</th><th>Actions</th></tr></thead><tbody>{users.map((entry) => <tr key={entry.id}><td><strong>{entry.name}</strong><span className="user-email">{entry.email}</span></td><td><span className={`status-badge ${entry.status === 'active' ? 'status-active' : entry.status === 'banned' ? 'status-banned' : 'status-deactivated'}`}>{entry.status}</span></td><td><div className="user-actions">{entry.status === 'active' && <button disabled={busy !== null} className="action-btn warning" onClick={() => updateUserAction(entry.id, 'deactivate')}>Deactivate</button>}{entry.status !== 'banned' && <button disabled={busy !== null} className="action-btn danger" onClick={() => updateUserAction(entry.id, 'ban')}>Ban</button>}{entry.status !== 'active' && <button disabled={busy !== null} className="action-btn" onClick={() => updateUserAction(entry.id, 'reactivate')}>Reactivate</button>}<button disabled={busy !== null} className="action-btn" onClick={() => updateUserAction(entry.id, 'reset-password')}>Password reset</button></div></td></tr>)}</tbody></table></div>}</section>
      </div>
      <div className="stack"><ContentEditor/><section className="file-panel disabled-feature"><span className="eyebrow">STORAGE</span><h2>Uploads disabled</h2><p className="inline-note">Upload endpoints are disabled. No files are accepted or stored.</p></section></div>
    </div>
    <footer className="security-foot"><span className="security-icon">✓</span><span><strong>Protected by server-side checks</strong><br/>Every administrative request is verified against the signed-in Clerk identity.</span></footer>
  </main>;
}
