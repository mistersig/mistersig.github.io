/**
 * data.js — Single source of truth for all site content.
 *
 * HOW TO UPDATE:
 *  - Change your name/tagline: edit the top-level fields below.
 *  - Add a project: push a new object into SITE.projects.
 *  - Add a page: add an entry to SITE.nav and create the HTML file.
 *  - Update social links: edit SITE.social.
 *  - Update contact form endpoint: edit SITE.contact.formAction.
 */

// eslint-disable-next-line no-unused-vars
const SITE = Object.freeze({
  /* ── Identity ─────────────────────────────────────────────────────────── */
  handle: "MisterSig",
  tagline: "Developer. Designer. Explorer.",
  description:
    "Portfolio of MisterSig — developer, designer, and digital explorer.",

  /* ── Navigation ───────────────────────────────────────────────────────── */
  // Each entry becomes a nav link. `id` must match the page's data-page attribute.
  nav: [
    { id: "home", label: "Home", href: "index.html" },
    { id: "projects", label: "Projects", href: "projects.html" },
    { id: "about", label: "About", href: "about.html" },
    { id: "contact", label: "Contact", href: "contact.html" },
  ],

  /* ── Social / External Links ──────────────────────────────────────────── */
  social: [
    { id: "github", label: "GitHub", href: "https://github.com/mistersig" },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/sigfridogomez/",
    },
    { id: "email", label: "Email", href: "contact.html" },
  ],

  /* ── Projects ─────────────────────────────────────────────────────────── */
  // To add a project: copy one object and fill in the fields.
  // `status` controls the badge color: 'Live' | 'In Progress' | 'Ongoing' | 'Archived'
  projects: [
    {
      id: "gis-modules",
      number: "01",
      title: "UPP 461: Intro to GIS",
      year: "2026",
      status: "Live",
      tags: ["GIS", "Education", "Web"],
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.",
      links: [
        { label: "View Project", href: "#", primary: true },
        { label: "GitHub", href: "#", primary: false },
      ],
    },
    {
      id: "mini-map",
      number: "02",
      title: "Mini Map Explorer",
      year: "2026",
      status: "In Progress",
      tags: ["Mapping", "Data Viz", "JavaScript"],
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae. Proin vel ante a orci tempus eleifend ut et magna.",
      links: [
        { label: "Live Demo", href: "#", primary: true },
        { label: "GitHub", href: "#", primary: false },
      ],
    },
    {
      id: "ui-toolkit",
      number: "03",
      title: "UI Toolkit Notes",
      year: "2026",
      status: "Ongoing",
      tags: ["UI", "Design Systems", "CSS"],
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin gravida nibh vel velit auctor aliquet. Aenean sollicitudin, lorem quis bibendum auctor, nisi elit consequat ipsum, nec sagittis sem nibh id elit.",
      links: [
        { label: "View Notes", href: "#", primary: true },
        { label: "GitHub", href: "#", primary: false },
      ],
    },
  ],

  /* ── About ────────────────────────────────────────────────────────────── */
  about: {
    headline: "Building at the intersection of data, design, and technology.",
    // Each string becomes a paragraph.
    bio: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ],
    // Timeline entries, most recent first.
    timeline: [
      {
        year: "2026",
        event: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      },
      {
        year: "2025",
        event: "Pellentesque habitant morbi tristique senectus et netus.",
      },
      {
        year: "2024",
        event: "Vestibulum tortor quam, feugiat vitae, ultricies eget.",
      },
      {
        year: "2023",
        event: "Proin gravida nibh vel velit auctor aliquet aenean.",
      },
    ],
  },

  /* ── Contact ──────────────────────────────────────────────────────────── */
  contact: {
    headline: "Start a conversation.",
    intro:
      "Have a project in mind or just want to connect? Send a message and I'll get back to you.",
    // Sign up at https://formspree.io, create a form, and paste your endpoint here.
    formAction: "https://formspree.io/f/xwvryddy",
  },
});
