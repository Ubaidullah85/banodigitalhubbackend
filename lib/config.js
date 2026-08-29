/** Single source of truth for the course dates shown on the page and in email. */
export const COURSE = {
  name: 'Bano Digital Hub — Paid Freelancing Course',
  classesStart: '7 September 2026',
  interviewDate: '3 September 2026',
  interviewWindow: '12:00 PM to 7:00 PM',
  seats: 30,
  durationWeeks: 6,
  monthlyTarget: 'PKR 30,000',
  supportEmail: 'banodigitalhub@gmail.com',
  supportPhone: '+92 329 4590 286',
  // The raw file in public/ — read from disk when the mail is attached.
  guidePath: '/AI-Web-Development-Course-Enrollment-Guide.pdf',
  // The link we hand out. /guide forces a real download instead of opening
  // the browser's PDF viewer, and keeps a tidy URL in the email.
  guideDownloadPath: '/guide',
  guideFilename: 'Bano-Digital-Hub-Enrollment-Guide.pdf',
};

export const STUDY_LEVELS = [
  'Matric / O-Levels',
  'Intermediate / FSc / A-Levels',
  'Bachelors (BS / BSc)',
  'Masters (MS / MSc)',
  'Diploma',
  'Currently not studying',
];

export const GENDERS = ['Male', 'Female', 'Other'];
