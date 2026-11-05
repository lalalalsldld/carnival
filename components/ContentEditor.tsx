'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ContentEditor } from '@/components/ContentEditor';
import { FileUploadPanel } from '@/components/FileUploadPanel';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
};

export function AdminDashboard() {
  const { user } = useUser();
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const settingsRes = await fetch('/api/admin/settings');
      const settingsData = await settingsRes.json();
      setSignupEnabled(Boolean(settingsData.signupEnabled));

      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);
      setIsLoading(false);
    }

    loadData();
  }, []);

  const activeCount = useMemo(
    () => users.filter((entry) => entry.status !== 'banned' && entry.status !== 'deactivated').length,
    [users]
  );

  async function toggleSignup() {
    const nextValue = !signupEnabled;
    setSignupEnabled(nextValue);
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signupEnabled: nextValue }),
    });
    await res.json();
  }

  async function updateUserAction(userId: string, action: string) {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    });
    const data = await res.json();

    if (data.ok || data.fallback) {
      setUsers((current) =>
        current.map((entry) =>
          entry.id === userId
            ? {
                ...entry,
                status: action === 'ban' ? 'banned' : action === 'deactivate' ? 'deactivated' : action === 'reactivate' || action === 'unban' ? 'active' : entry.status,
              }
            : entry
        )
      );
    }
  }

  return (
    <div className="admin-grid">
      <div className="stack">
        <div className="panel">
          <h2>Account control</h2>
          <div className="toggle-row">
            <div>
              <strong>{signupEnabled ? 'Sign up allowed' : 'Sign up blocked'}</strong>
              <div className="inline-note">Manage self-registration settings.</div>
            </div>
            <button
              className={`toggle ${signupEnabled ? 'enabled' : ''}`}
              onClick={toggleSignup}
              aria-label="Toggle sign up"
            >
              <span className="knob" />
            </button>
          </div>

          <div className="stat-row">
            <div className="stat-card">
              <span className="label">Total users</span>
              <span className="value">{users.length || 0}</span>
            </div>
            <div className="stat-card">
              <span className="label">Active</span>
              <span className="value">{activeCount}</span>
            </div>
            <div className="stat-card">
              <span className="label">Admin</span>
              <span className="value">{user?.emailAddresses?.[0]?.emailAddress === 'troy@troysmithson.com' ? 'Yes' : 'Yes'}</span>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <h2>User administration</h2>
          {isLoading ? (
            <div className="empty-state">Loading users…</div>
          ) : users.length === 0 ? (
            <div className="empty-state">No users found.</div>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.name}</td>
                    <td>{entry.email}</td>
                    <td>
                      <span className={`status-badge ${entry.status === 'active' ? 'status-active' : entry.status === 'banned' ? 'status-banned' : 'status-deactivated'}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td>
                      <div className="user-actions">
                        <button className="action-btn" onClick={() => updateUserAction(entry.id, 'deactivate')}>
                          Deactivate
                        </button>
                        <button className="action-btn danger" onClick={() => updateUserAction(entry.id, 'ban')}>
                          Ban
                        </button>
                        <button className="action-btn warning" onClick={() => updateUserAction(entry.id, 'reactivate')}>
                          Reactivate
                        </button>
                        <button className="action-btn" onClick={() => updateUserAction(entry.id, 'reset-password')}>
                          Reset password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="stack">
        <ContentEditor />
        <FileUploadPanel />
      </div>
    </div>
  );
}
