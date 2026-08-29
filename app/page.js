import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeInteractions from '@/components/HomeInteractions';
import ContactForm from '@/components/ContactForm';
import CookieConsent from '@/components/CookieConsent';
import { listProjects } from '@/lib/projects';

export const metadata = {
  title: 'Web Design & Digital Marketing in Lahore',
  description:
    'Bano Digital Hub builds professional websites and runs digital marketing and branding for businesses in Lahore and across Pakistan. See our work and get a quote.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: 'Web Design & Digital Marketing in Lahore | Bano Digital Hub',
    description:
      'Professional websites, digital marketing and branding for businesses in Lahore and across Pakistan.',
    url: '/',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Bano Digital Hub' }],
  },
};

export const revalidate = 300;

const AVATARS = [1, 2, 3, 4, 5, 6];

const TESTIMONIALS = [
  {
    name: 'Sabine Tischler',
    role: 'Kinesiologist, Germany',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80',
    text: '"Markus delivered a highly professional website for my practice. The team understood my needs quickly, provided clear guidance, and ensured the project stayed on schedule. I’m very happy with the results and would gladly work with them again."',
  },
  {
    name: 'Martin Aicher',
    role: 'Managing Director, NUR CAFE GmbH',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80',
    text: '"The website was created exactly as discussed. Communication was efficient, updates were prompt, and the design exceeded our expectations. The professionalism and attention to detail were outstanding."',
  },
  {
    name: 'Ali Khan',
    role: 'Owner, Cafe Lahore',
    img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80',
    text: '"Very professional and friendly team. They understood my brand identity and created a website that perfectly represents it. The process was smooth, and the final result was delivered on time."',
  },
  {
    name: 'Sara Ahmed',
    role: 'Entrepreneur, Karachi',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80',
    text: '"The team took time to understand my requirements and offered valuable suggestions to improve usability. Communication was always friendly and professional. The website looks exactly as I envisioned."',
  },
];

const ACHIEVEMENTS = [
  {
    target: 25,
    suffix: '+',
    title: 'Web Projects Delivered',
    text: 'Successfully launched websites for clients across industries.',
  },
  {
    target: 150,
    suffix: 'k+',
    title: 'Lines of Code Written',
    text: 'Optimized, clean, and maintainable code for every project.',
  },
  {
    target: 80,
    suffix: 'k+',
    title: 'Users Reached',
    text: 'Web solutions designed to handle high traffic efficiently.',
  },
  {
    target: 100,
    suffix: '%',
    title: 'Client Satisfaction',
    text: 'Dedicated focus on quality and client success.',
  },
];

const SERVICE_TABS = [
  {
    id: 'restaurateurs',
    icon: 'fa-utensils',
    label: 'Restaurateurs',
    problem:
      'Your restaurant is amazing, but online it’s invisible. Menus are confusing, reservations frustrating, and potential guests don’t even know you exist.',
    solution:
      'We provide a modern, mobile-friendly restaurant website with easy online reservations, visually rich menus, and local SEO to ensure your restaurant reaches and delights more guests.',
  },
  {
    id: 'real-estate',
    icon: 'fa-house',
    label: 'Real Estate Agents',
    problem:
      'As a real estate agent, your listings get lost online. Limited visibility and generic content mean serious buyers never see your properties.',
    solution:
      'We provide immersive virtual tours, engaging property content, and targeted online ads to reach the right buyers, increasing leads and sales efficiently.',
  },
  {
    id: 'craft-businesses',
    icon: 'fa-wrench',
    label: 'Craft Businesses',
    problem:
      'Your work impresses in person, but online it feels like a brochure lost in the crowd. Visitors leave before they even understand your value.',
    solution:
      'We provide a visually rich website that highlights your process and finished products, paired with story-driven content that attracts clients who appreciate quality craftsmanship and premium services.',
  },
  {
    id: 'consultants',
    icon: 'fa-users',
    label: 'Consultants & Coaches',
    problem:
      'You have valuable expertise, but struggle to stand out and attract clients in a crowded online space.',
    solution:
      'We position you as a thought leader with strategic content: educational webinars, insightful articles, and client success stories that build trust and bring in your ideal clients.',
  },
];

