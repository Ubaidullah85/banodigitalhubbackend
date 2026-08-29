import { COURSE } from './config';

/**
 * The Bano Digital Hub mail.
 *
 * Deliberately editorial, not "dashboard": one narrow column of flowing text on
 * a warm paper ground, sections separated by hairlines instead of coloured
 * boxes, and a single quiet call-to-action. There is no blue and no gradient —
 * ink, paper and one bronze hairline carry the whole thing, which is what makes
 * it read as a letter from a company rather than as a notification.
 *
 * Everything is table-based with inline styles, because that is the only markup
 * Outlook, Gmail and Apple Mail all agree on.
 */

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]);

/* --------------------------------------------------------------- palette */
const C = {
  paper: '#f2f0ec', // warm paper, never a blue-grey
  sheet: '#ffffff',
  ink: '#1a1815',
  body: '#4f4c46',
  soft: '#8b867d',
  rule: '#e6e2da',
  accent: '#8a6a45', // bronze — the only colour in the whole mail
  footer: '#1a1815',
  footerText: '#a49d92',
};

const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS = "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif";

/* ----------------------------------------------------------- small parts */

/** Section label in bronze small-caps. This replaces the old coloured boxes. */
const label = (text) => `
  <p style="margin:0 0 12px;font-family:${SANS};font-size:10.5px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:${C.accent};">${esc(text)}</p>`;

/** A paragraph. The generous leading is what makes the mail feel unhurried. */
const p = (html, extra = '') => `
  <p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.85;color:${C.body};${extra}">${html}</p>`;

/** Inline emphasis — weight and ink, never a colour. */
const b = (text) => `<strong style="color:${C.ink};font-weight:600;">${esc(text)}</strong>`;

/** Hairline divider — this is what separates one section from the next. */
const rule = (space = 28) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="padding:${space}px 0 0;"><div style="height:1px;line-height:1px;font-size:0;background:${C.rule};">&nbsp;</div></td></tr>
    <tr><td style="height:${space}px;line-height:${space}px;font-size:0;">&nbsp;</td></tr>
  </table>`;

/** One detail line: quiet label left, value right, hairline underneath. */
const detail = (k, v) => `
  <tr>
    <td style="padding:11px 0;border-bottom:1px solid ${C.rule};font-family:${SANS};font-size:13px;line-height:1.5;color:${C.soft};">${esc(k)}</td>
    <td align="right" style="padding:11px 0;border-bottom:1px solid ${C.rule};font-family:${SANS};font-size:13px;line-height:1.5;font-weight:600;color:${C.ink};">${esc(v)}</td>
  </tr>`;

/** The one button in the mail: solid ink, square, no shadow, no gradient. */
const button = (href, text) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 2px;">
    <tr><td style="background:${C.ink};">
      <a href="${esc(href)}" style="display:inline-block;padding:15px 30px;font-family:${SANS};font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#ffffff;text-decoration:none;">${esc(text)}</a>
    </td></tr>
  </table>`;

