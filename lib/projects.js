import { getProjects, isDbConfigured } from './mongodb';

/** The four projects that shipped with the original static site. */
export const DEFAULT_PROJECTS = [
  {
    _id: 'default-1',
    title: 'Social Media Campaign',
    description:
      'A comprehensive social media strategy that increased engagement by 240% for a lifestyle brand.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    alt: 'Marketing Campaign',
    tags: ['Social Media', 'Strategy', 'Content'],
    link: '#',
  },
  {
    _id: 'default-2',
    title: 'Brand Identity Design',
    description:
      'Complete rebranding for a tech startup including logo, visual identity and brand guidelines.',
    image:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    alt: 'Brand Identity',
    tags: ['Branding', 'Design', 'Identity'],
    link: '#',
  },
  {
    _id: 'default-3',
    title: 'Talent Recruitment',
    description:
      'Developed a recruitment strategy that reduced hiring time by 35% while improving candidate quality.',
    image:
      'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    alt: 'Recruitment Strategy',
    tags: ['Recruitment', 'HR', 'Strategy'],
    link: '#',
  },
  {
    _id: 'default-4',
    title: 'E-commerce Growth',
    description:
      'Increased online sales by 180% through optimized digital marketing and conversion strategies.',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    alt: 'E-commerce Strategy',
    tags: ['E-commerce', 'Marketing', 'Growth'],
    link: '#',
  },
];

/**
 * Projects for the home carousel. Falls back to DEFAULT_PROJECTS whenever the
 * database is unavailable or still empty, so the page never renders blank.
 */
export async function listProjects() {
  if (!isDbConfigured()) return DEFAULT_PROJECTS;
  try {
    const col = await getProjects();
    const docs = await col.find({}).sort({ order: 1, createdAt: -1 }).limit(24).toArray();
    if (!docs.length) return DEFAULT_PROJECTS;
    return docs.map((d) => ({
      ...d,
      _id: String(d._id),
      tags: Array.isArray(d.tags) ? d.tags : [],
    }));
  } catch (err) {
    console.error('[projects] falling back to defaults:', err.message);
    return DEFAULT_PROJECTS;
  }
}
