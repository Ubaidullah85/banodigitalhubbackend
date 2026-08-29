'use client';

import { useState } from 'react';
import { COURSE, GENDERS, STUDY_LEVELS } from '@/lib/config';
import { apiFetch } from '@/lib/api';

const EMPTY = {
  fullName: '',
  email: '',
  phone: '',
  whatsapp: '',
  cnic: '',
  age: '',
  gender: '',
  studyLevel: '',
  laptop: false,
};

/** Digits only, so "0329-459-0286" and "+92 329 4590286" both normalise. */
const digits = (v) => (v || '').replace(/\D/g, '');

function validate(f) {
  if (f.fullName.trim().length < 3) return 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()))
    return 'Please enter a valid email address — your confirmation is sent there.';
  if (digits(f.phone).length < 10) return 'Please enter a valid mobile number.';
  if (digits(f.whatsapp).length < 10) return 'Please enter a valid WhatsApp number.';
  if (digits(f.cnic).length !== 13) return 'CNIC must be 13 digits (e.g. 35202-1234567-1).';
  const age = Number(f.age);
  if (!Number.isFinite(age) || age < 14 || age > 60) return 'Please enter an age between 14 and 60.';
  if (!f.gender) return 'Please select your gender.';
  if (!f.studyLevel) return 'Please select your current study level.';
  return null;
}

export default function EnrollForm() {
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const problem = validate(form);
    if (problem) {
      setError(problem);
      return;
    }

    setError('');
    setSending(true);
    try {
      const res = await apiFetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setSending(false);
        return;
      }

      setDone(data);
      window.scrollTo({
        top: document.getElementById('enroll').offsetTop - 100,
        behavior: 'smooth',
      });
    } catch {
      setError('Network error. Please check your connection and try again.');
    }
    setSending(false);
  };

  if (done) {
    return (
      <div className="crs-formwrap" id="enroll-result">
        <div className="crs-success">
          <div className="crs-success-icon">
            <i className="fas fa-check"></i>
          </div>

          <h3>Submitted — now check your email</h3>

          <p>
            Thank you, {form.fullName.split(' ')[0]}. Your application has been received and saved
            with our admissions team.
          </p>

          {/* The one instruction every applicant must walk away with. */}
          <div className="crs-mailnote">
            <i className="fas fa-envelope-circle-check"></i>
            You have received an email at <strong>{form.email}</strong>. Please check it, then
            simply <strong>wait until {COURSE.interviewDate}</strong> — our team will call you for
            your interview between <strong>{COURSE.interviewWindow}</strong>. Keep your phone and
            WhatsApp active that day.
            <span className="crs-spam">
              Not in your inbox? Check the Spam or Promotions folder.
            </span>
          </div>

          <div className="crs-success-actions">
            {/* /guide sends the PDF with an attachment header, so this saves
                the file instead of opening the browser's PDF viewer. */}
            <a className="crs-btn crs-btn-primary" href={COURSE.guideDownloadPath} download>
              <i className="fas fa-download"></i> Download Enrollment Guide
            </a>
            <a
              className="crs-btn crs-btn-ghost"
              href={`https://wa.me/${digits(COURSE.supportPhone)}`}
              target="_blank"
              rel="noreferrer"
            >
              <i className="fab fa-whatsapp"></i> Message us on WhatsApp
            </a>
          </div>

          {!done.emailSent && (
            <p className="crs-privacy">
              We could not send the email automatically — please save this page. Your application is
              recorded and we will still call you on {COURSE.interviewDate}.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="crs-formwrap">
      <div className="crs-formhead">
        <h3>Enrollment form</h3>
        <p>Free to submit · takes about 2 minutes</p>
      </div>

      {/* Placeholders act as the labels here, so the form stays a single
          clean column of inputs with no boxes or captions in between. */}
      <form onSubmit={onSubmit} noValidate>
        <div className="crs-grid2">
          <div className="crs-field crs-span2">
            <input
              type="text"
              placeholder="Full name"
              aria-label="Full name"
              value={form.fullName}
              onChange={set('fullName')}
              autoComplete="name"
              required
            />
          </div>

          <div className="crs-field crs-span2">
            <input
              type="email"
              placeholder="Email address"
              aria-label="Email address"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
              required
            />
          </div>

          <div className="crs-field">
            <input
              type="tel"
              inputMode="tel"
              placeholder="Mobile number"
              aria-label="Mobile number"
              value={form.phone}
              onChange={set('phone')}
              autoComplete="tel"
              required
            />
          </div>

          <div className="crs-field">
            <input
              type="tel"
              inputMode="tel"
              placeholder="WhatsApp number"
              aria-label="WhatsApp number"
              value={form.whatsapp}
              onChange={set('whatsapp')}
              required
            />
          </div>

          <div className="crs-field">
            <input
              type="text"
              inputMode="numeric"
              placeholder="CNIC — 35202-1234567-1"
              aria-label="CNIC number"
              value={form.cnic}
              onChange={set('cnic')}
              required
            />
          </div>

          <div className="crs-field">
            <input
              type="number"
              inputMode="numeric"
              min="14"
              max="60"
              placeholder="Age"
              aria-label="Age"
              value={form.age}
              onChange={set('age')}
              required
            />
          </div>

          <div className="crs-field">
            <select
              aria-label="Gender"
              data-empty={form.gender === '' ? 'true' : 'false'}
              value={form.gender}
              onChange={set('gender')}
              required
            >
              <option value="">Gender</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="crs-field">
            <select
              aria-label="Current study level"
              data-empty={form.studyLevel === '' ? 'true' : 'false'}
              value={form.studyLevel}
              onChange={set('studyLevel')}
              required
            >
              <option value="">Current study level</option>
              {STUDY_LEVELS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="crs-field crs-span2">
            <label className="crs-check">
              <input type="checkbox" checked={form.laptop} onChange={set('laptop')} />
              I have a laptop or computer available
            </label>
          </div>
        </div>

        {error && (
          <div className="crs-error" role="alert">
            <i className="fas fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="crs-btn crs-btn-primary crs-submit" disabled={sending}>
          {sending ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Submitting…
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane"></i> Submit &amp; Reserve My Seat
            </>
          )}
        </button>

        <p className="crs-privacy">
          <i className="fas fa-lock"></i> Your data stays with Bano Digital Hub and is never shared
          with third parties.
        </p>
      </form>
    </div>
  );
}