/** A second, lighter action that can sit beside the primary one. */
const ghostButton = (href, text) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 2px;">
    <tr><td style="border:1px solid ${C.rule};">
      <a href="${esc(href)}" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:${C.ink};text-decoration:none;">${esc(text)}</a>
    </td></tr>
  </table>`;

/* ------------------------------------------------------------------ shell */
/**
 * A white sheet on warm paper: small centred logo, a bronze hairline, a serif
 * headline, then the body. The watermark sits faintly behind the copy; clients
 * that drop background images (Outlook desktop) simply show a clean sheet.
 */
export function shell({ title, kicker, body, origin }) {
  const wm = origin ? `${origin}/email-watermark.png` : '';

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${esc(title)}</title>
<style>
  @media only screen and (max-width:620px) {
    .pad { padding-left:24px !important; padding-right:24px !important; }
    .headline { font-size:26px !important; }
    .stack { display:block !important; width:100% !important; }
    .stack td { width:100% !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.paper};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(kicker || title)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper};padding:40px 12px;">
    <tr><td align="center">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${C.sheet};border:1px solid ${C.rule};">

        <!-- masthead -->
        <tr><td class="pad" align="center" style="padding:46px 48px 0;">
          <img src="cid:bdhlogo" width="52" height="52" alt="Bano Digital Hub" style="display:block;border:0;outline:none;">
          <p style="margin:16px 0 0;font-family:${SANS};font-size:10.5px;font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:${C.soft};">Bano Digital Hub</p>
        </td></tr>

        <tr><td align="center" style="padding:24px 0 0;">
          <div style="width:34px;height:1px;line-height:1px;font-size:0;background:${C.accent};">&nbsp;</div>
        </td></tr>

        <tr><td class="pad" align="center" style="padding:24px 48px 0;">
          <h1 class="headline" style="margin:0;font-family:${SERIF};font-size:31px;font-weight:400;line-height:1.32;color:${C.ink};">${esc(title)}</h1>
          ${
            kicker
              ? `<p style="margin:14px 0 0;font-family:${SANS};font-size:14px;line-height:1.7;color:${C.soft};">${esc(kicker)}</p>`
              : ''
          }
        </td></tr>

        <!-- body -->
        <tr><td class="pad" background="${esc(wm)}" style="padding:38px 48px 46px;background-color:${C.sheet};background-image:url('${esc(wm)}');background-repeat:no-repeat;background-position:center 30px;">
          ${body}
        </td></tr>

        <!-- footer -->
        <tr><td class="pad" align="center" style="padding:30px 48px 34px;background:${C.footer};">
          <p style="margin:0 0 10px;font-family:${SANS};font-size:10.5px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:#ffffff;">Bano Digital Hub</p>
          <p style="margin:0;font-family:${SANS};font-size:12.5px;line-height:1.9;color:${C.footerText};">
            E359 Gulberg, Lahore, Pakistan<br>
            <a href="mailto:${esc(COURSE.supportEmail)}" style="color:${C.footerText};text-decoration:none;">${esc(COURSE.supportEmail)}</a>
            &nbsp;&middot;&nbsp; ${esc(COURSE.supportPhone)}
          </p>
        </td></tr>

      </table>

    </td></tr>
  </table>
</body></html>`;
}

/* ------------------------------------------------------------ student mail */
export function studentHtml(s, origin, hasGuide) {
  const guideUrl = `${origin || ''}${COURSE.guideDownloadPath}`;

  const body = `
    ${p(`Assalam-o-Alaikum ${b(s.fullName)},`)}

    ${p(
      `Thank you for applying to the ${esc(COURSE.name)}. Your form has reached our admissions team
       and your seat request is on file. This batch is limited to ${COURSE.seats} students, so please
       read what follows carefully &mdash; the next step happens on a fixed date.`
    )}

    ${rule()}

    ${label('Your interview call')}
    ${p(
      `We will call you on ${b(COURSE.interviewDate)}, from ${b(COURSE.interviewWindow)}, for a short
       interview and skill-test conversation. Keep your phone and WhatsApp active throughout that
       window. Seats are limited and a missed call is usually passed to the next applicant, so please
       treat this as a firm appointment.`
    )}

    ${rule()}

    ${label('Before the call')}
    ${p(
      hasGuide
        ? `Your enrollment guide is attached to this email as a PDF. It explains what we look for and
           the kind of questions we ask, so read it through before ${esc(COURSE.interviewDate)}.
           You can also download a copy here.`
        : `Your enrollment guide explains what we look for and the kind of questions we ask.
           Download it below and read it through before ${esc(COURSE.interviewDate)}.`
    )}
    ${button(guideUrl, 'Download the guide')}

    ${rule()}

    ${label('When classes begin')}
    ${p(
      `Selected students start on ${b(COURSE.classesStart)}. The course runs for ${COURSE.durationWeeks}
       weeks of live, hands-on sessions and ends with your own first paid client project &mdash; the
       payment for that project is entirely yours to keep.`
    )}

    ${rule()}

    ${label('The details we received')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:2px 0 0;">
      ${detail('Full name', s.fullName)}
      ${detail('Email', s.email)}
      ${detail('Mobile', s.phone)}
      ${detail('WhatsApp', s.whatsapp)}
      ${detail('CNIC', s.cnic)}
      ${detail('Age', s.age)}
      ${detail('Gender', s.gender)}
      ${detail('Study level', s.studyLevel)}
      ${detail('Laptop available', s.laptop ? 'Yes' : 'No')}
    </table>

    <p style="margin:22px 0 0;font-family:${SANS};font-size:13.5px;line-height:1.85;color:${C.soft};">
      If anything above is wrong, reply to this email or message us on WhatsApp at
      ${esc(COURSE.supportPhone)} and we will correct it before the call.
    </p>`;

  return shell({
    title: 'Your application is confirmed',
    kicker: `We will call you on ${COURSE.interviewDate}, from ${COURSE.interviewWindow}.`,
    body,
    origin,
  });
}

