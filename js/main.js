/**
 * main.js — Entry point. Initializes shared chrome and the current page.
 *
 * HOW TO ADD A NEW PAGE:
 *  1. Create the HTML file (e.g. courses.html) with data-page="courses".
 *  2. Add the nav entry to SITE.nav in data.js.
 *  3. Write an init function below (e.g. initCourses).
 *  4. Register it in the PAGES map.
 */

/* ── Shared chrome ────────────────────────────────────────────────────────── */

const initNav = () => {
  const placeholder = document.getElementById('site-nav');
  if (placeholder) placeholder.replaceWith(buildNav(SITE.nav, getCurrentPage()));
};

const initFooter = () => {
  const container = document.getElementById('site-footer-inner');
  if (container) container.append(buildFooter(SITE.handle, SITE.social));
};


/* ── Page: Home ───────────────────────────────────────────────────────────── */

const initHome = () => {
  const grid = document.getElementById('projects-preview');
  if (!grid) return;
  SITE.projects.forEach(project => grid.append(buildProjectCard(project)));
};


/* ── Page: Projects ───────────────────────────────────────────────────────── */

const initProjects = () => {
  const grid = document.getElementById('all-projects');
  if (!grid) return;
  SITE.projects.forEach(project => grid.append(buildProjectCard(project)));
};


/* ── Page: About ──────────────────────────────────────────────────────────── */

const initAbout = () => {
  const headlineEl = document.getElementById('about-headline');
  if (headlineEl) headlineEl.textContent = SITE.about.headline;

  const bioEl = document.getElementById('about-bio');
  if (bioEl) bioEl.append(buildBio(SITE.about.bio));

  const timelineEl = document.getElementById('timeline-list');
  if (timelineEl) {
    SITE.about.timeline.forEach(entry => timelineEl.append(buildTimelineEntry(entry)));
  }
};


/* ── Page: Contact ────────────────────────────────────────────────────────── */

const initContact = () => {
  const formContainer = document.getElementById('contact-form-container');
  if (formContainer) formContainer.append(buildContactForm(SITE.contact));

  const infoContainer = document.getElementById('contact-info-container');
  if (infoContainer) infoContainer.append(buildContactInfo(SITE.social));
};


/* ── Page registry ────────────────────────────────────────────────────────── */
// Add new pages here. Key = data-page value on <body>.

const PAGES = {
  home:     initHome,
  projects: initProjects,
  about:    initAbout,
  contact:  initContact,
};


/* ── Bootstrap ────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initFooter();

  const pageInit = PAGES[getCurrentPage()];
  if (pageInit) pageInit();
});