const Star = () => (
  <svg className="star" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export default async function Home() {
  const projects = await listProjects();
  const marqueeCards = [...TESTIMONIALS, TESTIMONIALS[0], TESTIMONIALS[2]];

  return (
    <>
      <Navbar active="home" />

      {/* Hero Section */}
      <section className="hero">
        <div className="rating-container">
          <div className="stars-row">
            <Star />
            <Star />
            <Star />
            <Star />
            <Star />
          </div>
          <div className="rating-text">+3 projects actively managed</div>
        </div>

        <div className="customers-scroll">
          <div className="scroll-gradient-left"></div>
          <div className="scroll-gradient-right"></div>
          <div className="customers-track">
            {[0, 1, 2].map((copy) =>
              AVATARS.map((n) => (
                <div className="customer-avatar" key={`${copy}-${n}`}>
                  <img src={`https://i.pravatar.cc/24?img=${n}`} alt="" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            More trust through <br /> Better websites
          </h1>

          <p className="hero-subtitle">
            {' '}
            AT banodigital, We build websites that inspire confidence, engage audiences, and turn
            online presence into real business growth.
          </p>

          <div className="hero-buttons">
            <a href="#" className="btn-primary">
              <span className="live-indicator"></span>
              Currently available
            </a>
            <a href="#kontakt" className="btn-secondary">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects">
        <div className="section-header">
          <h2 className="section-title">
            Our Featured{' '}
            <span className="span1" style={{ color: '#4361EE' }}>
              Projects
            </span>
          </h2>
        </div>

        <div className="carousel-container">
          <div className="carousel">
            {projects.map((p) => (
              <div className="project-card" key={p._id}>
                <div className="card-image">
                  <img src={p.image} alt={p.alt || p.title} />
                  <div className="card-overlay"></div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{p.title}</h3>
                  <p className="card-description">{p.description}</p>
                  <div className="card-tags">
                    {p.tags.map((t) => (
                      <span className="card-tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <a href={p.link || '#'} className="card-link">
                    View Project <i className="fas fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="carousel-controls">
          <button className="carousel-btn prev-btn" aria-label="Previous project">
            <i className="fas fa-chevron-left"></i>
          </button>

          <div className="carousel-dots">
            {projects.map((p, i) => (
              <div className={`dot${i === 0 ? ' active' : ''}`} key={p._id}></div>
            ))}
          </div>

          <button className="carousel-btn next-btn" aria-label="Next project">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </section>

      {/* About Us */}
      <section className="social-media-section" id="AboutUs">
        <div className="social-media-container">
          <div className="social-left">
            <div className="social-tab slide-in-left">About Us</div>
            <h2 className="social-title slide-in-left">
              <span className="gradient-text">Web Development Mastery</span> Born in Lahore
            </h2>
          </div>

          <div className="social-right">
            <div className="social-content">
              <p className="slide-in-right">
                As a Web Development Agency in Lahore, we see every day how essential a strong
                digital presence has become. In today’s market, only those who are visible online
                can grow sustainably. We make sure you don’t just gain visibility but also connect
                with the right audience.
              </p>

              <p className="slide-in-right">
                Our formula? A balance of modern web development, smart design, and strategic
                digital marketing. Equally important to us is building your brand authentically, so
                you expand your reach and win new customers with confidence.
              </p>
            </div>

            <a href="#kontakt" className="social-cta slide-in-right">
              <span>Let’s Make It Happen</span>
              <i className="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>

        <section className="achievements-section">
          <div className="container">
            <div className="grid">
              {ACHIEVEMENTS.map((a) => (
                <div className="achievement-card" key={a.title}>
                  <div className="counter">
                    <span className="counter-value" data-target={a.target}>
                      0
                    </span>
                    {a.suffix}
                  </div>
                  <h3>{a.title}</h3>
                  <p>{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>

      {/* References */}
      <section className="testimonials-section" id="Reference">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="tab">References</div>
          </div>

          <h2 className="heading">
            What our <span className="highlight">Clients Say</span>
          </h2>

          <div className="marquee-container">
            <div className="marquee-content">
              {marqueeCards.map((t, i) => (
                <div className="testimonial-card" key={`${t.name}-${i}`}>
                  <div className="quote-mark"></div>
                  <div className="profile">
                    <img src={t.img} alt={t.name} className="profile-img" />
                    <div className="profile-info">
                      <h3>{t.name}</h3>
                      <p>{t.role}</p>
                    </div>
                  </div>
                  <div className="divider"></div>
                  <p className="testimonial-text">{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="support-section" id="Services">
        <div className="container">
          <h2 className="support-heading">
            Who can we <span className="accent">support?</span>
          </h2>

          <div className="tabs-container">
            <div className="tabs-list" role="tablist">
              {SERVICE_TABS.map((tab, i) => (
                <button
                  key={tab.id}
                  className={`tab-trigger${i === 0 ? ' active' : ''}`}
                  role="tab"
                  aria-selected={i === 0}
                  data-target={tab.id}
                >
                  <i className={`fas ${tab.icon}`}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="tab-content" role="tabpanel">
              {SERVICE_TABS.map((tab, i) => (
                <div className={`tab-panel${i === 0 ? ' active' : ''}`} id={tab.id} key={tab.id}>
                  <div className="content-item">
                    <h4>Problem</h4>
                    <p>{tab.problem}</p>
                  </div>
                  <div className="content-item">
                    <h4>Our Solution</h4>
                    <p>{tab.solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="contact-section" id="kontakt">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="contact-heading">
              Contact<span className="accent">&#8203;</span>
            </h2>
            <p className="contact-subheading">
              If you&apos;d like to work with us or have questions about our services, please
              contact us &ndash; we&apos;ll get back to you as soon as possible and discuss
              everything further in person.
            </p>
          </div>

          <div className="contact-grid">
            <div className="contact-info">
              <h3>Contact Information</h3>

              <div className="contact-detail">
                <i className="fas fa-map-marker-alt contact-icon"></i>
                <div className="contact-text">
                  <h4>Location</h4>
                  <p>
                    Lahore, Pakistan <br />
                    E359 Gulberg
                  </p>
                </div>
              </div>

              <div className="contact-detail">
                <i className="fas fa-envelope contact-icon"></i>
                <div className="contact-text">
                  <h4>E-mail</h4>
                  <a href="mailto:banodigitalhub@gmail.com">banodigitalhub@gmail.com</a>
                </div>
              </div>

              <div className="contact-detail">
                <i className="fas fa-phone contact-icon"></i>
                <div className="contact-text">
                  <h4>Telephone number</h4>
                  <a href="tel:+923294590286">+92 329 4590 286</a>
                </div>
              </div>
            </div>

            <div className="contact-form">
              <h3>Write to us</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <Footer onHome />
      <CookieConsent />
      <HomeInteractions />
    </>
  );
}
