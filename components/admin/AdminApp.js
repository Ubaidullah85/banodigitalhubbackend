'use client';

import { useCallback, useEffect, useState } from 'react';
import StudentsTab from './StudentsTab';
import ProjectsTab from './ProjectsTab';

export default function AdminApp() {
  const [authed, setAuthed] = useState(null); // null = still checking
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('students');

  useEffect(() => {
    fetch('/api/admin/session', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authed)))
      .catch(() => setAuthed(false));
  }, []);

  const onAuthLost = useCallback(() => {
    setAuthed(false);
    setError('Your session expired. Please sign in again.');
  }, []);

  const login = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Sign in failed.');
        return;
      }
      setPassword('');
      setAuthed(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthed(false);
  };

  if (authed === null) {
    return (
      <div className="adm">
        <div className="adm-login">
          <div className="adm-login-card">
            <div className="adm-mark">BD</div>
            <p style={{ margin: 0 }}>Checking your session…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="adm">
        <div className="adm-login">
          <form className="adm-login-card" onSubmit={login}>
            <div className="adm-mark">BD</div>
            <h1>Admin Panel</h1>
            <p>Bano Digital Hub — course applications and projects</p>

            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
              required
            />

            {error && (
              <div className="adm-note err" style={{ marginTop: '14px', marginBottom: 0 }}>
                {error}
              </div>
            )}

            <button
              className="adm-btn adm-btn-primary adm-btn-wide"
              type="submit"
              disabled={busy}
              style={{ marginTop: '16px' }}
            >
              {busy && <i className="fas fa-spinner fa-spin"></i>}
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-top-inner">
          <div className="adm-brandline">
            <span className="adm-mark">BD</span>
            Bano Digital Hub
          </div>

          <div className="adm-tabs">
            <button
              className={tab === 'students' ? 'on' : ''}
              onClick={() => setTab('students')}
            >
              <i className="fas fa-users"></i> Students
            </button>
            <button
              className={tab === 'projects' ? 'on' : ''}
              onClick={() => setTab('projects')}
            >
              <i className="fas fa-briefcase"></i> Projects
            </button>
          </div>

          <button className="adm-btn adm-btn-sm" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="adm-shell">
        {tab === 'students' ? (
          <StudentsTab onAuthLost={onAuthLost} />
        ) : (
          <ProjectsTab onAuthLost={onAuthLost} />
        )}
      </div>
    </div>
  );
}
