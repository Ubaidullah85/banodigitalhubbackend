'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { COURSE } from '@/lib/config';
import { apiFetch } from '@/lib/api';

const STATUSES = ['new', 'contacted', 'shortlisted', 'enrolled', 'rejected'];

const STATUS_LABEL = {
  new: 'New',
  contacted: 'Contacted',
  shortlisted: 'Shortlisted',
  enrolled: 'Enrolled',
  rejected: 'Rejected',
};

/** Pre-written WhatsApp message so one click opens a ready-to-send chat. */
function waMessage(s) {
  const first = (s.fullName || '').split(' ')[0];
  return (
    `Assalam-o-Alaikum ${first},\n\n` +
    `This is Bano Digital Hub regarding your application for our ${COURSE.durationWeeks}-week course.\n\n` +
    `Your interview / test call is scheduled for ${COURSE.interviewDate}, from ${COURSE.interviewWindow}. ` +
    `Please stay connected during this time.\n\n` +
    `Classes start on ${COURSE.classesStart}.\n\n` +
    `Thank you!`
  );
}

function mailtoLink(s) {
  const subject = `Bano Digital Hub — your interview call on ${COURSE.interviewDate}`;
  const body =
    `Assalam-o-Alaikum ${(s.fullName || '').split(' ')[0]},\n\n` +
    `Thank you for applying to the Bano Digital Hub course.\n\n` +
    `Your interview / test call is scheduled for ${COURSE.interviewDate}, from ${COURSE.interviewWindow}. ` +
    `Please stay connected and keep your phone active.\n\n` +
    `Classes start on ${COURSE.classesStart}.\n\n` +
    `Regards,\nBano Digital Hub\n${COURSE.supportPhone}`;
  return `mailto:${s.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function StudentsTab({ onAuthLost }) {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');
  const [exporting, setExporting] = useState('');
  const [health, setHealth] = useState(null);
  const [testing, setTesting] = useState(false);
  const reqId = useRef(0);

  const load = useCallback(
    async (search, filter) => {
      const id = ++reqId.current;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        if (filter) params.set('status', filter);
        const res = await apiFetch(`/api/admin/students?${params}`, { cache: 'no-store' });

        if (res.status === 401) return onAuthLost();
        const data = await res.json();
        if (id !== reqId.current) return; // a newer search already won

        if (!res.ok) {
          setError(data.error || 'Could not load applications.');
        } else {
          setError(data.dbMissing ? 'MONGODB_URI is not set — no data can be loaded yet.' : '');
          setStudents(data.students || []);
          setStats(data.stats);
        }
      } catch {
        setError('Network error while loading applications.');
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    },
    [onAuthLost]
  );

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => load(q, status), q ? 300 : 0);
    return () => clearTimeout(t);
  }, [q, status, load]);

  const say = (msg) => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 2500);
  };

  const patch = async (id, changes) => {
    setStudents((list) => list.map((s) => (s._id === id ? { ...s, ...changes } : s)));
    const res = await apiFetch('/api/admin/students', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...changes }),
    });
    if (res.status === 401) onAuthLost();
    else if (!res.ok) {
      say('Update failed — reloading.');
      load(q, status);
    }
  };

  const remove = async (s) => {
    if (!confirm(`Delete the application of ${s.fullName}? This cannot be undone.`)) return;
    setStudents((list) => list.filter((x) => x._id !== s._id));
    const res = await apiFetch(`/api/admin/students?id=${s._id}`, { method: 'DELETE' });
    if (res.status === 401) onAuthLost();
    else say('Application deleted.');
  };

  /** One click -> file on disk. `format` is 'csv' or 'xlsx'. */
  const download = async (format) => {
    setExporting(format);
    try {
      const res = await apiFetch(`/api/admin/export?format=${format}`, { cache: 'no-store' });
      if (res.status === 401) return onAuthLost();
      if (!res.ok) return say('Export failed.');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bdh-students-${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      say(format === 'xlsx' ? 'Excel file downloaded.' : 'CSV downloaded.');
    } catch {
      say('Export failed.');
    } finally {
      setExporting('');
    }
  };

  const loadStatus = useCallback(async () => {
    try {
      const res = await apiFetch('/api/admin/status', { cache: 'no-store' });
      if (res.status === 401) return onAuthLost();
      setHealth(await res.json());
    } catch {
      /* the banner just stays hidden */
    }
  }, [onAuthLost]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const sendTestEmail = async () => {
    setTesting(true);
    try {
      const res = await apiFetch('/api/admin/status', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      say(res.ok ? `Test email sent to ${data.to}.` : data.error || 'Test email failed.');
    } finally {
      setTesting(false);
    }
  };

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      say(`${label} copied.`);
    } catch {
      say('Could not copy.');
    }
  };

  const cards = useMemo(() => {
    const by = stats?.byStatus || {};
    return [
      { label: 'Total', value: stats?.total ?? 0, hl: true },
      { label: 'New', value: by.new ?? 0 },
      { label: 'Contacted', value: by.contacted ?? 0 },
      { label: 'Shortlisted', value: by.shortlisted ?? 0 },
      { label: 'Enrolled', value: by.enrolled ?? 0 },
      { label: 'Has laptop', value: stats?.withLaptop ?? 0 },
    ];
  }, [stats]);

  return (
    <>
      <div className="adm-stats">
        {cards.map((c) => (
          <div className={`adm-stat${c.hl ? ' hl' : ''}`} key={c.label}>
            <b>{c.value}</b>
            <span>{c.label}</span>
          </div>
        ))}
      </div>

      {health && (
        <div className="adm-health">
          <span className={`adm-chip ${health.db.connected ? 'ok' : 'bad'}`}>
            <i className="fas fa-database"></i>
            {health.db.connected
              ? `Database connected · ${health.db.students} saved`
              : health.db.configured
                ? `Database error: ${health.db.error}`
                : 'MONGODB_URI not set'}
          </span>

          <span className={`adm-chip ${health.mail.verified ? 'ok' : 'bad'}`}>
            <i className="fas fa-envelope"></i>
            {health.mail.verified
              ? `Gmail ready · ${health.mail.user}`
              : `Email off: ${health.mail.error}`}
          </span>

          <span className={`adm-chip ${health.guide.present ? 'ok' : 'warn'}`}>
            <i className="fas fa-file-pdf"></i>
            {health.guide.present ? 'Enrollment guide ready' : 'Enrollment guide PDF missing'}
          </span>

          <button className="adm-btn adm-btn-sm" onClick={sendTestEmail} disabled={testing}>
            <i className={`fas ${testing ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
            Send test email
          </button>
        </div>
      )}

      {error && <div className="adm-note err">{error}</div>}
      {flash && <div className="adm-note ok">{flash}</div>}

      <div className="adm-toolbar">
        <div className="adm-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name, email, phone, WhatsApp or CNIC"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <select
          className="adm-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <button
          className="adm-btn"
          onClick={() => {
            load(q, status);
            loadStatus();
          }}
          disabled={loading}
        >
          <i className={`fas fa-rotate${loading ? ' fa-spin' : ''}`}></i> Refresh
        </button>

        <button
          className="adm-btn adm-btn-excel"
          onClick={() => download('xlsx')}
          disabled={Boolean(exporting)}
        >
          <i className={`fas ${exporting === 'xlsx' ? 'fa-spinner fa-spin' : 'fa-file-excel'}`}></i>
          Excel
        </button>

        <button
          className="adm-btn adm-btn-primary"
          onClick={() => download('csv')}
          disabled={Boolean(exporting)}
        >
          <i className={`fas ${exporting === 'csv' ? 'fa-spinner fa-spin' : 'fa-file-csv'}`}></i>
          CSV
        </button>
      </div>

      <div className="adm-tablecard">
        {loading && !students.length ? (
          <div className="adm-empty">
            <i className="fas fa-spinner fa-spin"></i>
            Loading applications…
          </div>
        ) : !students.length ? (
          <div className="adm-empty">
            <i className="fas fa-inbox"></i>
            {q || status
              ? 'No applications match this search.'
              : 'No applications yet. They will appear here the moment a student submits the course form.'}
          </div>
        ) : (
          <div className="adm-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Contact</th>
                  <th>CNIC</th>
                  <th>Study level</th>
                  <th>Laptop</th>
                  <th>Status</th>
                  <th>Reach out</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    {/* data-label drives the phone layout: under 860px the table
                        collapses into one labelled card per applicant. */}
                    <td data-label="Student">
                      <span className="adm-name">{s.fullName}</span>
                      <span className="adm-sub">
                        {s.age} yrs · {s.gender} ·{' '}
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-GB') : '—'}
                      </span>
                    </td>

                    <td data-label="Contact">
                      <button
                        className="adm-copy"
                        onClick={() => copy(s.email, 'Email')}
                        title="Click to copy"
                      >
                        {s.email}
                      </button>
                      <span className="adm-sub">
                        <button
                          className="adm-copy"
                          onClick={() => copy(s.whatsappRaw || s.whatsapp, 'WhatsApp number')}
                          title="Click to copy"
                        >
                          <i className="fab fa-whatsapp"></i> {s.whatsappRaw || s.whatsapp}
                        </button>
                        {(s.phoneRaw || s.phone) !== (s.whatsappRaw || s.whatsapp) && (
                          <>
                            {' · '}
                            <button
                              className="adm-copy"
                              onClick={() => copy(s.phoneRaw || s.phone, 'Mobile number')}
                              title="Click to copy"
                            >
                              <i className="fas fa-phone"></i> {s.phoneRaw || s.phone}
                            </button>
                          </>
                        )}
                      </span>
                    </td>

                    <td data-label="CNIC">{s.cnic}</td>
                    <td data-label="Study level">{s.studyLevel}</td>

                    <td data-label="Laptop">
                      <span className={`adm-pill ${s.laptop ? 'yes' : 'no'}`}>
                        {s.laptop ? 'Yes' : 'No'}
                      </span>
                    </td>

                    <td data-label="Status">
                      <select
                        className="adm-status"
                        data-v={s.status || 'new'}
                        value={s.status || 'new'}
                        onChange={(e) => patch(s._id, { status: e.target.value })}
                      >
                        {STATUSES.map((v) => (
                          <option key={v} value={v}>
                            {STATUS_LABEL[v]}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td data-label="Reach out">
                      <div className="adm-actions">
                        <a
                          className="adm-btn adm-btn-wa"
                          href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent(waMessage(s))}`}
                          target="_blank"
                          rel="noreferrer"
                          title={`WhatsApp ${s.whatsappRaw || s.whatsapp}`}
                          onClick={() => {
                            if ((s.status || 'new') === 'new') patch(s._id, { status: 'contacted' });
                          }}
                        >
                          <i className="fab fa-whatsapp"></i> WhatsApp
                        </a>

                        <a
                          className="adm-btn adm-btn-mail"
                          href={mailtoLink(s)}
                          title={`Email ${s.email}`}
                        >
                          <i className="fas fa-envelope"></i> Email
                        </a>
                      </div>
                    </td>

                    <td data-label="">
                      <button
                        className="adm-btn adm-btn-icon"
                        onClick={() => remove(s)}
                        title="Delete application"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
