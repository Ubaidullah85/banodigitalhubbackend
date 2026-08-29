'use client';

import { useCallback, useEffect, useState } from 'react';

const EMPTY = {
  title: '',
  description: '',
  image: '',
  tags: '',
  link: '',
  order: 100,
};

export default function ProjectsTab({ onAuthLost }) {
  const [projects, setProjects] = useState([]);
  const [usingDefaults, setUsingDefaults] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/projects', { cache: 'no-store' });
    if (res.status === 401) return onAuthLost();
    const data = await res.json();
    setProjects(data.projects || []);
    setUsingDefaults(Boolean(data.usingDefaults));
  }, [onAuthLost]);

  useEffect(() => {
    load();
  }, [load]);

  const say = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const reset = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          id: editingId,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (res.status === 401) return onAuthLost();
      const data = await res.json();

      if (!res.ok) {
        say('err', data.error || 'Could not save the project.');
        return;
      }
      say('ok', editingId ? 'Project updated — the home page is refreshed.' : 'Project added — it is live on the home page.');
      reset();
      load();
    } finally {
      setBusy(false);
    }
  };

  const edit = (p) => {
    setEditingId(p._id);
    setForm({
      title: p.title || '',
      description: p.description || '',
      image: p.image || '',
      tags: (p.tags || []).join(', '),
      link: p.link === '#' ? '' : p.link || '',
      order: p.order ?? 100,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (p) => {
    if (!confirm(`Remove "${p.title}" from the home page carousel?`)) return;
    const res = await fetch(`/api/admin/projects?id=${p._id}`, { method: 'DELETE' });
    if (res.status === 401) return onAuthLost();
    say('ok', 'Project removed.');
    if (editingId === p._id) reset();
    load();
  };

  const seed = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: true }),
      });
      if (res.status === 401) return onAuthLost();
      const data = await res.json();
      if (!res.ok) say('err', data.error || 'Import failed.');
      else {
        say('ok', `Imported ${data.seeded} existing projects — now editable.`);
        load();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {msg && <div className={`adm-note ${msg.type}`}>{msg.text}</div>}

      {usingDefaults && (
        <div className="adm-note warn">
          The home page is currently showing the four original built-in projects. Import them below
          to start editing, or just add a new project — the first one you add replaces the built-in
          list.
          <div style={{ marginTop: '10px' }}>
            <button className="adm-btn" onClick={seed} disabled={busy}>
              <i className="fas fa-download"></i> Import the 4 existing projects
            </button>
          </div>
        </div>
      )}

      <div className="adm-proj-grid">
        <form className="adm-card" onSubmit={submit}>
          <h2>{editingId ? 'Edit project' : 'Add a new project'}</h2>

          <div className="adm-field">
            <label htmlFor="p-title">Title</label>
            <input
              id="p-title"
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. Restaurant Website Revamp"
              required
            />
          </div>

          <div className="adm-field">
            <label htmlFor="p-desc">Description</label>
            <textarea
              id="p-desc"
              value={form.description}
              onChange={set('description')}
              placeholder="One or two lines about the result you delivered."
              required
            />
          </div>

          <div className="adm-field">
            <label htmlFor="p-img">Image URL</label>
            <input
              id="p-img"
              type="text"
              value={form.image}
              onChange={set('image')}
              placeholder="https://… or /my-project.jpg"
              required
            />
          </div>

          <div className="adm-field">
            <label htmlFor="p-tags">Tags (comma separated, max 6)</label>
            <input
              id="p-tags"
              type="text"
              value={form.tags}
              onChange={set('tags')}
              placeholder="Web Design, SEO, Branding"
            />
          </div>

          <div className="adm-field">
            <label htmlFor="p-link">Project link (optional)</label>
            <input
              id="p-link"
              type="text"
              value={form.link}
              onChange={set('link')}
              placeholder="https://client-website.com"
            />
          </div>

          <div className="adm-field">
            <label htmlFor="p-order">Sort order (lower shows first)</label>
            <input id="p-order" type="number" value={form.order} onChange={set('order')} />
          </div>

          <button className="adm-btn adm-btn-primary adm-btn-wide" type="submit" disabled={busy}>
            <i className={`fas ${busy ? 'fa-spinner fa-spin' : editingId ? 'fa-check' : 'fa-plus'}`}></i>
            {editingId ? 'Save changes' : 'Add project'}
          </button>

          {editingId && (
            <button
              type="button"
              className="adm-btn adm-btn-wide"
              style={{ marginTop: '10px' }}
              onClick={reset}
            >
              Cancel edit
            </button>
          )}
        </form>

        <div>
          <div className="adm-sectionhead" style={{ marginTop: 0 }}>
            <div>
              <h2>Home page carousel</h2>
              <p>{projects.length} project{projects.length === 1 ? '' : 's'} live</p>
            </div>
            <a className="adm-btn" href="/" target="_blank" rel="noreferrer">
              <i className="fas fa-arrow-up-right-from-square"></i> View site
            </a>
          </div>

          {!projects.length ? (
            <div className="adm-tablecard">
              <div className="adm-empty">
                <i className="fas fa-folder-open"></i>
                No projects saved in the database yet.
              </div>
            </div>
          ) : (
            <div className="adm-projlist">
              {projects.map((p) => (
                <div className="adm-projrow" key={p._id}>
                  <img src={p.image} alt="" />
                  <div className="adm-projmeta">
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    {!!(p.tags || []).length && (
                      <div className="adm-tagline">
                        {p.tags.map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="adm-actions">
                    <button className="adm-btn" onClick={() => edit(p)}>
                      <i className="fas fa-pen"></i> Edit
                    </button>
                    <button className="adm-btn adm-btn-icon" onClick={() => remove(p)} title="Delete">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
