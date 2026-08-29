# banodigitalhubbackend

Website and admin backend for **Bano Digital Hub** — a Next.js 16 (App Router)
application covering the public site, the course enrollment flow, transactional
email and the internal admin panel.

## What is in here

| Area | Path |
| --- | --- |
| Public site (home, course, legal) | `app/`, `components/` |
| Enrollment API + validation | `app/api/enroll/route.js` |
| Admin panel (students, projects) | `app/admin/`, `components/admin/` |
| Admin APIs (auth, export, status) | `app/api/admin/` |
| Email templates and sending | `lib/email-template.js`, `lib/email.js` |
| Enrollment guide download | `app/guide/route.js` |
| Public URL / domain resolution | `lib/site.js` |

## Requirements

- Node.js 20 or newer
- A MongoDB Atlas database
- A Google App Password for sending mail over Gmail SMTP

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

## Environment variables

See `.env.example` for the full list. In short:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI`, `MONGODB_DB` | Where applications and projects are stored |
| `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | Sign-in for `/admin` |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `MAIL_FROM` | Outgoing mail |
| `ADMIN_EMAIL` | Where new-application notifications are sent |
| `NEXT_PUBLIC_SITE_URL` | Public site URL used by emails, canonicals and the sitemap |

`NEXT_PUBLIC_SITE_URL` must be the live domain. A `localhost` value is ignored
on purpose (`lib/site.js`) so a local test can never email a student a dead
link.

## Deployment

Deployed on Vercel. Set the same environment variables in
**Project → Settings → Environment Variables** before the first production
deploy.

```bash
npm run build   # production build
npm start       # serve the build locally
```
