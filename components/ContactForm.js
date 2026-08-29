'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState({ text: '', color: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSending(true);
    setMsg({ text: '', color: '' });

    const data = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      message: form.message.value,
    };

    try {
      const res = await fetch('https://formspree.io/f/mvgbgpja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setMsg({ text: 'Thank you! Your message has been sent.', color: 'green' });
        form.reset();
      } else {
        setMsg({ text: 'Oops! Problem sending message.', color: 'red' });
      }
    } catch {
      setMsg({ text: 'Network error. Try later.', color: 'red' });
    }
    setSending(false);
  };

  return (
    <form id="contactForm" className="space-y-6" onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="name">Name*</label>
        <input type="text" id="name" required placeholder="Your name" name="name" />
      </div>

      <div className="form-group">
        <label htmlFor="email">E-mail*</label>
        <input
          type="email"
          id="email"
          required
          placeholder="your.email@example.com"
          name="email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Telephone number</label>
        <input
          type="tel"
          id="phone"
          placeholder="Your phone number (optional)"
          name="phone"
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">Message*</label>
        <textarea id="message" name="message" required placeholder="How can we help you?" />
      </div>

      <button type="submit" className="submit-btn" disabled={sending}>
        {sending ? 'Sending...' : 'Send Message'}
      </button>
      <p id="formMessage" style={{ marginTop: '10px', color: msg.color }}>
        {msg.text}
      </p>
    </form>
  );
}
