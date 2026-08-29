import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseMotion from '@/components/CourseMotion';
import EnrollForm from '@/components/EnrollForm';
import { COURSE } from '@/lib/config';
import { JsonLd, courseLd, faqLd, breadcrumbLd } from '@/lib/seo';
import './course.css';

/* NOTE: enrollment is free — the course itself is not. Nothing on this page
   should call the course free, and the fee is not disclosed here; it is
   discussed with shortlisted students on the interview call. */

export const metadata = {
  // `absolute` — the title already names the brand, and the root layout's
  // template would otherwise append it a second time.
  title: {
    absolute: 'AI Web Development Course – Earn PKR 30,000/Month | Bano Digital Hub',
  },
  description:
    'Join the 6-week Bano Digital Hub AI web development course. Enrollment is free, build real websites with AI tools, and finish with your own first paid project. Only 30 seats — classes start 7 September 2026.',
  alternates: { canonical: '/course' },
  keywords: [
    'AI web development course',
    'web development course Lahore',
    'freelancing course Pakistan',
    'earn 30000 per month Pakistan',
    'learn web development Pakistan',
    'online coding classes Lahore',
  ],
  openGraph: {
    type: 'website',
    title: 'AI Web Development Course – Earn PKR 30,000 Per Month | Bano Digital Hub',
    description:
      'Free enrollment, 6 weeks of live classes, and your first paid project. Limited to 30 seats.',
    url: '/course',
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: 'AI Web Development Course' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Web Development Course – Earn PKR 30,000 Per Month',
    description: 'Free enrollment · 6 weeks of live classes · your first paid project.',
    images: ['/og-image.png'],
  },
};

const STEPS = [
  {
    n: 1,
    title: 'Enroll — free registration',
    body: 'Fill the form and reserve one of the 30 seats. Registration costs nothing. We shortlist serious students through a short interview call.',
  },
  {
    n: 2,
    title: '6 weeks of live classes',
    body: 'Structured, hands-on training with live sessions, real assignments and personal feedback. You build while you learn.',
  },
  {
    n: 3,
    title: 'Your first paid project',
    body: 'You finish with a real client project — and the payment for it is entirely yours, along with a portfolio and proof of your skill.',
  },
];

const FAQS = [
  {
    q: 'Is registration free?',
    a: 'Yes. Filling this form and attending the interview call costs you nothing. Everything else is explained to shortlisted students during that call.',
  },
  {
    q: 'What happens after I submit the form?',
    a: `You immediately receive a confirmation email. After that you simply wait — our team calls you on ${COURSE.interviewDate}, from ${COURSE.interviewWindow}, for a short interview and skill-test call.`,
  },
  {
    q: 'Do I need a laptop?',
    a: 'A laptop or computer is strongly recommended because all practical work is done on one. If you do not have one yet, still apply — mention it during the call and we will discuss options.',
  },
  {
    q: 'Are classes online or on-site?',
    a: 'Classes are live and interactive. Joining links and all class updates are shared on the WhatsApp number you provide, so make sure it is active.',
  },
  {
    q: 'What if I miss the interview call?',
    a: `Seats are limited to ${COURSE.seats}, so missed calls usually go to the next applicant. If something urgent comes up, message us on WhatsApp at ${COURSE.supportPhone} before ${COURSE.interviewDate}.`,
  },
];

export default function CoursePage() {
  return (
    <div className="crs-page">
      {/* Course + FAQ rich results, and the breadcrumb trail Google shows. */}
      <JsonLd data={courseLd()} />
      <JsonLd data={faqLd(FAQS)} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'AI Web Development Course', path: '/course' },
        ])}
      />

      <Navbar active="course" />

      {/* ------------------------------------------------------------ hero */}
      <section className="crs-hero">
        <div className="crs-shell">
          <span className="crs-badge">
            <span className="crs-dot-live"></span>
            Admissions open — only {COURSE.seats} seats
          </span>

          {/* Two lines at every width — the font scales with the viewport so
              neither line ever wraps onto a third. */}
          <h1 className="crs-h1">
            <span className="crs-h1-line">AI Web Development Course</span>
            <span className="crs-h1-line">
              Earn <span className="crs-grad">{COURSE.monthlyTarget}</span> Per Month
            </span>
          </h1>

          <p className="crs-lead">
            A {COURSE.durationWeeks}-week hands-on course by Bano Digital Hub. Build real websites
            with AI-powered tools and finish with your own first paid project.
          </p>

          <div className="crs-cta-row">
            <a href="#enroll" className="crs-btn crs-btn-primary">
              <i className="fas fa-bolt"></i> Enroll Now
            </a>
            <a href="#how-it-works" className="crs-btn crs-btn-ghost">
              See how it works
            </a>
          </div>

          <div className="crs-trustrow">
            <span className="crs-trust-extra">
              <i className="fas fa-circle-check"></i> Free enrollment
            </span>
            <span>
              <i className="fas fa-circle-check"></i> Classes start {COURSE.classesStart}
            </span>
            <span className="crs-trust-extra">
              <i className="fas fa-circle-check"></i> Real paid project included
            </span>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- 3 steps */}
      <section className="crs-section crs-section-alt" id="how-it-works">
        <div className="crs-shell">
          {/* data-reveal + --crs-d: each line arrives just after the one
              above it, so the section reads as it appears. */}
          <div className="crs-head">
            <span className="crs-eyebrow" data-reveal>
              How it works
            </span>
            <h2 className="crs-h2" data-reveal style={{ '--crs-d': 1 }}>
              Three steps to your first income
            </h2>
            <p className="crs-sub" data-reveal style={{ '--crs-d': 2 }}>
              Every step is designed to move you towards a real, paying client.
            </p>
          </div>

          <div className="crs-steps">
            {STEPS.map((s, i) => (
              <article className="crs-step" key={s.n} data-reveal style={{ '--crs-d': i }}>
                <div className="crs-step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ form */}
      <section className="crs-section" id="enroll">
        <div className="crs-shell">
          <div className="crs-head">
            <span className="crs-eyebrow" data-reveal>
              Registration
            </span>
            <h2 className="crs-h2" data-reveal style={{ '--crs-d': 1 }}>
              Reserve your seat
            </h2>
            <p className="crs-sub" data-reveal style={{ '--crs-d': 2 }}>
              Fill in your details honestly — we use them to call you for the interview and to add
              you to the class WhatsApp group.
            </p>
          </div>

          <div data-reveal style={{ '--crs-d': 3 }}>
            <EnrollForm />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- faq */}
      <section className="crs-section crs-section-alt">
        <div className="crs-shell">
          <div className="crs-head">
            <span className="crs-eyebrow" data-reveal>
              Questions
            </span>
            <h2 className="crs-h2" data-reveal style={{ '--crs-d': 1 }}>
              Frequently asked
            </h2>
            <p className="crs-sub" data-reveal style={{ '--crs-d': 2 }}>
              Still unsure? Message us on WhatsApp at {COURSE.supportPhone}.
            </p>
          </div>

          <div className="crs-faq">
            {FAQS.map((f, i) => (
              <details key={f.q} data-reveal style={{ '--crs-d': i }}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <CourseMotion />
    </div>
  );
}
