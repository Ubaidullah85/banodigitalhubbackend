'use client';

import { useEffect, useState } from 'react';

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
  const nameEQ = `${name}=`;
  for (let c of document.cookie.split(';')) {
    c = c.trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
  }
  return null;
}

const setAnalyticsCookies = () => {
  setCookie('_ga', 'GA1.2.123456789.1234567890', 365);
  setCookie('_gid', 'GA1.2.1234567890.1234567890', 1);
};
const setMarketingCookies = () => setCookie('_fbp', 'fb.1.1234567890.1234567890', 90);
const setPreferenceCookies = () => {
  setCookie('language', 'en', 365);
  setCookie('theme', 'dark', 365);
};

export default function CookieConsent() {
  const [hidden, setHidden] = useState(true);
  const [active, setActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, marketing: true, preferences: true });

  useEffect(() => {
    const consent = getCookie('cookie_consent');
    if (consent) {
      if (consent === 'accepted') {
        setAnalyticsCookies();
        setMarketingCookies();
        setPreferenceCookies();
      } else if (consent === 'custom') {
        if (getCookie('cookie_analytics') === 'true') setAnalyticsCookies();
        if (getCookie('cookie_marketing') === 'true') setMarketingCookies();
        if (getCookie('cookie_preferences') === 'true') setPreferenceCookies();
      }
      return;
    }
    setHidden(false);
    const t = setTimeout(() => setActive(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setActive(false);
    setTimeout(() => setHidden(true), 500);
  };

  const acceptAll = () => {
    setCookie('cookie_consent', 'accepted', 365);
    setAnalyticsCookies();
    setMarketingCookies();
    setPreferenceCookies();
    dismiss();
  };

  const rejectAll = () => {
    setCookie('cookie_consent', 'rejected', 365);
    dismiss();
  };

  const saveSettings = () => {
    setCookie('cookie_consent', 'custom', 365);
    setCookie('cookie_analytics', prefs.analytics, 365);
    setCookie('cookie_marketing', prefs.marketing, 365);
    setCookie('cookie_preferences', prefs.preferences, 365);
    if (prefs.analytics) setAnalyticsCookies();
    if (prefs.marketing) setMarketingCookies();
    if (prefs.preferences) setPreferenceCookies();
    dismiss();
  };

  if (hidden) return null;

  const toggle = (key, label, text) => (
    <div className="cookie-setting">
      <div className="setting-text">
        <h4>{label}</h4>
        <p>{text}</p>
      </div>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={prefs[key]}
          onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
        />
        <span className="slider"></span>
      </label>
    </div>
  );

  return (
    <div className={`cookie-consent${active ? ' active' : ''}`}>
      <div className="cookie-header">
        <i className="fas fa-cookie-bite cookie-icon"></i>
        <h3 className="cookie-title">Cookie Preferences</h3>
      </div>
      <div className="cookie-content">
        We use cookies to enhance your browsing experience, serve personalized ads or content,
        and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of
        cookies.
      </div>
      <div className="cookie-buttons">
        <button className="cookie-btn reject-btn" onClick={rejectAll}>
          <i className="fas fa-times"></i> Reject All
        </button>
        <button className="cookie-btn settings-btn" onClick={() => setShowSettings(true)}>
          <i className="fas fa-cog"></i> Customize
        </button>
        <button className="cookie-btn accept-btn" onClick={acceptAll}>
          <i className="fas fa-check"></i> Accept All
        </button>
      </div>

      <div className="cookie-settings" style={{ display: showSettings ? 'block' : 'none' }}>
        <div className="cookie-setting">
          <div className="setting-text">
            <h4>Necessary Cookies</h4>
            <p>Required for the website to function properly. Cannot be disabled.</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked disabled readOnly />
            <span className="slider"></span>
          </label>
        </div>

        {toggle(
          'analytics',
          'Analytics Cookies',
          'Help us understand how visitors interact with our website.'
        )}
        {toggle(
          'marketing',
          'Marketing Cookies',
          'Used to track visitors across websites for advertising purposes.'
        )}
        {toggle(
          'preferences',
          'Preferences Cookies',
          'Allow the website to remember choices you make.'
        )}

        <button className="cookie-btn accept-btn" onClick={saveSettings}>
          <i className="fas fa-save"></i> Save Preferences
        </button>
      </div>

      <a href="/dataprotection#cookies" className="cookie-link">
        Cookie Policy
      </a>
    </div>
  );
}