/** Plain-text twin of the mail above, for clients that refuse HTML. */
export function studentText(s, origin) {
  const guideUrl = `${origin || ''}${COURSE.guideDownloadPath}`;

  return `BANO DIGITAL HUB
Your application is confirmed

Assalam-o-Alaikum ${s.fullName},

Thank you for applying to the ${COURSE.name}. Your form has reached our
admissions team and your seat request is on file. This batch is limited to
${COURSE.seats} students, so please read the following carefully.

YOUR INTERVIEW CALL
We will call you on ${COURSE.interviewDate}, from ${COURSE.interviewWindow},
for a short interview and skill-test conversation. Keep your phone and WhatsApp
active throughout that window. A missed call is usually passed to the next
applicant, so please treat this as a firm appointment.

BEFORE THE CALL
Your enrollment guide is attached to this email, and can also be downloaded at:
${guideUrl}
Read it through before ${COURSE.interviewDate}.

WHEN CLASSES BEGIN
Selected students start on ${COURSE.classesStart}. The course runs for
${COURSE.durationWeeks} weeks of live sessions and ends with your own first paid
client project - the payment for that project is entirely yours to keep.

THE DETAILS WE RECEIVED
Full name         ${s.fullName}
Email             ${s.email}
Mobile            ${s.phone}
WhatsApp          ${s.whatsapp}
CNIC              ${s.cnic}
Age               ${s.age}
Gender            ${s.gender}
Study level       ${s.studyLevel}
Laptop available  ${s.laptop ? 'Yes' : 'No'}

If anything above is wrong, reply to this email or message us on WhatsApp at
${COURSE.supportPhone} and we will correct it before the call.

Bano Digital Hub - E359 Gulberg, Lahore, Pakistan
${COURSE.supportEmail} - ${COURSE.supportPhone}`;
}

/* -------------------------------------------------------------- admin mail */
export function adminHtml(student, origin) {
  const wa = String(student.whatsapp || '').replace(/\D/g, '');
  const adminUrl = `${origin || ''}/admin`;
  const submitted = new Date(student.createdAt || Date.now()).toLocaleString('en-GB');

  const body = `
    ${p(
      `A new application came in on ${b(submitted)}. The record is already saved in the admin panel;
       the details are below so you can act on it without opening anything.`
    )}

    ${rule(24)}

    ${label('Applicant')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${detail('Full name', student.fullName)}
      ${detail('Email', student.email)}
      ${detail('Mobile', student.phoneRaw || student.phone)}
      ${detail('WhatsApp', student.whatsappRaw || student.whatsapp)}
      ${detail('CNIC', student.cnic)}
      ${detail('Age', student.age)}
      ${detail('Gender', student.gender)}
      ${detail('Study level', student.studyLevel)}
      ${detail('Laptop', student.laptop ? 'Yes' : 'No')}
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 0;">
      <tr class="stack">
        <td>${button(adminUrl, 'Open admin panel')}</td>
        <td style="width:10px;">&nbsp;</td>
        <td>${ghostButton(`https://wa.me/${esc(wa)}`, 'Message on WhatsApp')}</td>
      </tr>
    </table>`;

  return shell({
    title: 'New course application',
    kicker: student.fullName,
    body,
    origin,
  });
}

export function adminText(student, origin) {
  return `NEW COURSE APPLICATION

Full name    ${student.fullName}
Email        ${student.email}
Mobile       ${student.phoneRaw || student.phone}
WhatsApp     ${student.whatsappRaw || student.whatsapp}
CNIC         ${student.cnic}
Age          ${student.age}
Gender       ${student.gender}
Study level  ${student.studyLevel}
Laptop       ${student.laptop ? 'Yes' : 'No'}
Submitted    ${new Date(student.createdAt || Date.now()).toLocaleString('en-GB')}

Admin panel: ${origin || ''}/admin`;
}
